<?php

namespace App\Http\Controllers;

use App\Enums\LeagueDivision;
use App\Enums\LeagueTier;
use App\Models\LeagueMatch;
use App\Models\Race;
use App\Models\Streamer;
use App\Support\CdnUrls;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $race = Race::active()
            ->with('streamers.primaryAccount')
            ->first();

        if ($race) {
            return $this->renderWithRace($race, isLast: false);
        }

        $upcoming = Race::where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->with('streamers.primaryAccount')
            ->first();

        $last = Race::where('ends_at', '<', now())
            ->latest('ends_at')
            ->with('streamers.primaryAccount')
            ->first();

        if ($last) {
            return $this->renderWithRace($last, isLast: true, upcoming: $upcoming);
        }

        return Inertia::render('home', [
            'race' => null,
            'upcoming' => $upcoming ? $this->buildUpcomingData($upcoming) : null,
            'last' => null,
        ]);
    }

    private function renderWithRace(Race $race, bool $isLast, ?Race $upcoming = null): Response
    {
        $streamers = $race->streamers;
        $accountIds = $streamers->pluck('primaryAccount.id')->filter()->values()->all();
        $leaderboard = $this->buildLeaderboard($race, $streamers, $accountIds);
        $fastData = [
            'id' => $race->id,
            'name' => $race->name,
            'starts_at' => $race->starts_at->toISOString(),
            'ends_at' => $race->ends_at->toISOString(),
            'stream_url' => $race->stream_url,
            'leaderboard' => $leaderboard,
        ];

        return Inertia::render('home', [
            'race' => $isLast ? null : $fastData,
            'last' => $isLast ? $fastData : null,
            'upcoming' => $upcoming ? $this->buildUpcomingData($upcoming) : null,
            // Each group triggers a separate parallel request from the browser.
            // 'feed' resolves fast (single query), 'lp' is medium, 'spotlight' is heaviest.
            'race_matches' => Inertia::defer(fn () => $this->buildMatchFeed($race, $accountIds), 'feed'),
            'race_stats' => Inertia::defer(fn () => $this->buildRaceStatsDeferred($race, $accountIds, $leaderboard), 'feed'),
            'race_lp_series' => Inertia::defer(fn () => $this->buildLpSeries($race, $streamers), 'lp'),
            'race_spotlight' => Inertia::defer(fn () => $this->buildStreamersSpotlight($race, $streamers, $leaderboard), 'spotlight'),
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Streamer>  $streamers
     * @param  array<int, int>  $accountIds
     * @return array<int, array<string, mixed>>
     */
    private function buildLeaderboard(Race $race, $streamers, array $accountIds): array
    {
        $stats = LeagueMatch::whereIn('league_account_id', $accountIds)
            ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at])
            ->whereNotNull('is_win')
            ->selectRaw('league_account_id, SUM(CASE WHEN is_win THEN 1 ELSE 0 END) as wins, COUNT(*) as total')
            ->groupBy('league_account_id')
            ->get()
            ->keyBy('league_account_id');

        // DISTINCT ON (PostgreSQL): returns the single latest ranked match per account
        // without loading every historical match into PHP memory.
        $latestMatches = LeagueMatch::select(DB::raw('DISTINCT ON (league_account_id) league_matches.*'))
            ->whereIn('league_account_id', $accountIds)
            ->whereNotNull('tier')
            ->orderBy('league_account_id')
            ->orderBy('game_start_at', 'desc')
            ->get()
            ->keyBy('league_account_id');

        return $streamers
            ->map(function (Streamer $streamer) use ($stats, $latestMatches) {
                $account = $streamer->primaryAccount;
                $match = $account ? $latestMatches->get($account->id) : null;
                $stat = $account ? $stats->get($account->id) : null;

                $tier = $match?->tier;
                $rank = $match?->rank;
                $points = $match?->points;

                $wins = (int) ($stat?->wins ?? 0);
                $total = (int) ($stat?->total ?? 0);
                $losses = $total - $wins;

                $participant = $match?->participant($account?->puuid);
                $championId = $participant?->champion_id ?? 0;

                return [
                    'streamer_id' => $streamer->id,
                    'name' => $streamer->name,
                    'platform' => $streamer->streaming_platform?->value,
                    'stream_url' => $streamer->stream_url,
                    'account_display_name' => $account?->display_name ?? '—',
                    'tier' => $tier,
                    'rank' => $rank,
                    'points' => $points,
                    'total_lp' => $this->computeTotalLp($tier, $rank, $points),
                    'wins' => $wins,
                    'losses' => $losses,
                    'win_rate' => $total > 0 ? round($wins / $total * 100) : 0,
                    'champion_icon_url' => CdnUrls::championIcon($championId),
                ];
            })
            ->sortByDesc('total_lp')
            ->values()
            ->all();
    }

    /**
     * @param  array<int, int>  $accountIds
     * @return array<int, array<string, mixed>>
     */
    private function buildMatchFeed(Race $race, array $accountIds): array
    {
        return LeagueMatch::whereIn('league_account_id', $accountIds)
            ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at])
            ->with('leagueAccount.streamer')
            ->latest('game_start_at')
            ->limit(20)
            ->get()
            ->map(fn (LeagueMatch $match) => $this->buildMatchRow(
                $match,
                $match->leagueAccount?->puuid,
                $match->leagueAccount?->streamer?->name ?? '—',
                $match->leagueAccount?->streamer?->id,
            ))
            ->all();
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Streamer>  $streamers
     * @return array<int, array<string, mixed>>
     */
    private function buildLpSeries(Race $race, $streamers): array
    {
        // Build a map of account_id → streamer name, skipping streamer without an account.
        $accountIdToName = $streamers
            ->filter(fn (Streamer $s) => $s->primaryAccount !== null)
            ->mapWithKeys(fn (Streamer $s) => [$s->primaryAccount->id => $s->name]);

        if ($accountIdToName->isEmpty()) {
            return [];
        }

        // Single query for all streamers — select only the columns needed, skip the heavy `data` blob.
        $allMatches = LeagueMatch::whereIn('league_account_id', $accountIdToName->keys())
            ->whereNotNull('tier')
            ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at])
            ->orderBy('game_start_at')
            ->select(['league_account_id', 'tier', 'rank', 'points', 'game_start_at', 'game_end_at'])
            ->get()
            ->groupBy('league_account_id');

        $lpSeries = [];
        foreach ($accountIdToName as $accountId => $name) {
            $matches = $allMatches->get($accountId);
            if (! $matches || $matches->isEmpty()) {
                continue;
            }

            $lpSeries[] = [
                'name' => $name,
                'data' => $matches->map(fn (LeagueMatch $m) => [
                    't' => ($m->game_end_at ?? $m->game_start_at)->toISOString(),
                    'lp' => $this->computeTotalLp($m->tier, $m->rank, $m->points),
                ])->values()->all(),
            ];
        }

        return $lpSeries;
    }

    /**
     * @param  array<int, int>  $accountIds
     * @param  array<int, array<string, mixed>>  $leaderboard
     * @return array<string, mixed>
     */
    private function buildRaceStatsDeferred(Race $race, array $accountIds, array $leaderboard): array
    {
        $matchFeed = $this->buildMatchFeed($race, $accountIds);

        return $this->buildRaceStats($matchFeed, $leaderboard);
    }

    /**
     * Map a LeagueMatch to a match feed row.
     *
     * @return array<string, mixed>
     */
    private function buildMatchRow(
        LeagueMatch $match,
        ?string $puuid,
        string $streamerName,
        ?int $streamerId,
    ): array {
        $participant = $match->participant($puuid);
        $championId = $participant?->champion_id ?? 0;
        $kda = $participant ? $participant->kills.'/'.$participant->deaths.'/'.$participant->assists : '—';
        $cs = $participant ? ($participant->total_minions_killed + $participant->neutral_minions_killed) : null;
        $damage = $participant?->total_damage_dealt_to_champions ?? null;
        $duration = $match->data?->info?->game_duration ?? null;

        return [
            'id' => $match->id,
            'streamer_id' => $streamerId,
            'streamer_name' => $streamerName,
            'champion_name' => $participant?->champion_name ?? '—',
            'champion_icon_url' => CdnUrls::championIcon($championId),
            'is_win' => $match->is_win,
            'kda' => $kda,
            'kills' => $participant?->kills ?? null,
            'deaths' => $participant?->deaths ?? null,
            'assists' => $participant?->assists ?? null,
            'tier' => $match->tier,
            'rank' => $match->rank,
            'points' => $match->points,
            'game_start_at' => $match->game_start_at?->toISOString(),
            'duration' => $duration,
            'cs' => $cs,
            'damage' => $damage,
            'participants' => $this->buildParticipantPreviews($match, $puuid),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildParticipantPreviews(LeagueMatch $match, ?string $puuid): array
    {
        $participants = $match->data?->info?->participants ?? collect();

        return collect($participants)
            ->map(fn ($p) => [
                'champion_icon_url' => CdnUrls::championIcon($p->champion_id ?? 0),
                'champion_name' => $p->champion_name ?? '—',
                'team_id' => $p->team_id,
                'is_tracked' => $puuid !== null && $p->puuid === $puuid,
            ])
            ->values()
            ->all();
    }

    /**
     * Compute aggregate race statistics from the match feed and leaderboard.
     *
     * @param  array<int, array<string, mixed>>  $matchFeed
     * @param  array<int, array<string, mixed>>  $leaderboard
     * @return array<string, mixed>
     */
    private function buildRaceStats(array $matchFeed, array $leaderboard): array
    {
        $matches = collect($matchFeed)->filter(fn ($m) => $m['kills'] !== null);

        $totalGames = $matches->count();
        $totalKills = $matches->sum('kills');
        $totalAssists = $matches->sum('assists');
        $avgDuration = $totalGames > 0 ? (int) round($matches->avg('duration') ?? 0) : 0;
        $avgDamage = $totalGames > 0 ? (int) round($matches->whereNotNull('damage')->avg('damage') ?? 0) : 0;
        $avgCs = $totalGames > 0 ? round($matches->whereNotNull('cs')->avg('cs') ?? 0, 1) : 0;

        $mostPlayed = $matches
            ->filter(fn ($m) => $m['champion_name'] !== '—')
            ->groupBy('champion_name')
            ->map(fn ($group, $name) => [
                'name' => $name,
                'icon_url' => $group->first()['champion_icon_url'],
                'games' => $group->count(),
                'wins' => $group->where('is_win', true)->count(),
            ])
            ->sortByDesc('games')
            ->first();

        $highestDamage = $matches->whereNotNull('damage')->sortByDesc('damage')->first();

        $lb = collect($leaderboard);
        $bestWr = $lb->filter(fn ($r) => ($r['wins'] + $r['losses']) >= 3)->sortByDesc('win_rate')->first();
        $mostWins = $lb->sortByDesc('wins')->first();

        return [
            'total_games' => $totalGames,
            'total_kills' => $totalKills,
            'total_assists' => $totalAssists,
            'avg_duration' => $avgDuration,
            'avg_damage' => $avgDamage,
            'avg_cs' => $avgCs,
            'most_played_champion' => $mostPlayed ? [
                'name' => $mostPlayed['name'],
                'icon_url' => $mostPlayed['icon_url'],
                'games' => $mostPlayed['games'],
                'wins' => $mostPlayed['wins'],
            ] : null,
            'highest_damage_game' => $highestDamage ? [
                'streamer_name' => $highestDamage['streamer_name'],
                'champion_name' => $highestDamage['champion_name'],
                'champion_icon_url' => $highestDamage['champion_icon_url'],
                'damage' => $highestDamage['damage'],
            ] : null,
            'best_wr' => $bestWr ? [
                'name' => $bestWr['name'],
                'win_rate' => $bestWr['win_rate'],
                'wins' => $bestWr['wins'],
                'losses' => $bestWr['losses'],
            ] : null,
            'most_wins' => $mostWins ? [
                'name' => $mostWins['name'],
                'wins' => $mostWins['wins'],
                'champion_icon_url' => $mostWins['champion_icon_url'],
            ] : null,
        ];
    }

    /**
     * Build per-streamer spotlight data (stats + champion stats for race period).
     *
     * @param  \Illuminate\Support\Collection<int, Streamer>  $streamers
     * @param  array<int, array<string, mixed>>  $leaderboard
     * @return array<int, array<string, mixed>>
     */
    private function buildStreamersSpotlight(Race $race, $streamers, array $leaderboard): array
    {
        // Map account_id → Streamer, skipping streamers without a linked account.
        $accountToStreamer = $streamers
            ->filter(fn (Streamer $s) => $s->primaryAccount !== null)
            ->mapWithKeys(fn (Streamer $s) => [$s->primaryAccount->id => $s]);

        $lbByStreamerId = collect($leaderboard)->keyBy('streamer_id');
        $result = [];

        if ($accountToStreamer->isEmpty()) {
            return $result;
        }

        // Single query: window function ranks each account's matches newest-first,
        // then we keep only the top 30 per account — no N+1 loop needed.
        $inner = DB::table('league_matches')
            ->selectRaw('*, ROW_NUMBER() OVER (PARTITION BY league_account_id ORDER BY game_start_at DESC) AS rn')
            ->whereIn('league_account_id', $accountToStreamer->keys())
            ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at]);

        $allMatchRows = LeagueMatch::fromSub($inner, 'ranked')
            ->where('rn', '<=', 30)
            ->get()
            ->groupBy('league_account_id');

        foreach ($accountToStreamer as $accountId => $streamer) {
            $account = $streamer->primaryAccount;

            $matches = ($allMatchRows->get($accountId) ?? collect())
                ->map(fn (LeagueMatch $m) => $this->buildMatchRow($m, $account->puuid, $streamer->name, $streamer->id))
                ->all();

            $lb = $lbByStreamerId->get($streamer->id);

            $result[] = [
                'streamer_id' => $streamer->id,
                'name' => $streamer->name,
                'stream_url' => $streamer->stream_url,
                'tier' => $lb['tier'] ?? null,
                'rank' => $lb['rank'] ?? null,
                'points' => $lb['points'] ?? null,
                'total_lp' => $lb['total_lp'] ?? 0,
                'wins' => $lb['wins'] ?? 0,
                'losses' => $lb['losses'] ?? 0,
                'win_rate' => $lb['win_rate'] ?? 0,
                'champion_icon_url' => $lb['champion_icon_url'] ?? null,
                'stats' => $this->buildSpotlightStats($matches),
                'champion_stats' => $this->buildSpotlightChampionStats($matches),
            ];
        }

        usort($result, fn ($a, $b) => $b['total_lp'] - $a['total_lp']);

        return $result;
    }

    /**
     * @param  array<int, array<string, mixed>>  $matches
     * @return array<string, mixed>|null
     */
    private function buildSpotlightStats(array $matches): ?array
    {
        $col = collect($matches)->filter(fn ($m) => $m['kills'] !== null && ($m['duration'] ?? 0) > 0);

        if ($col->isEmpty()) {
            return null;
        }

        $totalKills = $col->sum('kills');
        $totalDeaths = $col->sum('deaths');
        $totalAssists = $col->sum('assists');
        $avgKda = $totalDeaths > 0
            ? round(($totalKills + $totalAssists) / $totalDeaths, 2)
            : (float) ($totalKills + $totalAssists);

        $avgDamage = (int) round($col->whereNotNull('damage')->avg('damage') ?? 0);
        $avgCsPerMin = round(
            $col->filter(fn ($m) => $m['cs'] !== null)
                ->avg(fn ($m) => $m['cs'] / ($m['duration'] / 60)) ?? 0,
            1,
        );
        $avgDuration = (int) round($col->avg('duration') ?? 0);

        $streak = 0;
        $maxStreak = 0;
        foreach ($col->pluck('is_win') as $win) {
            if ($win === true) {
                $streak++;
                $maxStreak = max($maxStreak, $streak);
            } else {
                $streak = 0;
            }
        }

        $bestGame = $col->filter(fn ($m) => $m['deaths'] !== null)
            ->sortByDesc(fn ($m) => $m['deaths'] > 0
                ? ($m['kills'] + $m['assists']) / $m['deaths']
                : ($m['kills'] + $m['assists']))
            ->first();

        return [
            'avg_kda' => $avgKda,
            'avg_damage' => $avgDamage,
            'avg_cs_per_min' => $avgCsPerMin,
            'avg_duration' => $avgDuration,
            'longest_win_streak' => $maxStreak,
            'best_kda_game' => $bestGame ? [
                'champion_name' => $bestGame['champion_name'],
                'champion_icon_url' => $bestGame['champion_icon_url'],
                'kda' => $bestGame['kda'],
            ] : null,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $matches
     * @return array<int, array<string, mixed>>
     */
    private function buildSpotlightChampionStats(array $matches): array
    {
        return collect($matches)
            ->filter(fn ($m) => $m['champion_name'] !== '—' && $m['kills'] !== null)
            ->groupBy('champion_name')
            ->map(function ($group, string $name) {
                $wins = $group->where('is_win', true)->count();
                $total = $group->count();
                $totalKills = $group->sum('kills');
                $totalDeaths = $group->sum('deaths');
                $totalAssists = $group->sum('assists');
                $avgKda = $totalDeaths > 0
                    ? round(($totalKills + $totalAssists) / $totalDeaths, 2)
                    : (float) ($totalKills + $totalAssists);

                return [
                    'champion_name' => $name,
                    'champion_icon_url' => $group->first()['champion_icon_url'],
                    'games' => $total,
                    'wins' => $wins,
                    'losses' => $total - $wins,
                    'win_rate' => $total > 0 ? (int) round($wins / $total * 100) : 0,
                    'avg_kda' => $avgKda,
                ];
            })
            ->sortByDesc('games')
            ->take(3)
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildUpcomingData(Race $race): array
    {
        return [
            'name' => $race->name,
            'starts_at' => $race->starts_at->toISOString(),
            'streamers' => $race->streamers->map(fn (Streamer $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'platform' => $s->streaming_platform?->value,
                'stream_url' => $s->stream_url,
                'account_display_name' => $s->primaryAccount?->display_name,
            ])->values()->all(),
        ];
    }

    /**
     * Convert tier, division, and LP points into a single comparable total-LP integer.
     */
    private function computeTotalLp(?string $tier, ?string $division, ?int $points): int
    {
        if (! $tier) {
            return 0;
        }

        return (LeagueTier::fromString($tier)?->lpBase() ?? 0)
            + (LeagueDivision::tryFrom($division ?? 'IV')?->lpOffset() ?? 0)
            + ($points ?? 0);
    }
}

<?php

namespace App\Http\Controllers;

use App\Enums\LeagueDivision;
use App\Enums\LeagueTier;
use App\Models\LeagueMatch;
use App\Models\Streamer;
use Inertia\Inertia;
use Inertia\Response;
use Phizz\Facades\Phizz;

class StreamerController extends Controller
{
    public function show(Streamer $streamer): Response
    {
        $account = $streamer->primaryAccount;

        $latestMatch = $account
            ? LeagueMatch::where('league_account_id', $account->id)
                ->whereNotNull('tier')
                ->latest('game_start_at')
                ->first()
            : null;

        $tier = $latestMatch?->tier;
        $rank = $latestMatch?->rank;
        $points = $latestMatch?->points;

        $recentMatches = $account
            ? LeagueMatch::where('league_account_id', $account->id)
                ->latest('game_start_at')
                ->limit(20)
                ->get()
                ->map(fn (LeagueMatch $match) => $this->buildMatchRow($match, $account->puuid, $streamer->name, $streamer->id))
                ->all()
            : [];

        $matchCollection = collect($recentMatches);
        $playedMatches = $matchCollection->whereNotNull('is_win');
        $wins = $playedMatches->where('is_win', true)->count();
        $losses = $playedMatches->where('is_win', false)->count();
        $totalPlayed = $wins + $losses;
        $winRate = $totalPlayed > 0 ? (int) round($wins / $totalPlayed * 100) : 0;

        $championStats = $account
            ? $this->buildChampionStats($account->id, $account->puuid)
            : [];

        $lpHistory = $account
            ? LeagueMatch::where('league_account_id', $account->id)
                ->whereNotNull('tier')
                ->orderBy('game_start_at')
                ->get()
                ->map(fn (LeagueMatch $m) => [
                    't' => ($m->game_end_at ?? $m->game_start_at)->toISOString(),
                    'lp' => $this->computeTotalLp($m->tier, $m->rank, $m->points),
                ])
                ->values()
                ->all()
            : [];

        return Inertia::render('streamer', [
            'streamer' => [
                'id' => $streamer->id,
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
                'win_rate' => $winRate,
                'champion_stats' => $championStats,
                'stats' => $this->buildStreamerStats($recentMatches),
            ],
            'recent_matches' => $recentMatches,
            'lp_history' => $lpHistory,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildMatchRow(LeagueMatch $match, string $puuid, string $streamerName, int $streamerId): array
    {
        $participant = $match->participant($puuid);
        $championId = $participant?->champion_id ?? 0;
        $kda = $participant ? $participant->kills.'/'.$participant->deaths.'/'.$participant->assists : '—';
        $cs = $participant ? ($participant->total_minions_killed + $participant->neutral_minions_killed) : null;
        $damage = $participant?->total_damage_dealt_to_champions ?? null;
        $duration = $match->data?->info?->game_duration ?? null;

        $iconUrl = null;
        if ($championId > 0) {
            $iconUrl = Phizz::cdragon()->lol->championSummary($championId)->squarePortraitUrl();
        }

        return [
            'id' => $match->id,
            'streamer_id' => $streamerId,
            'streamer_name' => $streamerName,
            'champion_name' => $participant?->champion_name ?? '—',
            'champion_icon_url' => $iconUrl,
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
    private function buildParticipantPreviews(LeagueMatch $match, string $puuid): array
    {
        $participants = $match->data?->info?->participants ?? collect();
        $duration = $match->data?->info?->game_duration ?? 0;

        $blueKills = collect($participants)->where('team_id', 100)->sum('kills');
        $redKills = collect($participants)->where('team_id', 200)->sum('kills');

        return collect($participants)
            ->map(function ($p) use ($puuid, $duration, $blueKills, $redKills) {
                $teamKills = $p->team_id === 100 ? $blueKills : $redKills;
                $cs = $p->total_minions_killed + $p->neutral_minions_killed;

                $itemSlots = [$p->item_0, $p->item_1, $p->item_2, $p->item_3, $p->item_4, $p->item_5];
                $items = array_map(
                    fn ($id) => $id > 0 ? Phizz::cdragon()->lol->items($id)?->iconUrl() : null,
                    $itemSlots,
                );

                return [
                    'champion_icon_url' => $p->champion_id > 0
                        ? Phizz::cdragon()->lol->championSummary($p->champion_id)->squarePortraitUrl()
                        : null,
                    'champion_name' => $p->champion_name ?? '—',
                    'summoner_name' => $p->riot_id_game_name ?: ($p->summoner_name ?: '—'),
                    'team_id' => $p->team_id,
                    'is_tracked' => $p->puuid === $puuid,
                    'kills' => $p->kills,
                    'deaths' => $p->deaths,
                    'assists' => $p->assists,
                    'kill_participation' => $teamKills > 0
                        ? (int) round(($p->kills + $p->assists) / $teamKills * 100)
                        : 0,
                    'cs' => $cs,
                    'cs_per_min' => $duration > 0 ? round($cs / ($duration / 60), 1) : null,
                    'damage' => $p->total_damage_dealt_to_champions,
                    'gold' => $p->gold_earned,
                    'wards_placed' => $p->wards_placed,
                    'wards_killed' => $p->wards_killed,
                    'items' => $items,
                    'trinket_url' => $p->item_6 > 0
                        ? Phizz::cdragon()->lol->items($p->item_6)?->iconUrl()
                        : null,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildChampionStats(int $accountId, string $puuid): array
    {
        $matches = LeagueMatch::where('league_account_id', $accountId)
            ->latest('game_start_at')
            ->limit(50)
            ->get();

        return $matches
            ->map(fn (LeagueMatch $m) => [
                'participant' => $m->participant($puuid),
                'is_win' => $m->is_win,
            ])
            ->filter(fn ($row) => $row['participant'] !== null)
            ->groupBy(fn ($row) => $row['participant']->champion_name ?? '—')
            ->filter(fn ($rows, $name) => $name !== '—')
            ->map(function ($rows, string $champName) {
                $first = $rows->first()['participant'];
                $wins = $rows->where('is_win', true)->count();
                $total = $rows->count();
                $losses = $rows->where('is_win', false)->count();

                $totalKills = $rows->sum(fn ($r) => $r['participant']->kills);
                $totalDeaths = $rows->sum(fn ($r) => $r['participant']->deaths);
                $totalAssists = $rows->sum(fn ($r) => $r['participant']->assists);
                $avgKda = $totalDeaths > 0
                    ? round(($totalKills + $totalAssists) / $totalDeaths, 2)
                    : (float) ($totalKills + $totalAssists);

                $iconUrl = $first->champion_id > 0
                    ? Phizz::cdragon()->lol->championSummary($first->champion_id)->squarePortraitUrl()
                    : null;

                return [
                    'champion_name' => $champName,
                    'champion_icon_url' => $iconUrl,
                    'games' => $total,
                    'wins' => $wins,
                    'losses' => $losses,
                    'win_rate' => $total > 0 ? (int) round($wins / $total * 100) : 0,
                    'avg_kda' => $avgKda,
                ];
            })
            ->sortByDesc('games')
            ->take(5)
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $recentMatches
     * @return array<string, mixed>
     */
    private function buildStreamerStats(array $recentMatches): array
    {
        $matches = collect($recentMatches)->filter(fn ($m) => $m['kills'] !== null && ($m['duration'] ?? 0) > 0);

        if ($matches->isEmpty()) {
            return [];
        }

        $totalKills = $matches->sum('kills');
        $totalDeaths = $matches->sum('deaths');
        $totalAssists = $matches->sum('assists');
        $avgKda = $totalDeaths > 0
            ? round(($totalKills + $totalAssists) / $totalDeaths, 2)
            : (float) ($totalKills + $totalAssists);

        $avgDamage = (int) round($matches->whereNotNull('damage')->avg('damage') ?? 0);

        $avgCsPerMin = round(
            $matches->filter(fn ($m) => $m['cs'] !== null)
                ->avg(fn ($m) => $m['cs'] / ($m['duration'] / 60)) ?? 0,
            1
        );

        $avgDuration = (int) round($matches->avg('duration') ?? 0);

        // Longest win streak from most recent matches first
        $streak = 0;
        $maxStreak = 0;
        foreach ($matches->pluck('is_win') as $win) {
            if ($win === true) {
                $streak++;
                $maxStreak = max($maxStreak, $streak);
            } else {
                $streak = 0;
            }
        }

        $bestGame = $matches
            ->filter(fn ($m) => $m['deaths'] !== null)
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

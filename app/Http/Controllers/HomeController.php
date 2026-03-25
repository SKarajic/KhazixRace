<?php

namespace App\Http\Controllers;

use App\Enums\LeagueDivision;
use App\Enums\LeagueTier;
use App\Models\LeagueMatch;
use App\Models\Race;
use App\Models\Streamer;
use Inertia\Inertia;
use Inertia\Response;
use Phizz\Facades\Phizz;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $race = Race::active()
            ->with('streamers.primaryAccount')
            ->first();

        if ($race) {
            return Inertia::render('home', [
                'race' => $this->buildRaceData($race),
                'upcoming' => null,
                'last' => null,
            ]);
        }

        $upcoming = Race::where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->with('streamers.primaryAccount')
            ->first();

        $last = Race::where('ends_at', '<', now())
            ->latest('ends_at')
            ->with('streamers.primaryAccount')
            ->first();

        return Inertia::render('home', [
            'race' => null,
            'upcoming' => $upcoming ? [
                'name' => $upcoming->name,
                'starts_at' => $upcoming->starts_at->toISOString(),
                'streamers' => $upcoming->streamers->map(fn (Streamer $s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'platform' => $s->streaming_platform?->value,
                    'stream_url' => $s->stream_url,
                    'account_display_name' => $s->primaryAccount?->display_name,
                ])->values()->all(),
            ] : null,
            'last' => $last ? $this->buildRaceData($last) : null,
        ]);
    }

    /**
     * Build the full race data array for the frontend.
     *
     * @return array<string, mixed>
     */
    private function buildRaceData(Race $race): array
    {
        $streamers = $race->streamers;
        $accountIds = $streamers->pluck('primaryAccount.id')->filter()->values();

        // Race-period W/L stats keyed by league_account_id
        $stats = LeagueMatch::whereIn('league_account_id', $accountIds)
            ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at])
            ->whereNotNull('is_win')
            ->selectRaw('league_account_id, SUM(CASE WHEN is_win THEN 1 ELSE 0 END) as wins, COUNT(*) as total')
            ->groupBy('league_account_id')
            ->get()
            ->keyBy('league_account_id');

        // Latest ranked match per account, keyed by league_account_id
        $latestMatches = LeagueMatch::whereIn('league_account_id', $accountIds)
            ->whereNotNull('tier')
            ->orderBy('game_start_at', 'desc')
            ->get()
            ->groupBy('league_account_id')
            ->map(fn ($matches) => $matches->first());

        $leaderboard = $streamers
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
                ];
            })
            ->sortByDesc('total_lp')
            ->values()
            ->all();

        // LP series per streamer
        $lpSeries = [];
        foreach ($streamers as $streamer) {
            $account = $streamer->primaryAccount;
            if (! $account) {
                continue;
            }

            $matches = LeagueMatch::where('league_account_id', $account->id)
                ->whereNotNull('tier')
                ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at])
                ->orderBy('game_start_at')
                ->get();

            if ($matches->isEmpty()) {
                continue;
            }

            $lpSeries[] = [
                'name' => $streamer->name,
                'data' => $matches->map(fn (LeagueMatch $m) => [
                    't' => ($m->game_end_at ?? $m->game_start_at)->toISOString(),
                    'lp' => $this->computeTotalLp($m->tier, $m->rank, $m->points),
                ])->values()->all(),
            ];
        }

        // Match feed — last 20 across all race participants
        $matchFeed = LeagueMatch::whereIn('league_account_id', $accountIds)
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

        return [
            'id' => $race->id,
            'name' => $race->name,
            'starts_at' => $race->starts_at->toISOString(),
            'ends_at' => $race->ends_at->toISOString(),
            'stream_url' => $race->stream_url,
            'leaderboard' => $leaderboard,
            'lp_series' => $lpSeries,
            'matches' => $matchFeed,
        ];
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
                'champion_icon_url' => $p->champion_id > 0
                    ? Phizz::cdragon()->lol->championSummary($p->champion_id)->squarePortraitUrl()
                    : null,
                'champion_name' => $p->champion_name ?? '—',
                'team_id' => $p->team_id,
                'is_tracked' => $puuid !== null && $p->puuid === $puuid,
            ])
            ->values()
            ->all();
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

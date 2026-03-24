<?php

namespace App\Data;

use App\Models\LeagueAccount;
use App\Models\SyncLog;
use Carbon\CarbonImmutable;
use Phizz\Apis\Lol\MatchV5\Objects\MatchData;
use Spatie\LaravelData\Data;

/**
 * DTO representing the data required to create a LeagueMatch record.
 * Construct via {@see self::fromRiotMatch()} rather than directly.
 */
class LeagueMatchData extends Data
{
    /**
     * @param  int  $sync_log_id  ID of the SyncLog that produced this match.
     * @param  string  $match_id  Riot match ID (e.g. "EUW1_1234567890").
     * @param  array<string, mixed>  $data  Full matchV5 response payload.
     * @param  string|null  $tier  Ranked tier at sync time (e.g. "GRANDMASTER"); null for older matches.
     * @param  string|null  $rank  Division within the tier (e.g. "I"); null for older matches.
     * @param  int|null  $points  LP at sync time; null for older matches.
     * @param  bool|null  $is_win  Whether the tracked account won this match.
     * @param  CarbonImmutable|null  $game_start_at  Match start time.
     * @param  CarbonImmutable|null  $game_end_at  Match end time.
     */
    public function __construct(
        public readonly int $sync_log_id,
        public readonly string $match_id,
        public readonly array $data,
        public readonly ?string $tier,
        public readonly ?string $rank,
        public readonly ?int $points,
        public readonly ?bool $is_win,
        public readonly ?CarbonImmutable $game_start_at,
        public readonly ?CarbonImmutable $game_end_at,
    ) {}

    /**
     * Build a LeagueMatchData from raw Phizz API objects.
     *
     * @param  SyncLog  $log  The active sync log.
     * @param  MatchData  $match  matchV5 response object from Phizz.
     * @param  LeagueAccount  $account  the League of legends account.
     * @return LeagueMatchData the data object.
     */
    public static function fromRiotMatch(
        SyncLog $log,
        MatchData $match,
        LeagueAccount $account,
        bool $hasPoints = true,
    ): self {
        $rank = $hasPoints ? $account->current_rank : null;
        $participant = collect($match->info->participants)
            ->first(fn ($p) => $p->puuid === $account->puuid);

        return new self(
            sync_log_id: $log->id,
            match_id: $match->metadata->match_id,
            data: $match->toArray(),
            tier: $rank?->tier,
            rank: $rank?->rank,
            points: $rank?->league_points,
            is_win: $participant?->win,
            game_start_at: self::fromMs($match->info->game_start_timestamp ?? null),
            game_end_at: self::fromMs($match->info->game_end_timestamp ?? null),
        );
    }

    /**
     * Convert a Riot API millisecond epoch timestamp to a CarbonImmutable instance.
     *
     * @param  int|null  $ms  Milliseconds since Unix epoch, or null if absent.
     */
    private static function fromMs(?int $ms): ?CarbonImmutable
    {
        return $ms ? CarbonImmutable::createFromTimestampMs($ms) : null;
    }
}

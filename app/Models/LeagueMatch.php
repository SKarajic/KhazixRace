<?php

namespace App\Models;

use App\Enums\LeagueTier;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Phizz\Apis\Lol\MatchV5\Objects\MatchData;
use Phizz\Apis\Lol\MatchV5\Objects\ParticipantData;

/**
 * @property MatchData|mixed $data;
 */
class LeagueMatch extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'league_account_id',
        'sync_log_id',
        'match_id',
        'data',
        'tier',
        'rank',
        'points',
        'is_win',
        'game_start_at',
        'game_end_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'data' => MatchData::class,
        'game_start_at' => 'datetime',
        'game_end_at' => 'datetime',
        'is_win' => 'boolean',
    ];

    /**
     * Formatted rank string (e.g. "Grandmaster I (850 LP)"), or null if no snapshot exists.
     * Cached per model instance.
     *
     * @return Attribute<string|null, never>
     */
    protected function rankLabel(): Attribute
    {
        return Attribute::make(fn () => $this->tier
            ? LeagueTier::fromString($this->tier)?->label().' '.$this->rank.' ('.$this->points.' LP)'
            : null,
        )->shouldCache();
    }

    /**
     * Filament badge color derived from the tier, defaulting to "gray" when unranked.
     * Cached per model instance.
     *
     * @return Attribute<string, never>
     */
    protected function rankColor(): Attribute
    {
        return Attribute::make(
            fn () => LeagueTier::fromString($this->tier ?? '')?->filamentColor() ?? 'gray',
        )->shouldCache();
    }

    /**
     * Find and return the typed ParticipantData for the given PUUID, or null if not found.
     *
     * @param  string|null  $puuid  The player's PUUID to search for.
     */
    public function participant(?string $puuid): ?ParticipantData
    {
        if (! $puuid) {
            return null;
        }

        return $this->data?->info?->participants?->firstWhere('puuid', $puuid);
    }

    /**
     * The League account this match belongs to.
     *
     * @return BelongsTo<LeagueAccount, LeagueMatch>
     */
    public function leagueAccount(): BelongsTo
    {
        return $this->belongsTo(LeagueAccount::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Phizz\Apis\Lol\LeagueV4\Objects\LeagueEntryData;
use Phizz\Facades\Phizz;

class LeagueAccount extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'streamer_id',
        'game_name',
        'tag_line',
        'puuid',
        'platform',
        'is_primary',
    ];

    /**
     * Register model event hooks.
     *
     * - On creating: auto-sets is_primary when the streamer has no primary account yet.
     * - On saving: when is_primary is toggled on, demotes all other accounts for the same streamer.
     */
    protected static function booted(): void
    {
        static::creating(function (LeagueAccount $account) {
            $hasPrimary = static::where('streamer_id', $account->streamer_id)
                ->where('is_primary', true)
                ->exists();

            if (! $hasPrimary) {
                $account->is_primary = true;
            }
        });

        static::saving(function (LeagueAccount $account) {
            if ($account->isDirty('is_primary') && $account->is_primary) {
                static::where('streamer_id', $account->streamer_id)
                    ->where('id', '!=', $account->id)
                    ->update(['is_primary' => false]);
            }
        });
    }

    /**
     * Formatted Riot ID combining game name and tag line (e.g. "IAmTheWhite#EUW").
     * Cached per model instance.
     *
     * @return Attribute<string, never>
     */
    protected function displayName(): Attribute
    {
        return Attribute::make(
            get: fn () => "$this->game_name#$this->tag_line",
        )->shouldCache();
    }

    /**
     * Current ranked solo/duo entry fetched live from the Riot leagueV4 API.
     * Returns null if the account is unranked or has no solo queue entry.
     * Cached per model instance so the API is called at most once per job run.
     *
     * @return Attribute<LeagueEntryData|null>
     */
    protected function currentRank(): Attribute
    {
        return Attribute::make(fn (): ?LeagueEntryData => Phizz::lol($this->platform)
            ->leagueV4
            ->getLeagueEntriesByPuuid(encryptedPuuid: $this->puuid, force: true)
            ->where('queue_type', 'RANKED_SOLO_5x5')
            ->first(),
        )->shouldCache();
    }

    /**
     * The streamer who owns this account.
     *
     * @return BelongsTo<Streamer, LeagueAccount>
     */
    public function streamer(): BelongsTo
    {
        return $this->belongsTo(Streamer::class);
    }

    /**
     * All ranked matches recorded for this account.
     *
     * @return HasMany<LeagueMatch, LeagueAccount>
     */
    public function matches(): HasMany
    {
        return $this->hasMany(LeagueMatch::class);
    }

    /**
     * All sync logs produced for this account.
     *
     * @return HasMany<SyncLog, LeagueAccount>
     */
    public function syncLogs(): HasMany
    {
        return $this->hasMany(SyncLog::class);
    }

    /**
     * The most recent sync log for this account, ordered by synced_at.
     *
     * @return HasOne<SyncLog, LeagueAccount>
     */
    public function latestSyncLog(): HasOne
    {
        return $this->hasOne(SyncLog::class)->latestOfMany('synced_at');
    }
}

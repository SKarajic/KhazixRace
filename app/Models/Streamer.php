<?php

namespace App\Models;

use App\Enums\StreamingPlatform;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Streamer extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'streaming_platform',
        'stream_url',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'streaming_platform' => StreamingPlatform::class,
    ];

    /**
     * All League accounts linked to this streamer.
     *
     * @return HasMany<LeagueAccount, Streamer>
     */
    public function leagueAccounts(): HasMany
    {
        return $this->hasMany(LeagueAccount::class);
    }

    /**
     * The streamer's designated primary League account (is_primary = true).
     *
     * @return HasOne<LeagueAccount, Streamer>
     */
    public function primaryAccount(): HasOne
    {
        return $this->hasOne(LeagueAccount::class)->where('is_primary', true);
    }

    /**
     * All matches across every League account belonging to this streamer.
     *
     * @return HasManyThrough<LeagueMatch, LeagueAccount, Streamer>
     */
    public function matches(): HasManyThrough
    {
        return $this->hasManyThrough(LeagueMatch::class, LeagueAccount::class);
    }

    /**
     * Races this streamer is participating in.
     *
     * @return BelongsToMany<Race, Streamer>
     */
    public function races(): BelongsToMany
    {
        return $this->belongsToMany(Race::class);
    }
}

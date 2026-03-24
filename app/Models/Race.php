<?php

namespace App\Models;

use App\Enums\RaceStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Race extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'starts_at',
        'ends_at',
        'stream_url',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    /**
     * Scope to races that are currently in progress.
     *
     * @param  Builder<Race>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('starts_at', '<=', now())->where('ends_at', '>=', now());
    }

    /**
     * Derived lifecycle status of the race.
     * Determined by comparing the current time against starts_at and ends_at.
     *
     * @return Attribute<RaceStatus, never>
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: function () {
                $now = now();

                if ($now->lt($this->starts_at)) {
                    return RaceStatus::Upcoming;
                }

                if ($now->gt($this->ends_at)) {
                    return RaceStatus::Finished;
                }

                return RaceStatus::Active;
            },
        );
    }

    /**
     * Streamers competing in this race.
     *
     * @return BelongsToMany<Streamer, Race>
     */
    public function streamers(): BelongsToMany
    {
        return $this->belongsToMany(Streamer::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SyncRun extends Model
{
    /**
     * Create and persist a new sync run, returning the instance.
     *
     * @return SyncRun
     */
    public static function start(): static
    {
        return static::create();
    }

    /**
     * All sync logs produced during this run.
     *
     * @return HasMany<SyncLog, SyncRun>
     */
    public function syncLogs(): HasMany
    {
        return $this->hasMany(SyncLog::class);
    }
}

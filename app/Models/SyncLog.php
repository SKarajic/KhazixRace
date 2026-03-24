<?php

namespace App\Models;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class SyncLog extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'sync_run_id',
        'league_account_id',
        'new_matches',
        'error',
        'synced_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'synced_at' => 'datetime',
    ];

    /**
     * Create and persist a new sync log for the given account.
     *
     * @param  LeagueAccount  $account  The account being synced.
     * @param  SyncRun|null  $syncRun  The parent run, if any.
     */
    public static function start(LeagueAccount $account, ?SyncRun $syncRun = null): static
    {
        return static::create([
            'sync_run_id' => $syncRun?->id,
            'league_account_id' => $account->id,
            'new_matches' => 0,
            'synced_at' => now(),
        ]);
    }

    /**
     * Create a sync log, execute $callback inside a DB transaction, then mark
     * the log as complete or failed depending on the outcome.
     *
     * The callback receives the freshly-created {@see SyncLog} and must return
     * the number of new matches written.
     *
     * @param  LeagueAccount  $account  The account being synced.
     * @param  SyncRun|null  $syncRun  The parent run, if any.
     * @param  Closure(SyncLog): int  $callback  Work to perform inside the transaction.
     */
    public static function attempt(LeagueAccount $account, ?SyncRun $syncRun, Closure $callback): void
    {
        $log = static::start($account, $syncRun);

        try {
            $log->complete(DB::transaction(fn () => $callback($log)));
        } catch (\Throwable $e) {
            $log->fail($e->getMessage());
        }
    }

    /**
     * Mark the log as successfully completed with the given match count.
     *
     * @param  int  $newMatches  Number of new matches written during this sync.
     */
    public function complete(int $newMatches): void
    {
        $this->update(['new_matches' => $newMatches]);
    }

    /**
     * Mark the log as failed, storing the error message.
     *
     * @param  string  $error  The exception or error message to store.
     */
    public function fail(string $error): void
    {
        $this->update(['error' => $error]);
    }

    /**
     * The parent sync run, if this log was created as part of one.
     *
     * @return BelongsTo<SyncRun, SyncLog>
     */
    public function syncRun(): BelongsTo
    {
        return $this->belongsTo(SyncRun::class);
    }

    /**
     * The League account that was synced.
     *
     * @return BelongsTo<LeagueAccount, SyncLog>
     */
    public function leagueAccount(): BelongsTo
    {
        return $this->belongsTo(LeagueAccount::class);
    }

    /**
     * Matches written during this sync.
     *
     * @return HasMany<LeagueMatch, SyncLog>
     */
    public function leagueMatches(): HasMany
    {
        return $this->hasMany(LeagueMatch::class);
    }
}

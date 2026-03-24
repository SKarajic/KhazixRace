<?php

namespace App\Console\Commands;

use App\Jobs\SyncStreamerMatches;
use App\Models\Streamer;
use App\Models\SyncRun;
use Illuminate\Console\Command;

class SyncMatches extends Command
{
    protected $signature = 'sync:matches';

    protected $description = 'Sync match history and rank data for all streamers';

    /**
     * Create a new {@see SyncRun}, dispatch a {@see SyncStreamerMatches} job for
     * every streamer, and report how many jobs were queued.
     */
    public function handle(): int
    {
        $syncRun = SyncRun::start();

        Streamer::all()->each(
            fn (Streamer $streamer) => SyncStreamerMatches::dispatch($streamer, $syncRun),
        );

        $this->info('Dispatched sync jobs for '.Streamer::count().' streamers.');

        return self::SUCCESS;
    }
}

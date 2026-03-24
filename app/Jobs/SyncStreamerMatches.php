<?php

namespace App\Jobs;

use App\Data\LeagueMatchData;
use App\Models\LeagueAccount;
use App\Models\Streamer;
use App\Models\SyncLog;
use App\Models\SyncRun;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Phizz\Enums\GameQueue;
use Phizz\Facades\Phizz;

class SyncStreamerMatches implements ShouldQueue
{
    use Queueable;

    /**
     * @param  Streamer  $streamer  The streamer whose accounts will be synced.
     * @param  SyncRun|null  $syncRun  The parent run grouping this job with others, if any.
     */
    public function __construct(
        public readonly Streamer $streamer,
        public readonly ?SyncRun $syncRun = null,
    ) {}

    /**
     * Sync match history for every League account belonging to the streamer.
     */
    public function handle(): void
    {
        foreach ($this->streamer->leagueAccounts as $account) {
            $this->syncAccount($account);
        }
    }

    /**
     * Fetch and store new ranked matches for a single League account.
     *
     * Retrieves the latest 20 match IDs and trims the list to entries not yet
     * stored (stopping at the first known match_id). Only the most recent new
     * match receives a rank snapshot; older entries receive null to avoid
     * fabricating LP history from partially-tracked data.
     *
     * @param  LeagueAccount  $account  The account to sync.
     */
    private function syncAccount(LeagueAccount $account): void
    {
        SyncLog::attempt(
            account: $account,
            syncRun: $this->syncRun,
            callback: function (SyncLog $log) use ($account) {
                $client = Phizz::lol($account->platform);

                $matchIds = $client->matchV5->getMatchIdsByPuuid(
                    puuid: $account->puuid,
                    queue: GameQueue::SummonersRift5v5RankedSolo->value,
                    count: 20,
                );

                $latest = $account->matches()
                    ->orderByDesc('game_end_at')
                    ->value('match_id');

                $index = $matchIds->search($latest);

                $matchIds = $index !== false
                    ? $matchIds->slice(0, $index)
                    : $matchIds;

                $matches = $matchIds
                    ->map(fn (string $id) => $client->matchV5->getMatch($id))
                    ->values();

                foreach ($matches as $i => $match) {
                    $account->matches()->create(
                        LeagueMatchData::fromRiotMatch(
                            log: $log,
                            match: $match,
                            account: $account,
                            hasPoints: $i === 0,
                        )->toArray()
                    );
                }

                return $matches->count();
            }
        );
    }
}

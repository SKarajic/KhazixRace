<?php

namespace Database\Seeders;

use App\Enums\StreamingPlatform;
use App\Models\LeagueAccount;
use App\Models\LeagueMatch;
use App\Models\Race;
use App\Models\Streamer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Phizz\Apis\Lol\LeagueV4\Objects\LeagueEntryData;
use Phizz\Apis\Lol\LeagueV4\Objects\LeagueItemData;
use Phizz\Apis\Lol\MatchV5\Objects\MatchData;
use Phizz\Enums\GameQueue;
use Phizz\Enums\Platform;
use Phizz\Facades\Phizz;
use Throwable;

class RaceSeeder extends Seeder
{
    private const PLATFORMS = [
        StreamingPlatform::Twitch,
        StreamingPlatform::Twitch,
        StreamingPlatform::Twitch,
        StreamingPlatform::YouTube,
        StreamingPlatform::Kick,
    ];

    private const MIN_MATCHES = 3;

    private const TARGET_PLAYERS = 5;

    private const PLATFORM = Platform::NA;

    private int $since = 0;

    public function run(): void
    {
        $this->since = now()->subHours(24)->timestamp;

        $entries = $this->getEntries();
        $candidates = $this->getCandidates($entries);

        if ($candidates->isEmpty()) {
            $this->command->error('No qualifying players found — try again later or lower MIN_MATCHES.');

            return;
        }

        $this->command->info('Creating race and '.count($candidates).' streamers...');

        $race = Race::create([
            'name' => 'NA Grandmaster Challenge',
            'starts_at' => now()->subHours(24),
            'ends_at' => now()->addHours(24),
        ]);

        $candidates->each(fn (LeagueItemData $entry) => $this->syncEntry($race, $entry));

        $this->command->info('Done!');
        $this->command->table(
            ['Streamers', 'Races', 'Matches'],
            [[Streamer::count(), Race::count(), LeagueMatch::count()]],
        );
    }

    /**
     * Fetch the player's 24h matches and store them with a generated LP chain.
     * The most recent match gets the real current rank; each older match is derived
     * by undoing the result (+20 win / −18 loss), giving plausible progression.
     */
    private function seedMatches(LeagueAccount $account): int
    {
        $matchIds = Phizz::lol(self::PLATFORM)
            ->matchV5
            ->getMatchIdsByPuuid(
                puuid: $account->puuid,
                startTime: $this->since,
                queue: GameQueue::SummonersRift5v5RankedSolo->value,
            );

        // Fetch all match data (API returns newest-first)
        /** @var Collection<MatchData> $fetched */
        $fetched = $matchIds->map(fn (string $id) => Phizz::lol(self::PLATFORM)
            ->matchV5
            ->getMatch(matchId: $id)
        );

        if ($fetched->isEmpty()) {
            return 0;
        }

        /** @var LeagueEntryData $rank */
        $rank = Phizz::lol(self::PLATFORM)
            ->leagueV4
            ->getLeagueEntriesByPuuid(
                encryptedPuuid: $account->puuid,
                force: true
            )
            ->where(
                key: 'queue_type',
                value: 'RANKED_SOLO_5x5'
            )
            ->firstOrFail();

        $fetched->reduce(fn (LeagueEntryData $rank, MatchData $match) => $this->insertMatch($match, $account, $rank), $rank);

        return $fetched->count();
    }

    protected function insertMatch(MatchData $match, LeagueAccount $account, LeagueEntryData $rank): LeagueEntryData
    {
        $participant = collect($match->info->participants)
            ->where('puuid', $account->puuid)
            ->firstOrFail();

        LeagueMatch::create([
            'league_account_id' => $account->id,
            'match_id' => $match->metadata->match_id,
            'data' => $match->jsonSerialize(),
            'tier' => $rank->tier,
            'rank' => $rank->rank,
            'points' => $rank->league_points,
            'is_win' => $participant->win,
            'game_start_at' => $match->info->game_start_timestamp
                ? now()->setTimestamp((int) ($match->info->game_start_timestamp / 1000))
                : null,
            'game_end_at' => $match->info->game_end_timestamp
                ? now()->setTimestamp((int) ($match->info->game_end_timestamp / 1000))
                : null,
        ]);

        $rank->set('losses', $participant->win ? $rank->losses : $rank->losses - 1);
        $rank->set('wins', $participant->win ? $rank->wins - 1 : $rank->wins);
        $rank->set('league_points', $rank->league_points + ($participant->win ? -20 : 18));

        return $rank;
    }

    /**
     * @return Collection<LeagueItemData>
     */
    protected function getEntries(): Collection
    {
        $this->command->info('Fetching Grandmaster league from NA...');
        $league = Phizz::lol(self::PLATFORM)
            ->leagueV4
            ->getGrandmasterLeague(queue: 'RANKED_SOLO_5x5');

        return collect($league->entries)
            ->sortByDesc('league_points')
            ->values();
    }

    /**
     * @param  Collection<LeagueItemData>  $entries
     *
     * @returns Collection<LeagueItemData>
     */
    protected function getCandidates(Collection $entries): Collection
    {
        $this->command->info("Scanning {$entries->count()} GM players for 24h activity...");
        $candidates = collect();

        foreach ($entries as $entry) {
            // if we found the amount of candidates we need, stop
            if (count($candidates) >= self::TARGET_PLAYERS) {
                break;
            }

            // if is valid candidate, add to candidates
            if ($this->isCandidate($entry)) {
                $candidates->add($entry);
            }
        }

        return $candidates;
    }

    /**
     * @noinspection PhpUndefinedFieldInspection
     */
    protected function isCandidate(LeagueItemData $entry): bool
    {
        try {
            $matchIds = Phizz::lol(self::PLATFORM)
                ->matchV5
                ->getMatchIdsByPuuid(
                    puuid: $entry->puuid,
                    startTime: $this->since,
                    queue: GameQueue::SummonersRift5v5RankedSolo->value,
                );

            if ($matchIds->count() < self::MIN_MATCHES) {
                $this->command->line("  Skip $entry->summoner_name — only {$matchIds->count()} matches in 24h");

                return false;
            }

            $this->command->line("  + $entry->summoner_name — {$matchIds->count()} matches, $entry->league_points LP");

            return true;

        } catch (Throwable $e) {
            $this->command->warn("  Skipping $entry->summoner_name: {$e->getMessage()}");

            return false;
        }
    }

    protected function syncEntry(Race $race, LeagueItemData $entry): void
    {
        try {
            $account = Phizz::riot(self::PLATFORM)
                ->accountV1
                ->getByPuuid(puuid: $entry->puuid, force: true);

            $gameName = $account->game_name;
            $tagLine = $account->tag_line;

            $this->command->line("  $gameName#$tagLine");
            $streamingPlatform = Arr::random(self::PLATFORMS);

            $streamer = Streamer::create([
                'name' => $gameName,
                'streaming_platform' => $streamingPlatform,
                'stream_url' => $streamingPlatform->streamUrl($gameName),
            ]);

            $leagueAccount = $streamer->leagueAccounts()->create([
                'game_name' => $gameName,
                'tag_line' => $tagLine,
                'puuid' => $entry->puuid,
                'platform' => self::PLATFORM->value,
            ]);

            $race->streamers()->attach($streamer);
            $count = $this->seedMatches($leagueAccount);
            $this->command->line("    → $count matches seeded");
        } catch (Throwable $e) {
            $this->command->warn("  Could not resolve account for $entry->puuid: {$e->getMessage()}");

            return;
        }

    }
}

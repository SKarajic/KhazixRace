<?php

namespace App\Filament\Admin\Widgets;

use App\Enums\LeagueDivision;
use App\Enums\LeagueTier;
use App\Models\LeagueMatch;
use App\Models\Race;
use App\Models\Streamer;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class ActiveRaceWidget extends TableWidget
{
    /** @var int|string|array<int, int|string> The column span of this widget. */
    protected int|string|array $columnSpan = 'full';

    /** @var int|null The sort order of this widget on the dashboard. */
    protected static ?int $sort = 1;

    /**
     * Race-period W/L counts keyed by streamer ID, populated during buildQuery().
     *
     * @var array<int, array{wins: int, losses: int}>
     */
    private array $raceStats = [];

    /**
     * Return the heading for the table, including the active race name and end time if one is running.
     */
    public function getTableHeading(): string
    {
        $race = $this->getActiveRace();

        return $race
            ? "Active Race: {$race->name} (ends ".$race->ends_at->diffForHumans().')'
            : 'No Active Race';
    }

    /**
     * Configure the leaderboard table for the active race participants.
     */
    public function table(Table $table): Table
    {
        return $table
            ->striped()
            ->query($this->buildQuery())
            ->columns([
                TextColumn::make('position')
                    ->label('#')
                    ->getStateUsing(fn ($record, $rowLoop) => $rowLoop->iteration),

                TextColumn::make('name')
                    ->label('Streamer')
                    ->searchable(),

                TextColumn::make('streaming_platform')
                    ->label('Platform')
                    ->badge(),

                TextColumn::make('rank')
                    ->label('Current Rank')
                    ->badge()
                    ->getStateUsing(fn (Streamer $record) => $this->getRankLabel($record))
                    ->color(fn (Streamer $record) => $this->getRankColor($record))
                    ->sortable(false),

                TextColumn::make('lp')
                    ->label('LP')
                    ->getStateUsing(fn (Streamer $record) => $this->getLP($record))
                    ->sortable(false),

                TextColumn::make('wins_losses')
                    ->label('W / L')
                    ->getStateUsing(fn (Streamer $record) => $this->getWinsLosses($record))
                    ->sortable(false),

                TextColumn::make('win_rate')
                    ->label('Win Rate')
                    ->getStateUsing(fn (Streamer $record) => $this->getWinRate($record))
                    ->color(fn (Streamer $record) => $this->getWinRateColor($record))
                    ->sortable(false),
            ])
            ->paginated(false);
    }

    /**
     * Retrieve the currently active race, or null if none is running.
     */
    private function getActiveRace(): ?Race
    {
        return Race::active()->first();
    }

    /**
     * Build the Eloquent query for the leaderboard, ordered by rank sort key descending.
     * Returns an empty result set when there is no active race.
     *
     * @return Builder<Streamer>
     */
    private function buildQuery(): Builder
    {
        $race = $this->getActiveRace();

        if (! $race) {
            return Streamer::query()->whereRaw('1 = 0');
        }

        $streamerIds = $race->streamers()->pluck('streamers.id');

        $streamers = Streamer::with([
            'primaryAccount.matches' => fn ($q) => $q->latest('game_start_at')->limit(1),
        ])
            ->whereIn('id', $streamerIds)
            ->get()
            ->sortByDesc(fn (Streamer $s) => $this->rankSortKey($s))
            ->values();

        $orderedIds = $streamers->pluck('id')->toArray();

        $accountIds = $streamers->pluck('primaryAccount.id')->filter()->values();

        $stats = LeagueMatch::whereIn('league_account_id', $accountIds)
            ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at])
            ->whereNotNull('is_win')
            ->selectRaw('league_account_id, SUM(CASE WHEN is_win THEN 1 ELSE 0 END) as wins, COUNT(*) as total')
            ->groupBy('league_account_id')
            ->get()
            ->keyBy('league_account_id');

        foreach ($streamers as $streamer) {
            $accountId = $streamer->primaryAccount?->id;
            $row = $accountId ? $stats->get($accountId) : null;
            $this->raceStats[$streamer->id] = [
                'wins' => (int) ($row?->wins ?? 0),
                'losses' => (int) (($row?->total ?? 0) - ($row?->wins ?? 0)),
            ];
        }

        return Streamer::whereIn('id', $orderedIds)
            ->orderByRaw('ARRAY_POSITION(ARRAY['.implode(',', $orderedIds).']::bigint[], id)');
    }

    /**
     * Return the most recent ranked match for the streamer's primary account.
     */
    private function latestMatch(Streamer $streamer): ?LeagueMatch
    {
        return $streamer->primaryAccount?->matches->first();
    }

    /**
     * Compute a numeric sort key representing the streamer's current rank position.
     * Returns -1 when the streamer has no ranked match data.
     */
    private function rankSortKey(Streamer $streamer): int
    {
        $match = $this->latestMatch($streamer);
        if (! $match?->tier) {
            return -1;
        }

        $tier = LeagueTier::fromString($match->tier);
        $division = LeagueDivision::tryFrom($match->rank ?? 'IV');

        return (($tier?->sortOrder() ?? 0) * 10000) + (($division?->sortOrder() ?? 0) * 1000) + ($match->points ?? 0);
    }

    /**
     * Return the formatted rank label for the streamer, or "Unranked" if unavailable.
     */
    private function getRankLabel(Streamer $streamer): string
    {
        return $this->latestMatch($streamer)?->rank_label ?? 'Unranked';
    }

    /**
     * Return the color string associated with the streamer's current rank.
     */
    private function getRankColor(Streamer $streamer): string
    {
        return $this->latestMatch($streamer)?->rank_color ?? 'gray';
    }

    /**
     * Return the formatted LP string for the streamer, or "—" if unavailable.
     */
    private function getLP(Streamer $streamer): string
    {
        $points = $this->latestMatch($streamer)?->points;

        return $points !== null ? $points.' LP' : '—';
    }

    /**
     * Return the wins/losses string for the streamer during the race period.
     */
    private function getWinsLosses(Streamer $streamer): string
    {
        $stats = $this->raceStats[$streamer->id] ?? null;
        $total = ($stats['wins'] ?? 0) + ($stats['losses'] ?? 0);

        return $total > 0 ? $stats['wins'].' / '.$stats['losses'] : '—';
    }

    /**
     * Return the win rate percentage string for the streamer during the race period.
     */
    private function getWinRate(Streamer $streamer): string
    {
        $stats = $this->raceStats[$streamer->id] ?? null;
        $total = ($stats['wins'] ?? 0) + ($stats['losses'] ?? 0);

        if ($total === 0) {
            return '—';
        }

        return round(($stats['wins'] / $total) * 100).'%';
    }

    /**
     * Return the Filament color for the win rate badge: success (>=60%), warning (>=50%), danger (<50%).
     */
    private function getWinRateColor(Streamer $streamer): string
    {
        $stats = $this->raceStats[$streamer->id] ?? null;
        $total = ($stats['wins'] ?? 0) + ($stats['losses'] ?? 0);

        if ($total === 0) {
            return 'gray';
        }

        $rate = ($stats['wins'] / $total) * 100;

        return match (true) {
            $rate >= 60 => 'success',
            $rate >= 50 => 'warning',
            default => 'danger',
        };
    }
}

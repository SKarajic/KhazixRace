<?php

namespace App\Filament\Admin\Widgets;

use App\Enums\LeagueDivision;
use App\Enums\LeagueTier;
use App\Models\LeagueMatch;
use App\Models\Race;
use Filament\Support\RawJs;
use Filament\Widgets\ChartWidget;

class LpProgressWidget extends ChartWidget
{
    /** @var int|string|array<int, int|string> The column span of this widget. */
    protected int|string|array $columnSpan = 'full';

    /** @var int|null The sort order of this widget on the dashboard. */
    protected static ?int $sort = 2;

    /** @var string|null The maximum CSS height of the chart canvas. */
    protected ?string $maxHeight = '350px';

    /**
     * Only display this widget when an active race exists.
     */
    public static function canView(): bool
    {
        return Race::active()->exists();
    }

    /**
     * Return the widget heading text.
     */
    public function getHeading(): string
    {
        return 'LP Progression';
    }

    /**
     * Return the Chart.js chart type identifier.
     */
    protected function getType(): string
    {
        return 'line';
    }

    /**
     * Build and return the Chart.js dataset array for all race participants.
     * Each dataset represents one streamer's LP over time during the active race window.
     *
     * @return array<string, mixed>
     */
    protected function getData(): array
    {
        $race = $this->getActiveRace();

        if (! $race) {
            return ['datasets' => []];
        }

        $colors = [
            '#6366f1', '#f59e0b', '#10b981', '#ef4444',
            '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6',
        ];

        $datasets = [];
        $colorIndex = 0;

        foreach ($race->streamers as $streamer) {
            $account = $streamer->primaryAccount;

            if (! $account) {
                continue;
            }

            $matches = LeagueMatch::where('league_account_id', $account->id)
                ->whereNotNull('tier')
                ->whereNotNull('game_start_at')
                ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at])
                ->orderBy('game_start_at')
                ->get();

            if ($matches->isEmpty()) {
                continue;
            }

            $data = $matches->map(fn (LeagueMatch $match) => [
                'x' => $match->game_start_at->timestamp,
                'y' => $this->computeTotalLp($match->tier, $match->rank, $match->points),
            ])->values()->toArray();

            $color = $colors[$colorIndex % count($colors)];
            $colorIndex++;

            $datasets[] = [
                'label' => $streamer->name,
                'data' => $data,
                'borderColor' => $color,
                'backgroundColor' => $color.'33',
                'tension' => 0.3,
                'fill' => false,
                'pointRadius' => 3,
            ];
        }

        return ['datasets' => $datasets];
    }

    /**
     * Return the Chart.js options object that configures axis labels, tick formatting, and tooltips.
     *
     * @return array<string, mixed>|RawJs|null
     */
    protected function getOptions(): array|RawJs|null
    {
        /** @noinspection ALL */
        return RawJs::make(<<<'JS'
        {
            scales: {
                x: {
                    type: 'linear',
                    ticks: {
                        callback: (v) => new Date(v * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        maxTicksLimit: 10,
                    },
                },
                y: {
                    title: { display: true, text: 'Total LP' },
                    ticks: {
                        callback: (v) => {
                            const tiers = [[2800,'Master'],[2400,'Diamond'],[2000,'Emerald'],[1600,'Platinum'],[1200,'Gold'],[800,'Silver'],[400,'Bronze'],[0,'Iron']];
                            const t = tiers.find(([b]) => v >= b);
                            return t ? t[1] + ' ' + (v - t[0]) : v;
                        },
                    },
                },
            },
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        title: (items) => new Date(items[0].parsed.x * 1000).toLocaleString(),
                        label: (item) => {
                            const v = item.parsed.y;
                            const tiers = [[2800,'Master'],[2400,'Diamond'],[2000,'Emerald'],[1600,'Platinum'],[1200,'Gold'],[800,'Silver'],[400,'Bronze'],[0,'Iron']];
                            const t = tiers.find(([b]) => v >= b);
                            const lp = v - t[0];
                            return item.dataset.label + ': ' + t[1] + ' ' + lp + ' LP';
                        },
                    },
                },
            },
        }
        JS);
    }

    /**
     * Convert a tier, division, and LP value into a single comparable total-LP integer.
     * Returns 0 when no tier is provided.
     *
     * @param  string|null  $tier  The tier string (e.g. "GOLD").
     * @param  string|null  $division  The division string (e.g. "II").
     * @param  int|null  $points  The league points within the division.
     */
    private function computeTotalLp(?string $tier, ?string $division, ?int $points): int
    {
        if (! $tier) {
            return 0;
        }

        $tierEnum = LeagueTier::fromString($tier);
        $divisionEnum = LeagueDivision::tryFrom($division ?? 'IV');

        return ($tierEnum?->lpBase() ?? 0) + ($divisionEnum?->lpOffset() ?? 0) + ($points ?? 0);
    }

    /**
     * Retrieve the currently active race with its streamers and their primary accounts eager-loaded.
     */
    private function getActiveRace(): ?Race
    {
        return Race::active()->with('streamers.primaryAccount')->first();
    }
}

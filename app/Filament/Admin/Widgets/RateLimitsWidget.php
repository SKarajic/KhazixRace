<?php

namespace App\Filament\Admin\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\HtmlString;
use Phizz\Enums\Regional;

class RateLimitsWidget extends StatsOverviewWidget
{
    /** @var string|null The heading displayed above the stats. */
    protected ?string $heading = 'Riot API Rate Limits';

    /** @var int|string|array<int, int|string> The column span of this widget. */
    protected int|string|array $columnSpan = 'full';

    /** @var int|array<int, int>|null The number of stat columns to display. */
    protected int|array|null $columns = 4;

    /**
     * Only display this widget when at least one regional rate-limit cache entry is present.
     */
    public static function canView(): bool
    {
        foreach ([Regional::Americas, Regional::Europe, Regional::Asia, Regional::SEA] as $regional) {
            $key = 'phizz.ratelimit.app.Regional.'.strtolower($regional->value);
            if (! empty(Cache::get($key, []))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Build and return the stat cards for each Riot API regional endpoint.
     * Each card shows the per-window request counts and a color-coded peak usage percentage.
     *
     * @return array<int, Stat>
     */
    protected function getStats(): array
    {
        $stats = [];

        foreach ([Regional::Americas, Regional::Europe, Regional::Asia, Regional::SEA] as $regional) {
            $key = 'phizz.ratelimit.app.Regional.'.strtolower($regional->value);
            $windows = Cache::get($key, []);

            if (empty($windows)) {
                continue;
            }

            $lines = [];
            $worstPct = 0;

            foreach ($windows as $window) {
                $count = $window['count'] ?? 0;
                $limit = $window['limit'] ?? 0;
                $seconds = $window['window'] ?? 0;
                $pct = $limit > 0 ? round(($count / $limit) * 100) : 0;
                $label = $seconds >= 60 ? ($seconds / 60).' min' : "{$seconds}s";
                $lines[] = "{$count} / {$limit} ({$label}) — {$pct}%";
                $worstPct = max($worstPct, $pct);
            }

            $color = match (true) {
                $worstPct >= 90 => 'danger',
                $worstPct >= 70 => 'warning',
                default => 'success',
            };

            $stats[] = Stat::make($regional->name, "{$worstPct}% peak")
                ->description(new HtmlString(implode('<br>', $lines)))
                ->color($color);
        }

        return $stats;
    }
}

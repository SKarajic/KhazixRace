<?php

namespace App\Http\Middleware;

use App\Models\Race;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'race_streams' => fn () => $this->activeRaceStreams(),
        ];
    }

    /**
     * @return array<int, array{name: string, stream_url: string}>
     */
    private function activeRaceStreams(): array
    {
        $race = Race::active()->with('streamers')->first();

        if (! $race) {
            return [];
        }

        return $race->streamers
            ->filter(fn ($s) => $s->stream_url)
            ->map(fn ($s) => ['name' => $s->name, 'stream_url' => $s->stream_url])
            ->values()
            ->all();
    }
}

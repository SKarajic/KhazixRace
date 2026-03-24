<?php

namespace App\Filament\Admin\Resources\SyncRuns\Pages;

use App\Filament\Admin\Resources\SyncRuns\SyncRunResource;
use App\Jobs\SyncStreamerMatches;
use App\Models\Streamer;
use App\Models\SyncRun;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListSyncRuns extends ListRecords
{
    protected static string $resource = SyncRunResource::class;

    public function getSubheading(): ?string
    {
        $latest = SyncRun::latest()->first();

        return $latest
            ? 'Last sync: '.$latest->created_at->format('M j, Y H:i:s').' ('.$latest->created_at->diffForHumans().')'
            : 'No syncs run yet.';
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('syncNow')
                ->label('Sync Now')
                ->icon('heroicon-o-arrow-path')
                ->color('primary')
                ->requiresConfirmation()
                ->modalHeading('Sync all accounts')
                ->modalDescription('This will queue a sync job for every account with a resolved PUUID.')
                ->action(function () {
                    $syncRun = SyncRun::create();
                    $count = 0;

                    foreach (Streamer::all() as $streamer) {
                        SyncStreamerMatches::dispatch($streamer, $syncRun);
                        $count++;
                    }

                    Notification::make()
                        ->title("Sync queued for {$count} account(s)")
                        ->success()
                        ->send();
                }),
        ];
    }
}

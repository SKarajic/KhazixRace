<?php

namespace App\Filament\Admin\Resources\SyncLogs\Pages;

use App\Filament\Admin\Resources\SyncLogs\SyncLogResource;
use App\Jobs\SyncStreamerMatches;
use App\Models\Streamer;
use App\Models\SyncLog;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListSyncLogs extends ListRecords
{
    protected static string $resource = SyncLogResource::class;

    public function getSubheading(): ?string
    {
        $latest = SyncLog::latest('synced_at')->first();

        return $latest
            ? 'Last sync: '.$latest->synced_at->format('M j, Y H:i:s').' ('.$latest->synced_at->diffForHumans().')'
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
                    $count = 0;

                    foreach (Streamer::all() as $streamer) {
                        SyncStreamerMatches::dispatch($streamer);
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

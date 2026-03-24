<?php

namespace App\Filament\Admin\Resources\SyncRuns\Tables;

use App\Filament\Admin\Resources\SyncRuns\SyncRunResource;
use App\Models\SyncRun;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SyncRunsTable
{
    /**
     * Configure and return the sync runs table.
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->striped()
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')
                    ->label('Started at')
                    ->dateTime('M j, Y H:i:s')
                    ->description(fn (SyncRun $record) => $record->created_at->diffForHumans())
                    ->sortable(),

                TextColumn::make('accounts_count')
                    ->label('Accounts')
                    ->alignCenter()
                    ->badge()
                    ->color('gray')
                    ->getStateUsing(fn (SyncRun $record) => $record->syncLogs()->count()),

                TextColumn::make('new_matches')
                    ->label('New')
                    ->alignCenter()
                    ->badge()
                    ->color('success')
                    ->getStateUsing(fn (SyncRun $record) => $record->syncLogs()->sum('new_matches')),

                TextColumn::make('errors')
                    ->label('Errors')
                    ->alignCenter()
                    ->badge()
                    ->getStateUsing(fn (SyncRun $record) => $record->syncLogs()->whereNotNull('error')->count())
                    ->color(fn ($state) => $state > 0 ? 'danger' : 'success'),
            ])
            ->recordUrl(fn (SyncRun $record) => SyncRunResource::getUrl('view', ['record' => $record]))
            ->toolbarActions([])
            ->emptyStateIcon('heroicon-o-arrow-path')
            ->emptyStateHeading('No sync runs yet')
            ->emptyStateDescription('Use "Sync Now" to queue a manual sync.');
    }
}

<?php

namespace App\Filament\Admin\Resources\SyncRuns\RelationManagers;

use App\Filament\Admin\Resources\SyncLogs\SyncLogResource;
use App\Models\SyncLog;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SyncLogsRelationManager extends RelationManager
{
    /**
     * The Eloquent relationship name on the owner model.
     */
    protected static string $relationship = 'syncLogs';

    /**
     * The display title for this relation manager panel.
     */
    protected static ?string $title = 'Accounts';

    /**
     * Configure the form schema for this relation manager.
     */
    public function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    /**
     * Configure the sync logs table for a sync run.
     */
    public function table(Table $table): Table
    {
        return $table
            ->striped()
            ->recordTitleAttribute('id')
            ->defaultSort('synced_at', 'asc')
            ->columns([
                TextColumn::make('leagueAccount.streamer.name')
                    ->label('Streamer')
                    ->sortable(),

                TextColumn::make('leagueAccount.game_name')
                    ->label('Account')
                    ->formatStateUsing(fn ($state, SyncLog $record) => "{$record->leagueAccount->game_name}#{$record->leagueAccount->tag_line}"),

                TextColumn::make('new_matches')
                    ->label('New')
                    ->alignCenter()
                    ->badge()
                    ->color('success'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->getStateUsing(fn (SyncLog $record) => $record->error ? 'Error' : 'OK')
                    ->color(fn ($state) => $state === 'OK' ? 'success' : 'danger')
                    ->tooltip(fn (SyncLog $record) => $record->error),

                TextColumn::make('synced_at')
                    ->label('Synced at')
                    ->dateTime('M j, Y H:i:s')
                    ->description(fn (SyncLog $record) => $record->synced_at?->diffForHumans()),
            ])
            ->recordUrl(fn (SyncLog $record) => SyncLogResource::getUrl('view', ['record' => $record]))
            ->headerActions([])
            ->toolbarActions([])
            ->emptyStateIcon('heroicon-o-arrow-path')
            ->emptyStateHeading('No accounts synced');
    }
}

<?php

namespace App\Filament\Admin\Resources\SyncLogs\Tables;

use App\Filament\Admin\Resources\SyncLogs\SyncLogResource;
use App\Models\Streamer;
use App\Models\SyncLog;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SyncLogsTable
{
    /**
     * Configure and return the sync logs table.
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('synced_at', 'desc')
            ->columns([
                TextColumn::make('leagueAccount.streamer.name')
                    ->label('Streamer')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('leagueAccount.game_name')
                    ->label('Account')
                    ->formatStateUsing(fn ($state, $record) => "{$record->leagueAccount->game_name}#{$record->leagueAccount->tag_line}"),

                TextColumn::make('new_matches')
                    ->label('New')
                    ->alignCenter(),

                BadgeColumn::make('error')
                    ->label('Status')
                    ->getStateUsing(fn ($record) => $record->error ? 'Error' : 'OK')
                    ->colors(['success' => 'OK', 'danger' => 'Error'])
                    ->tooltip(fn ($record) => $record->error),

                TextColumn::make('synced_at')
                    ->label('Synced at')
                    ->dateTime('M j, Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('streamer')
                    ->label('Streamer')
                    ->options(Streamer::pluck('name', 'id'))
                    ->query(fn ($query, $data) => $data['value']
                        ? $query->whereHas('leagueAccount', fn ($q) => $q->where('streamer_id', $data['value']))
                        : $query
                    ),
            ])
            ->recordUrl(fn (SyncLog $record) => SyncLogResource::getUrl('view', ['record' => $record]))
            ->recordActions([
                ViewAction::make(),
            ])
            ->toolbarActions([]);
    }
}

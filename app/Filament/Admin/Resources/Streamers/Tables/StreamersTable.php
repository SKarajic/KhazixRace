<?php

namespace App\Filament\Admin\Resources\Streamers\Tables;

use App\Filament\Admin\Resources\Streamers\StreamerResource;
use App\Models\Streamer;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class StreamersTable
{
    /**
     * Configure and return the streamers table.
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->striped()
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->description(fn (Streamer $record) => $record->stream_url ?: null),

                TextColumn::make('streaming_platform')
                    ->label('Platform')
                    ->badge(),

                TextColumn::make('primaryAccount.game_name')
                    ->label('Primary Account')
                    ->formatStateUsing(function ($state, Streamer $record) {
                        $primary = $record->primaryAccount;

                        return $primary ? "$primary->game_name#$primary->tag_line" : '—';
                    })
                    ->placeholder('No account'),

                TextColumn::make('league_accounts_count')
                    ->label('Accounts')
                    ->counts('leagueAccounts')
                    ->badge()
                    ->color('gray')
                    ->sortable(),
            ])
            ->filters([])
            ->recordUrl(fn (Streamer $record) => StreamerResource::getUrl('view', ['record' => $record]))
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateIcon('heroicon-o-user-group')
            ->emptyStateHeading('No streamers yet')
            ->emptyStateDescription('Add a streamer to get started.');
    }
}

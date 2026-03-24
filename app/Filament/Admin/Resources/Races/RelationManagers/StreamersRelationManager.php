<?php

namespace App\Filament\Admin\Resources\Races\RelationManagers;

use App\Models\Streamer;
use Filament\Actions\AttachAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DetachAction;
use Filament\Actions\DetachBulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class StreamersRelationManager extends RelationManager
{
    /** @var string The Eloquent relationship name on the owner model. */
    protected static string $relationship = 'streamers';

    /**
     * Configure the form schema for this relation manager.
     */
    public function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    /**
     * Configure the streamers table for the race participants panel.
     */
    public function table(Table $table): Table
    {
        return $table
            ->striped()
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('name')
                    ->searchable(),

                TextColumn::make('streaming_platform')
                    ->label('Platform')
                    ->badge(),

                TextColumn::make('primaryAccount.game_name')
                    ->label('Primary Account')
                    ->formatStateUsing(function ($state, Streamer $record) {
                        $primary = $record->primaryAccount;

                        return $primary ? "{$primary->game_name}#{$primary->tag_line}" : '—';
                    })
                    ->placeholder('No account'),
            ])
            ->filters([])
            ->headerActions([
                AttachAction::make()->preloadRecordSelect(),
            ])
            ->recordActions([
                DetachAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DetachBulkAction::make(),
                ]),
            ])
            ->emptyStateIcon('heroicon-o-user-group')
            ->emptyStateHeading('No participants')
            ->emptyStateDescription('Attach streamers to add them to this race.');
    }
}

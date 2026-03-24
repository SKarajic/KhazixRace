<?php

namespace App\Filament\Admin\Resources\SyncLogs\RelationManagers;

use App\Filament\Admin\Resources\LeagueMatches\LeagueMatchResource;
use App\Models\LeagueMatch;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class LeagueMatchesRelationManager extends RelationManager
{
    /**
     * The Eloquent relationship name on the owner model.
     */
    protected static string $relationship = 'leagueMatches';

    /**
     * The display title for this relation manager panel.
     */
    protected static ?string $title = 'Synced Matches';

    /**
     * Configure the form schema for this relation manager.
     */
    public function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    /**
     * Configure the synced matches table for a sync log entry.
     */
    public function table(Table $table): Table
    {
        return $table
            ->striped()
            ->recordTitleAttribute('match_id')
            ->defaultSort('game_start_at', 'desc')
            ->columns([
                TextColumn::make('leagueAccount.game_name')
                    ->label('Account')
                    ->formatStateUsing(fn ($state, LeagueMatch $record) => "{$record->leagueAccount->game_name}#{$record->leagueAccount->tag_line}"),

                TextColumn::make('match_id')
                    ->label('Match ID')
                    ->copyable(),

                TextColumn::make('rank_label')
                    ->label('Rank at Match')
                    ->badge()
                    ->placeholder('Unranked')
                    ->color(fn (LeagueMatch $record) => $record->rank_color),

                IconColumn::make('is_win')
                    ->label('Win')
                    ->boolean()
                    ->trueIcon('heroicon-o-trophy')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                TextColumn::make('game_start_at')
                    ->label('Played at')
                    ->dateTime('M j, Y H:i'),
            ])
            ->filters([])
            ->headerActions([])
            ->recordUrl(fn (LeagueMatch $record) => LeagueMatchResource::getUrl('view', ['record' => $record]))
            ->recordActions([])
            ->toolbarActions([])
            ->emptyStateIcon('heroicon-o-puzzle-piece')
            ->emptyStateHeading('No matches synced');
    }
}

<?php

namespace App\Filament\Admin\Resources\Races\RelationManagers;

use App\Filament\Admin\Resources\LeagueMatches\LeagueMatchResource;
use App\Models\LeagueMatch;
use App\Models\Race;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class LeagueMatchesRelationManager extends RelationManager
{
    /**
     * The Eloquent relationship name on the owner model.
     */
    protected static string $relationship = 'streamers';

    /**
     * The display title for this relation manager panel.
     */
    protected static ?string $title = 'Matches';

    /**
     * Configure the form schema for this relation manager.
     */
    public function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    /**
     * Configure the matches table scoped to the active race's time window and participants.
     */
    public function table(Table $table): Table
    {
        /** @var Race $race */
        $race = $this->getOwnerRecord();

        return $table
            ->striped()
            ->query(
                LeagueMatch::query()
                    ->whereIn('league_account_id', function ($q) use ($race) {
                        $q->select('league_accounts.id')
                            ->from('league_accounts')
                            ->whereIn('streamer_id', $race->streamers()->select('streamers.id'));
                    })
                    ->whereBetween('game_start_at', [$race->starts_at, $race->ends_at])
            )
            ->defaultSort('game_start_at', 'desc')
            ->columns([
                TextColumn::make('leagueAccount.streamer.name')
                    ->label('Streamer')
                    ->sortable(),

                TextColumn::make('leagueAccount.game_name')
                    ->label('Account')
                    ->formatStateUsing(fn ($state, LeagueMatch $record) => $record->leagueAccount->game_name.'#'.$record->leagueAccount->tag_line),

                TextColumn::make('champion')
                    ->label('Champion')
                    ->getStateUsing(fn (LeagueMatch $record) => $record->participant($record->leagueAccount?->puuid)?->champion_name ?? '—')
                    ->badge()
                    ->color('primary'),

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
                    ->dateTime('M j, Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('streamer')
                    ->label('Streamer')
                    ->options(fn () => $race->streamers()->pluck('name', 'streamers.id'))
                    ->query(fn ($query, $data) => $data['value']
                        ? $query->whereHas('leagueAccount', fn ($q) => $q->where('streamer_id', $data['value']))
                        : $query
                    ),
            ])
            ->headerActions([])
            ->recordUrl(fn (LeagueMatch $record) => LeagueMatchResource::getUrl('view', ['record' => $record]))
            ->recordActions([])
            ->toolbarActions([])
            ->emptyStateIcon('heroicon-o-puzzle-piece')
            ->emptyStateHeading('No matches in this race period')
            ->emptyStateDescription('Matches played between the race start and end dates will appear here.');
    }
}

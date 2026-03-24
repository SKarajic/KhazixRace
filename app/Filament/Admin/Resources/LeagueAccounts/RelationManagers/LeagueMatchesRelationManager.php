<?php

namespace App\Filament\Admin\Resources\LeagueAccounts\RelationManagers;

use App\Filament\Admin\Resources\LeagueMatches\LeagueMatchResource;
use App\Models\LeagueAccount;
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
    protected static string $relationship = 'matches';

    /**
     * The display title for this relation manager panel.
     */
    protected static ?string $title = 'Match History';

    /**
     * Configure the form schema for this relation manager.
     */
    public function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    /**
     * Configure the match history table for the owner league account.
     */
    public function table(Table $table): Table
    {
        /** @var LeagueAccount $record */
        $record = $this->getOwnerRecord();
        $puuid = $record->puuid;

        return $table
            ->striped()
            ->recordTitleAttribute('match_id')
            ->defaultSort('game_start_at', 'desc')
            ->columns([
                TextColumn::make('champion')
                    ->label('Champion')
                    ->getStateUsing(fn (LeagueMatch $record) => $record->participant($puuid)?->champion_name ?? '—')
                    ->badge()
                    ->color('primary'),

                TextColumn::make('kda')
                    ->label('K/D/A')
                    ->getStateUsing(function (LeagueMatch $record) use ($puuid) {
                        $p = $record->participant($puuid);

                        return $p ? $p->kills.'/'.$p->deaths.'/'.$p->assists : '—';
                    }),

                TextColumn::make('rank_label')
                    ->label('Rank at Match')
                    ->badge()
                    ->placeholder('Unranked')
                    ->color(fn (LeagueMatch $record) => $record->rank_color),

                TextColumn::make('duration')
                    ->label('Duration')
                    ->getStateUsing(fn (LeagueMatch $record) => gmdate('i:s', $record->data?->info?->game_duration ?? 0)),

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
            ->emptyStateHeading('No matches yet')
            ->emptyStateDescription('Matches will appear here after a sync.');
    }
}

<?php

namespace App\Filament\Admin\Resources\LeagueMatches\Tables;

use App\Models\LeagueAccount;
use App\Models\LeagueMatch;
use App\Models\Streamer;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class LeagueMatchesTable
{
    /**
     * Configure and return the league matches table.
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('game_start_at', 'desc')
            ->columns([
                TextColumn::make('leagueAccount.streamer.name')
                    ->label('Streamer')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('leagueAccount.game_name')
                    ->label('Account')
                    ->formatStateUsing(fn ($state, $record) => "{$record->leagueAccount->game_name}#{$record->leagueAccount->tag_line}")
                    ->searchable(),

                TextColumn::make('match_id')
                    ->label('Match ID')
                    ->searchable()
                    ->copyable(),

                TextColumn::make('rank_label')
                    ->label('Rank')
                    ->badge()
                    ->placeholder('Unranked')
                    ->color(fn (LeagueMatch $record) => $record->rank_color),

                IconColumn::make('is_win')
                    ->label('Win')
                    ->boolean()
                    ->trueIcon('heroicon-o-trophy')
                    ->falseIcon('heroicon-o-x-circle'),

                TextColumn::make('game_start_at')
                    ->label('Played at')
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

                SelectFilter::make('league_account_id')
                    ->label('Account')
                    ->options(
                        LeagueAccount::all()
                            ->mapWithKeys(fn ($a) => [$a->id => "$a->game_name#$a->tag_line"])
                    ),

                SelectFilter::make('is_win')
                    ->label('Result')
                    ->options([1 => 'Win', 0 => 'Loss']),
            ])
            ->recordActions([])
            ->toolbarActions([]);
    }
}

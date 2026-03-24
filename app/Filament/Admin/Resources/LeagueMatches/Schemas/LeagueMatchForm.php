<?php

namespace App\Filament\Admin\Resources\LeagueMatches\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class LeagueMatchForm
{
    /**
     * Configure and return the league match form schema.
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('league_account_id')
                    ->relationship('leagueAccount', 'id')
                    ->required(),
                TextInput::make('match_id')
                    ->required(),
                TextInput::make('data')
                    ->required(),
                TextInput::make('tier'),
                TextInput::make('rank'),
                TextInput::make('points'),
                Toggle::make('is_win'),
                DateTimePicker::make('game_start_at'),
                DateTimePicker::make('game_end_at'),
            ]);
    }
}

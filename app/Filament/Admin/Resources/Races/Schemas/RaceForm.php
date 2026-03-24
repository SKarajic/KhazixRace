<?php

namespace App\Filament\Admin\Resources\Races\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class RaceForm
{
    /**
     * Configure and return the race form schema.
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Race Details')
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        DateTimePicker::make('starts_at')
                            ->label('Start date & time')
                            ->required()
                            ->columnSpan(1),

                        DateTimePicker::make('ends_at')
                            ->label('End date & time')
                            ->required()
                            ->after('starts_at')
                            ->columnSpan(1),

                        TextInput::make('stream_url')
                            ->label('Stream URL')
                            ->url()
                            ->placeholder('https://twitch.tv/username')
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}

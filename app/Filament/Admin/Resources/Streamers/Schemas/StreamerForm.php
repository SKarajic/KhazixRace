<?php

namespace App\Filament\Admin\Resources\Streamers\Schemas;

use App\Enums\StreamingPlatform;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class StreamerForm
{
    /**
     * Configure and return the streamer form schema.
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Streamer Details')
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpan(1),

                        Select::make('streaming_platform')
                            ->label('Platform')
                            ->options(StreamingPlatform::class)
                            ->required()
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

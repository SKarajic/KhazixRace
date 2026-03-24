<?php

namespace App\Filament\Admin\Resources\LeagueAccounts;

use App\Filament\Admin\Resources\LeagueAccounts\Pages\ViewLeagueAccount;
use App\Filament\Admin\Resources\LeagueAccounts\RelationManagers\LeagueMatchesRelationManager;
use App\Filament\Admin\Resources\Streamers\StreamerResource;
use App\Models\LeagueAccount;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\PageRegistration;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Phizz\Enums\Platform;

class LeagueAccountResource extends Resource
{
    /**
     * The resource model.
     *
     * @var class-string<LeagueAccount>|null
     */
    protected static ?string $model = LeagueAccount::class;

    /**
     * Whether this resource registers a navigation item.
     */
    protected static bool $shouldRegisterNavigation = false;

    /**
     * Configure the form schema for this resource.
     */
    public static function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    /**
     * Configure the infolist schema used on the view page.
     */
    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Account')
                ->icon('heroicon-o-identification')
                ->columnSpanFull()
                ->columns(4)
                ->schema([
                    TextEntry::make('streamer.name')
                        ->label('Streamer'),

                    TextEntry::make('riot_id')
                        ->label('Riot ID')
                        ->state(fn (LeagueAccount $record) => "$record->game_name#$record->tag_line"),

                    TextEntry::make('platform')
                        ->label('Server')
                        ->badge()
                        ->color('gray')
                        ->formatStateUsing(fn ($state) => Platform::from($state)->name),

                    IconEntry::make('is_primary')
                        ->label('Primary Account')
                        ->boolean()
                        ->trueIcon('heroicon-o-star')
                        ->falseIcon('heroicon-o-star')
                        ->trueColor('warning')
                        ->falseColor('gray'),

                    TextEntry::make('puuid')
                        ->label('PUUID')
                        ->copyable()
                        ->placeholder('Not resolved')
                        ->columnSpanFull(),
                ]),
        ]);
    }

    /**
     * Configure the table for this resource.
     */
    public static function table(Table $table): Table
    {
        return $table->columns([]);
    }

    /**
     * Return the relation managers registered for this resource.
     *
     * @return array<class-string>
     */
    public static function getRelations(): array
    {
        return [
            LeagueMatchesRelationManager::class,
        ];
    }

    /**
     * Override the index URL to redirect back to the Streamers resource index.
     *
     * @param  array<string, mixed>  $parameters
     */
    public static function getIndexUrl(
        array $parameters = [],
        bool $isAbsolute = true,
        ?string $panel = null,
        ?Model $tenant = null,
        bool $shouldGuessMissingParameters = false,
    ): string {
        return StreamerResource::getUrl('index');
    }

    /**
     * Disable record creation for this resource.
     */
    public static function canCreate(): bool
    {
        return false;
    }

    /**
     * Return the pages registered for this resource.
     *
     * @return array<string, PageRegistration>
     */
    public static function getPages(): array
    {
        return [
            'view' => ViewLeagueAccount::route('/{record}'),
        ];
    }
}

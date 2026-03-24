<?php

namespace App\Filament\Admin\Resources\Races;

use App\Filament\Admin\Resources\Races\Pages\CreateRace;
use App\Filament\Admin\Resources\Races\Pages\EditRace;
use App\Filament\Admin\Resources\Races\Pages\ListRaces;
use App\Filament\Admin\Resources\Races\Pages\ViewRace;
use App\Filament\Admin\Resources\Races\RelationManagers\LeagueMatchesRelationManager;
use App\Filament\Admin\Resources\Races\RelationManagers\StreamersRelationManager;
use App\Filament\Admin\Resources\Races\Schemas\RaceForm;
use App\Filament\Admin\Resources\Races\Tables\RacesTable;
use App\Models\Race;
use BackedEnum;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\PageRegistration;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class RaceResource extends Resource
{
    /**
     * The resource model.
     *
     * @var class-string<Race>|null
     */
    protected static ?string $model = Race::class;

    /**
     * The icon used in the navigation sidebar.
     */
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTrophy;

    /**
     * The navigation group this resource belongs to.
     */
    protected static string|null|UnitEnum $navigationGroup = 'Management';

    /**
     * The sort order within the navigation group.
     */
    protected static ?int $navigationSort = 2;

    /**
     * Configure the form schema for this resource.
     */
    public static function form(Schema $schema): Schema
    {
        return RaceForm::configure($schema);
    }

    /**
     * Configure the infolist schema used on the race view page.
     */
    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Race Details')
                ->columnSpanFull()
                ->icon('heroicon-o-trophy')
                ->columns(3)
                ->schema([
                    TextEntry::make('name'),

                    TextEntry::make('status')
                        ->badge(),

                    TextEntry::make('stream_url')
                        ->label('Stream URL')
                        ->url(fn ($state) => $state ?: null)
                        ->openUrlInNewTab()
                        ->placeholder('—'),

                    TextEntry::make('starts_at')
                        ->label('Starts')
                        ->dateTime('M j, Y H:i'),

                    TextEntry::make('ends_at')
                        ->label('Ends')
                        ->dateTime('M j, Y H:i'),

                    TextEntry::make('participants')
                        ->label('Participants')
                        ->state(fn (Race $record) => $record->streamers()->count())
                        ->badge()
                        ->color('gray'),
                ]),
        ]);
    }

    /**
     * Configure the table for this resource.
     */
    public static function table(Table $table): Table
    {
        return RacesTable::configure($table);
    }

    /**
     * Return the relation managers registered for this resource.
     *
     * @return array<class-string>
     */
    public static function getRelations(): array
    {
        return [
            StreamersRelationManager::class,
            LeagueMatchesRelationManager::class,
        ];
    }

    /**
     * Return the pages registered for this resource.
     *
     * @return array<string, PageRegistration>
     */
    public static function getPages(): array
    {
        return [
            'index' => ListRaces::route('/'),
            'create' => CreateRace::route('/create'),
            'view' => ViewRace::route('/{record}'),
            'edit' => EditRace::route('/{record}/edit'),
        ];
    }
}

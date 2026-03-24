<?php

namespace App\Filament\Admin\Resources\Streamers;

use App\Filament\Admin\Resources\Streamers\Pages\CreateStreamer;
use App\Filament\Admin\Resources\Streamers\Pages\EditStreamer;
use App\Filament\Admin\Resources\Streamers\Pages\ListStreamers;
use App\Filament\Admin\Resources\Streamers\Pages\ViewStreamer;
use App\Filament\Admin\Resources\Streamers\Schemas\StreamerForm;
use App\Filament\Admin\Resources\Streamers\Tables\StreamersTable;
use App\Models\Streamer;
use BackedEnum;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class StreamerResource extends Resource
{
    /** @var class-string<Streamer>|null */
    protected static ?string $model = Streamer::class;

    /** @var string|BackedEnum|null The icon used in the navigation sidebar. */
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUser;

    /** @var string|null|UnitEnum The navigation group this resource belongs to. */
    protected static string|null|UnitEnum $navigationGroup = 'Management';

    /** @var int|null The sort order within the navigation group. */
    protected static ?int $navigationSort = 1;

    /**
     * Configure the form schema for this resource.
     */
    public static function form(Schema $schema): Schema
    {
        return StreamerForm::configure($schema);
    }

    /**
     * Configure the infolist schema used on the streamer view page.
     */
    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Streamer')
                ->icon('heroicon-o-user')
                ->columnSpanFull()
                ->columns(3)
                ->schema([
                    TextEntry::make('name'),

                    TextEntry::make('streaming_platform')
                        ->label('Platform')
                        ->badge(),

                    TextEntry::make('stream_url')
                        ->label('Stream URL')
                        ->url(fn ($state) => $state ?: null)
                        ->openUrlInNewTab()
                        ->placeholder('—'),
                ]),
        ]);
    }

    /**
     * Configure the table for this resource.
     */
    public static function table(Table $table): Table
    {
        return StreamersTable::configure($table);
    }

    /**
     * Return the relation managers registered for this resource.
     *
     * @return array<class-string>
     */
    public static function getRelations(): array
    {
        return [
            \App\Filament\Admin\Resources\Streamers\RelationManagers\LeagueAccountsRelationManager::class,
        ];
    }

    /**
     * Return the pages registered for this resource.
     *
     * @return array<string, \Filament\Resources\Pages\PageRegistration>
     */
    public static function getPages(): array
    {
        return [
            'index' => ListStreamers::route('/'),
            'create' => CreateStreamer::route('/create'),
            'view' => ViewStreamer::route('/{record}'),
            'edit' => EditStreamer::route('/{record}/edit'),
        ];
    }
}

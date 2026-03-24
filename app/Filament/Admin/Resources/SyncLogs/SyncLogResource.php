<?php

namespace App\Filament\Admin\Resources\SyncLogs;

use App\Filament\Admin\Resources\SyncLogs\Pages\ViewSyncLog;
use App\Filament\Admin\Resources\SyncLogs\RelationManagers\LeagueMatchesRelationManager;
use App\Filament\Admin\Resources\SyncRuns\SyncRunResource;
use App\Models\SyncLog;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\PageRegistration;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Table;

class SyncLogResource extends Resource
{
    /**
     * The resource model.
     *
     * @var class-string<SyncLog>|null
     */
    protected static ?string $model = SyncLog::class;

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
     * Configure the infolist schema used on the sync log view page.
     */
    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Sync Details')
                ->icon('heroicon-o-arrow-path')
                ->columns(3)
                ->schema([
                    TextEntry::make('leagueAccount.streamer.name')
                        ->label('Streamer'),

                    TextEntry::make('leagueAccount.game_name')
                        ->label('Account')
                        ->formatStateUsing(fn ($state, SyncLog $record) => "{$record->leagueAccount->game_name}#{$record->leagueAccount->tag_line}"),

                    TextEntry::make('synced_at')
                        ->label('Synced at')
                        ->dateTime('M j, Y H:i:s')
                        ->formatStateUsing(fn ($state, SyncLog $record) => $record->synced_at?->format('M j, Y H:i:s').' ('.$record->synced_at?->diffForHumans().')'),
                ]),

            Section::make('Results')
                ->icon('heroicon-o-chart-bar')
                ->columns(3)
                ->schema([
                    TextEntry::make('new_matches')
                        ->label('New matches')
                        ->badge()
                        ->color('success'),

                    IconEntry::make('has_error')
                        ->label('Status')
                        ->state(fn (SyncLog $record) => $record->error === null)
                        ->boolean()
                        ->trueIcon('heroicon-o-check-circle')
                        ->falseIcon('heroicon-o-x-circle')
                        ->trueColor('success')
                        ->falseColor('danger'),

                    TextEntry::make('error')
                        ->label('Error')
                        ->placeholder('—')
                        ->color('danger')
                        ->visible(fn (SyncLog $record) => $record->error !== null),
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
     * Override the index URL to redirect back to the SyncRun resource index.
     *
     * @param  array<string, mixed>  $parameters
     */
    public static function getIndexUrl(
        array $parameters = [],
        bool $isAbsolute = true,
        ?string $panel = null,
        ?\Illuminate\Database\Eloquent\Model $tenant = null,
        bool $shouldGuessMissingParameters = false,
    ): string {
        return SyncRunResource::getUrl('index');
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
            'view' => ViewSyncLog::route('/{record}'),
        ];
    }
}

<?php

namespace App\Filament\Admin\Resources\SyncRuns;

use App\Filament\Admin\Resources\SyncRuns\Pages\ListSyncRuns;
use App\Filament\Admin\Resources\SyncRuns\Pages\ViewSyncRun;
use App\Filament\Admin\Resources\SyncRuns\RelationManagers\SyncLogsRelationManager;
use App\Filament\Admin\Resources\SyncRuns\Tables\SyncRunsTable;
use App\Models\SyncRun;
use BackedEnum;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\PageRegistration;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class SyncRunResource extends Resource
{
    /**
     * The resource model.
     *
     * @var class-string<SyncRun>|null
     */
    protected static ?string $model = SyncRun::class;

    /**
     * The icon used in the navigation sidebar.
     */
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowPath;

    /**
     * The label shown in the navigation sidebar.
     */
    protected static ?string $navigationLabel = 'Sync Logs';

    /**
     * The navigation group this resource belongs to.
     */
    protected static string|null|UnitEnum $navigationGroup = 'System';

    /**
     * The sort order within the navigation group.
     */
    protected static ?int $navigationSort = 1;

    /**
     * Configure the form schema for this resource.
     */
    public static function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    /**
     * Configure the infolist schema used on the sync run view page.
     */
    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Summary')
                ->icon('heroicon-o-arrow-path')
                ->columns(4)
                ->schema([
                    TextEntry::make('created_at')
                        ->label('Started at')
                        ->dateTime('M j, Y H:i:s'),

                    TextEntry::make('accounts_synced')
                        ->label('Accounts synced')
                        ->state(fn (SyncRun $record) => $record->syncLogs()->count())
                        ->badge()
                        ->color('gray'),

                    TextEntry::make('new_matches')
                        ->label('New matches')
                        ->state(fn (SyncRun $record) => (int) $record->syncLogs()->sum('new_matches'))
                        ->badge()
                        ->color('success'),

                    TextEntry::make('errors')
                        ->label('Errors')
                        ->state(fn (SyncRun $record) => $record->syncLogs()->whereNotNull('error')->count())
                        ->badge()
                        ->color(fn ($state) => $state > 0 ? 'danger' : 'success'),
                ]),
        ]);
    }

    /**
     * Configure the table for this resource.
     */
    public static function table(Table $table): Table
    {
        return SyncRunsTable::configure($table);
    }

    /**
     * Return the relation managers registered for this resource.
     *
     * @return array<class-string>
     */
    public static function getRelations(): array
    {
        return [
            SyncLogsRelationManager::class,
        ];
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
            'index' => ListSyncRuns::route('/'),
            'view' => ViewSyncRun::route('/{record}'),
        ];
    }
}

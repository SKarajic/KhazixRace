<?php

namespace App\Filament\Admin\Resources\Races\Tables;

use App\Filament\Admin\Resources\Races\RaceResource;
use App\Models\Race;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RacesTable
{
    /**
     * Configure and return the races table.
     */
    public static function configure(Table $table): Table
    {
        return $table
            ->striped()
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->description(fn (Race $record) => $record->starts_at->format('M j').' – '.$record->ends_at->format('M j, Y')),

                TextColumn::make('starts_at')
                    ->label('Starts')
                    ->dateTime('M j, Y H:i')
                    ->sortable(),

                TextColumn::make('ends_at')
                    ->label('Ends')
                    ->dateTime('M j, Y H:i')
                    ->sortable(),

                TextColumn::make('status')
                    ->badge(),

                TextColumn::make('streamers_count')
                    ->label('Participants')
                    ->counts('streamers')
                    ->badge()
                    ->color('gray')
                    ->sortable(),
            ])
            ->filters([])
            ->recordUrl(fn (Race $record) => RaceResource::getUrl('view', ['record' => $record]))
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateIcon('heroicon-o-trophy')
            ->emptyStateHeading('No races yet')
            ->emptyStateDescription('Create a race to start tracking participant progress.');
    }
}

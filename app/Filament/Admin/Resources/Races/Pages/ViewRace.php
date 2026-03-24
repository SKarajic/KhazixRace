<?php

namespace App\Filament\Admin\Resources\Races\Pages;

use App\Filament\Admin\Resources\Races\RaceResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewRace extends ViewRecord
{
    protected static string $resource = RaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}

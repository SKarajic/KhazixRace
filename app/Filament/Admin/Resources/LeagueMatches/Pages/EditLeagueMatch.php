<?php

namespace App\Filament\Admin\Resources\LeagueMatches\Pages;

use App\Filament\Admin\Resources\LeagueMatches\LeagueMatchResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLeagueMatch extends EditRecord
{
    protected static string $resource = LeagueMatchResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

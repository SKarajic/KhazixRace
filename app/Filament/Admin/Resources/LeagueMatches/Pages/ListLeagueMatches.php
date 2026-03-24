<?php

namespace App\Filament\Admin\Resources\LeagueMatches\Pages;

use App\Filament\Admin\Resources\LeagueMatches\LeagueMatchResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLeagueMatches extends ListRecords
{
    protected static string $resource = LeagueMatchResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

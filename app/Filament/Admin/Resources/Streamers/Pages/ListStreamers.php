<?php

namespace App\Filament\Admin\Resources\Streamers\Pages;

use App\Filament\Admin\Resources\Streamers\StreamerResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStreamers extends ListRecords
{
    protected static string $resource = StreamerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

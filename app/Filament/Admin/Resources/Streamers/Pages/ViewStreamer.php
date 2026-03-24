<?php

namespace App\Filament\Admin\Resources\Streamers\Pages;

use App\Filament\Admin\Resources\Streamers\StreamerResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewStreamer extends ViewRecord
{
    protected static string $resource = StreamerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}

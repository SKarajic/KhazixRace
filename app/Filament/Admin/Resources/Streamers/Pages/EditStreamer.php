<?php

namespace App\Filament\Admin\Resources\Streamers\Pages;

use App\Filament\Admin\Resources\Streamers\StreamerResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditStreamer extends EditRecord
{
    protected static string $resource = StreamerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

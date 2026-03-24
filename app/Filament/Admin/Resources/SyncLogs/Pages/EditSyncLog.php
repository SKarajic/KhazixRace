<?php

namespace App\Filament\Admin\Resources\SyncLogs\Pages;

use App\Filament\Admin\Resources\SyncLogs\SyncLogResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSyncLog extends EditRecord
{
    protected static string $resource = SyncLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

<?php

namespace App\Filament\Admin\Resources\SyncLogs\Pages;

use App\Filament\Admin\Resources\SyncLogs\SyncLogResource;
use Filament\Resources\Pages\CreateRecord;

class CreateSyncLog extends CreateRecord
{
    protected static string $resource = SyncLogResource::class;
}

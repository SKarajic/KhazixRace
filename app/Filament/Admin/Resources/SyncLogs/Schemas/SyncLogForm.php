<?php

namespace App\Filament\Admin\Resources\SyncLogs\Schemas;

use Filament\Schemas\Schema;

class SyncLogForm
{
    /**
     * Configure and return the sync log form schema.
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([]);
    }
}

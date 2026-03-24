<?php

namespace App\Facades;

use App\Support\Services\RiotApi\Client;
use Illuminate\Support\Facades\Facade;

/**
 * @mixin Client
 */
class RiotApi extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'riot-api';
    }
}

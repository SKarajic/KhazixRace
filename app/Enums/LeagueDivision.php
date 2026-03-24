<?php

namespace App\Enums;

enum LeagueDivision: string
{
    case I = 'I';
    case II = 'II';
    case III = 'III';
    case IV = 'IV';

    public function sortOrder(): int
    {
        return match ($this) {
            self::IV => 0,
            self::III => 1,
            self::II => 2,
            self::I => 3,
        };
    }

    public function lpOffset(): int
    {
        return match ($this) {
            self::IV => 0,
            self::III => 100,
            self::II => 200,
            self::I => 300,
        };
    }
}

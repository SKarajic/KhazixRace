<?php

namespace App\Enums;

enum LeagueTier: string
{
    case Iron = 'IRON';
    case Bronze = 'BRONZE';
    case Silver = 'SILVER';
    case Gold = 'GOLD';
    case Platinum = 'PLATINUM';
    case Emerald = 'EMERALD';
    case Diamond = 'DIAMOND';
    case Master = 'MASTER';
    case Grandmaster = 'GRANDMASTER';
    case Challenger = 'CHALLENGER';

    public function sortOrder(): int
    {
        return match ($this) {
            self::Iron => 0,
            self::Bronze => 1,
            self::Silver => 2,
            self::Gold => 3,
            self::Platinum => 4,
            self::Emerald => 5,
            self::Diamond => 6,
            self::Master => 7,
            self::Grandmaster => 8,
            self::Challenger => 9,
        };
    }

    public function lpBase(): int
    {
        return match ($this) {
            self::Iron => 0,
            self::Bronze => 400,
            self::Silver => 800,
            self::Gold => 1200,
            self::Platinum => 1600,
            self::Emerald => 2000,
            self::Diamond => 2400,
            self::Master, self::Grandmaster, self::Challenger => 2800,
        };
    }

    public function label(): string
    {
        return ucfirst(strtolower($this->value));
    }

    /**
     * Filament badge color for this tier.
     */
    public function filamentColor(): string
    {
        return match ($this) {
            self::Iron, self::Silver => 'gray',
            self::Bronze, self::Gold => 'warning',
            self::Platinum => 'info',
            self::Emerald => 'success',
            self::Diamond => 'primary',
            self::Master, self::Grandmaster, self::Challenger => 'danger',
        };
    }

    public static function fromString(string $value): ?self
    {
        return self::tryFrom(strtoupper($value));
    }
}

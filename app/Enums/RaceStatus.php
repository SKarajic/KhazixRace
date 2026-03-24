<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum RaceStatus: string implements HasColor, HasLabel
{
    case Upcoming = 'upcoming';
    case Active = 'active';
    case Finished = 'finished';

    public function getLabel(): string
    {
        return ucfirst($this->value);
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Upcoming => 'warning',
            self::Active => 'success',
            self::Finished => 'gray',
        };
    }
}

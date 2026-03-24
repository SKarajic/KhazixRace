<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum StreamingPlatform: string implements HasColor, HasLabel
{
    case Twitch = 'twitch';
    case YouTube = 'youtube';
    case Kick = 'kick';
    case Other = 'other';

    public function getLabel(): string
    {
        return match ($this) {
            self::Twitch => 'Twitch',
            self::YouTube => 'YouTube',
            self::Kick => 'Kick',
            self::Other => 'Other',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Twitch => 'primary',
            self::YouTube => 'danger',
            self::Kick => 'success',
            self::Other => 'gray',
        };
    }

    /**
     * Generate a stream URL for the given display name on this platform.
     *
     * @param  string  $name  The streamer's display name; non-alphanumeric characters are stripped.
     */
    public function streamUrl(string $name): string
    {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));

        return match ($this) {
            self::Twitch => "https://twitch.tv/$slug",
            self::YouTube => "https://youtube.com/@$slug",
            self::Kick => "https://kick.com/$slug",
            self::Other => '',
        };
    }
}

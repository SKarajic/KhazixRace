<?php

namespace App\Support;

/**
 * Constructs CDragon asset URLs directly from IDs — no HTTP fetch needed.
 *
 * Champion icon URLs follow a stable, predictable pattern based on champion ID,
 * so we can skip calling the champion-summary.json endpoint entirely.
 */
class CdnUrls
{
    public static function championIcon(int $id): ?string
    {
        if ($id <= 0) {
            return null;
        }

        $version = config('phizz.cdragon.version', 'latest');

        return "https://raw.communitydragon.org/{$version}/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/{$id}.png";
    }
}

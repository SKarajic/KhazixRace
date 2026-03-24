<?php

namespace App\Data;

use App\Models\LeagueMatch;
use Phizz\Apis\Lol\MatchV5\Objects\ParticipantData;
use Phizz\Facades\Phizz;
use Spatie\LaravelData\Data;

/**
 * Pre-computed display values for a single participant row in the match scoreboard.
 *
 * All fields are formatted strings ready for direct rendering — no further computation
 * is needed by the view layer. Build instances via {@see self::forTeam()}.
 */
class ParticipantDisplayData extends Data
{
    public function __construct(
        /** CDragon square portrait URL, or null when the champion ID is unknown. */
        public readonly ?string $champion_icon_url,
        /** Riot ID game name, falling back to legacy summoner name. */
        public readonly string $summoner_name,
        /** Formatted kill / death / assist string, e.g. "4 / 2 / 7". */
        public readonly string $kda,
        /** Kill participation as a percentage string, e.g. "62%", or "—" when unavailable. */
        public readonly string $kill_participation,
        /** Total CS with per-minute rate appended, e.g. "187 (7.5/m)". */
        public readonly string $cs,
        /** Total damage to champions, formatted with thousands separators. */
        public readonly string $damage,
        /** Gold earned, formatted with thousands separators. */
        public readonly string $gold,
        /** Wards placed / killed, e.g. "5 / 3". */
        public readonly string $wards,
        /** Inline HTML string of item `<img>` tags, or "—" when the participant has no items. */
        public readonly string $items_html,
    ) {}

    // -------------------------------------------------------------------------
    // Factory
    // -------------------------------------------------------------------------

    /**
     * Build a display row for every participant on the given team within a match.
     *
     * @param  int  $teamId  100 for blue side, 200 for red side.
     * @return array<int, self>
     */
    public static function forTeam(LeagueMatch $match, int $teamId): array
    {
        $participants = $match->data->info->participants ?? collect();
        $teamKills = $participants->where('team_id', $teamId)->sum('kills');
        $duration = $match->data->info->game_duration ?? 0;

        return $participants
            ->where('team_id', $teamId)
            ->values()
            ->map(fn (ParticipantData $p) => self::fromParticipant($p, $teamKills, $duration))
            ->all();
    }

    // -------------------------------------------------------------------------
    // Internal construction
    // -------------------------------------------------------------------------

    /**
     * Map a single {@see ParticipantData} object to its display representation.
     *
     * @param  int  $teamKills  Pre-aggregated kill count for the participant's team.
     * @param  int  $duration  Match duration in seconds, used to derive CS/min.
     */
    private static function fromParticipant(ParticipantData $p, int $teamKills, int $duration): self
    {
        return new self(
            champion_icon_url: $p->champion_id > 0 ? Phizz::cdragon()->lol->championSummary($p->champion_id)->squarePortraitUrl() : null,
            summoner_name: $p->riot_id_game_name ?: ($p->summoner_name ?: '—'),
            kda: self::formatKda($p),
            kill_participation: self::formatKillParticipation($p, $teamKills),
            cs: self::formatCs($p, $duration),
            damage: number_format($p->total_damage_dealt_to_champions),
            gold: number_format($p->gold_earned),
            wards: $p->wards_placed.' / '.$p->wards_killed,
            items_html: self::buildItemsHtml($p),
        );
    }

    // -------------------------------------------------------------------------
    // Formatting helpers
    // -------------------------------------------------------------------------

    /** Format the K/D/A triplet as "kills / deaths / assists". */
    private static function formatKda(ParticipantData $p): string
    {
        return $p->kills.' / '.$p->deaths.' / '.$p->assists;
    }

    /**
     * Format kill participation as a percentage, or "—" when team has zero kills.
     */
    private static function formatKillParticipation(ParticipantData $p, int $teamKills): string
    {
        if ($teamKills === 0) {
            return '—';
        }

        return round(($p->kills + $p->assists) / $teamKills * 100).'%';
    }

    /**
     * Format CS total with a per-minute rate in parentheses, e.g. "187 (7.5/m)".
     * The rate is omitted when duration is zero.
     */
    private static function formatCs(ParticipantData $p, int $duration): string
    {
        $cs = $p->total_minions_killed + $p->neutral_minions_killed;
        $rate = $duration > 0 ? ' ('.round($cs / ($duration / 60), 1).'/m)' : '';

        return $cs.$rate;
    }

    /**
     * Build a row of inline `<img>` tags for the participant's six item slots and trinket.
     * Returns "—" when the participant holds no items.
     */
    private static function buildItemsHtml(ParticipantData $p): string
    {
        $itemIds = array_filter(
            [$p->item_0, $p->item_1, $p->item_2, $p->item_3, $p->item_4, $p->item_5],
            fn (int $id) => $id > 0,
        );

        $html = collect($itemIds)
            ->map(fn (int $id) => self::itemImg($id, 'h-7 w-7'))
            ->join('');

        if ($p->item_6 > 0) {
            $html .= ' '.self::itemImg($p->item_6, 'h-6 w-6 opacity-60');
        }

        return $html ?: '—';
    }

    /**
     * Render a single item slot as an `<img>` tag with a CDragon icon and name tooltip.
     *
     * @param  string  $sizeClasses  Tailwind size + any extra utility classes for this slot.
     */
    private static function itemImg(int $id, string $sizeClasses): string
    {
        $item = Phizz::cdragon()->lol->items($id);
        $src = e($item?->iconUrl() ?? '');
        $title = e($item?->name ?? '');

        return "<img src=\"{$src}\" class=\"inline-block {$sizeClasses} rounded\" title=\"{$title}\">";
    }
}

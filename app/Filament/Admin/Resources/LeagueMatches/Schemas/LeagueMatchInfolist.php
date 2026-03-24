<?php

namespace App\Filament\Admin\Resources\LeagueMatches\Schemas;

use App\Data\ParticipantDisplayData;
use App\Models\LeagueMatch;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\RepeatableEntry\TableColumn;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Phizz\Apis\Lol\MatchV5\Objects\ParticipantData;
use Phizz\Facades\Phizz;

class LeagueMatchInfolist
{
    /**
     * Configure and return the league match infolist schema.
     */
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([

            Section::make('Match Overview')
                ->icon('heroicon-o-puzzle-piece')
                ->columns(2)
                ->schema([
                    Grid::make(8)->schema([
                        ImageEntry::make('champion_portrait')
                            ->label('Champion')
                            ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->champion_id ?? 0) > 0 ? Phizz::cdragon()->lol->championSummary($id)->squarePortraitUrl() : null)
                            ->imageSize(72)
                            ->square()
                            ->columnSpan(1),

                        Grid::make(3)->columnSpan(7)->schema([
                            TextEntry::make('champion_name')
                                ->label('Champion')
                                ->state(fn (LeagueMatch $r) => static::getParticipant($r)?->champion_name ?? '—'),

                            TextEntry::make('role')
                                ->label('Role')
                                ->state(fn (LeagueMatch $r) => match (static::getParticipant($r)?->team_position ?? '') {
                                    'TOP' => 'Top',
                                    'JUNGLE' => 'Jungle',
                                    'MIDDLE' => 'Mid',
                                    'BOTTOM' => 'Bot',
                                    'UTILITY' => 'Support',
                                    default => '—',
                                })
                                ->badge()
                                ->color('gray'),

                            TextEntry::make('result')
                                ->label('Result')
                                ->state(fn (LeagueMatch $r) => $r->is_win ? 'Victory' : 'Defeat')
                                ->badge()
                                ->color(fn (LeagueMatch $r) => $r->is_win ? 'success' : 'danger'),

                            TextEntry::make('queue')
                                ->label('Queue')
                                ->state(fn (LeagueMatch $r) => static::queueName($r->data->info->queue_id ?? 0))
                                ->badge()
                                ->color('gray'),

                            TextEntry::make('duration')
                                ->label('Duration')
                                ->state(fn (LeagueMatch $r) => gmdate('i:s', $r->data->info->game_duration ?? 0)),

                            TextEntry::make('game_start_at')
                                ->label('Played at')
                                ->dateTime('M j, Y H:i'),

                            TextEntry::make('patch')
                                ->label('Patch')
                                ->state(fn (LeagueMatch $r) => implode('.', array_slice(
                                    explode('.', $r->data->info->game_version ?? ''),
                                    0,
                                    2
                                ))),

                            TextEntry::make('match_id')
                                ->label('Match ID')
                                ->copyable(),

                            TextEntry::make('level')
                                ->label('Level')
                                ->state(fn (LeagueMatch $r) => static::getParticipant($r)?->champ_level ?? '—'),
                        ]),
                    ]),
                ]),

            Section::make('Performance')
                ->icon('heroicon-o-chart-bar')
                ->columns(4)
                ->schema([
                    TextEntry::make('kda')
                        ->label('K / D / A')
                        ->state(function (LeagueMatch $r) {
                            $p = static::getParticipant($r);

                            return ($p?->kills ?? 0).' / '.($p?->deaths ?? 0).' / '.($p?->assists ?? 0);
                        }),

                    TextEntry::make('kda_ratio')
                        ->label('KDA Ratio')
                        ->state(function (LeagueMatch $r) {
                            $p = static::getParticipant($r);
                            $deaths = $p?->deaths ?? 0;

                            if ($deaths === 0) {
                                return 'Perfect';
                            }

                            return round((($p?->kills ?? 0) + ($p?->assists ?? 0)) / $deaths, 2).':1';
                        }),

                    TextEntry::make('kill_participation')
                        ->label('Kill Participation')
                        ->state(function (LeagueMatch $r) {
                            $p = static::getParticipant($r);
                            $teamKills = ($r->data->info->participants ?? collect())
                                ->where('team_id', $p?->team_id ?? 0)
                                ->sum('kills');

                            if ($teamKills === 0) {
                                return '—';
                            }

                            return round((($p?->kills ?? 0) + ($p?->assists ?? 0)) / $teamKills * 100).'%';
                        }),

                    TextEntry::make('cs')
                        ->label('CS')
                        ->state(function (LeagueMatch $r) {
                            $p = static::getParticipant($r);

                            return ($p?->total_minions_killed ?? 0) + ($p?->neutral_minions_killed ?? 0);
                        }),

                    TextEntry::make('cs_per_min')
                        ->label('CS / min')
                        ->state(function (LeagueMatch $r) {
                            $p = static::getParticipant($r);
                            $duration = $r->data->info->game_duration ?? 0;

                            if ($duration === 0) {
                                return '—';
                            }

                            $cs = ($p?->total_minions_killed ?? 0) + ($p?->neutral_minions_killed ?? 0);

                            return round($cs / ($duration / 60), 1);
                        }),

                    TextEntry::make('damage')
                        ->label('Damage to Champions')
                        ->state(fn (LeagueMatch $r) => number_format(
                            static::getParticipant($r)?->total_damage_dealt_to_champions ?? 0
                        )),

                    TextEntry::make('damage_taken')
                        ->label('Damage Taken')
                        ->state(fn (LeagueMatch $r) => number_format(
                            static::getParticipant($r)?->total_damage_taken ?? 0
                        )),

                    TextEntry::make('gold')
                        ->label('Gold Earned')
                        ->state(fn (LeagueMatch $r) => number_format(
                            static::getParticipant($r)?->gold_earned ?? 0
                        )),

                    TextEntry::make('vision')
                        ->label('Vision Score')
                        ->state(fn (LeagueMatch $r) => static::getParticipant($r)?->vision_score ?? '—'),

                    TextEntry::make('wards_placed')
                        ->label('Wards Placed')
                        ->state(fn (LeagueMatch $r) => static::getParticipant($r)?->wards_placed ?? '—'),

                    TextEntry::make('wards_killed')
                        ->label('Wards Killed')
                        ->state(fn (LeagueMatch $r) => static::getParticipant($r)?->wards_killed ?? '—'),

                    TextEntry::make('control_wards')
                        ->label('Control Wards')
                        ->state(fn (LeagueMatch $r) => static::getParticipant($r)?->control_wards_purchased ?? '—'),
                ]),

            Section::make('Items')
                ->icon('heroicon-o-squares-2x2')
                ->columns(7)
                ->schema([
                    ImageEntry::make('item_0')
                        ->label('Item 1')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->item_0 ?? 0) > 0 ? Phizz::cdragon()->lol->items($id)->iconUrl() : null)
                        ->imageSize(52)->square(),
                    ImageEntry::make('item_1')
                        ->label('Item 2')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->item_1 ?? 0) > 0 ? Phizz::cdragon()->lol->items($id)->iconUrl() : null)
                        ->imageSize(52)->square(),
                    ImageEntry::make('item_2')
                        ->label('Item 3')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->item_2 ?? 0) > 0 ? Phizz::cdragon()->lol->items($id)->iconUrl() : null)
                        ->imageSize(52)->square(),
                    ImageEntry::make('item_3')
                        ->label('Item 4')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->item_3 ?? 0) > 0 ? Phizz::cdragon()->lol->items($id)->iconUrl() : null)
                        ->imageSize(52)->square(),
                    ImageEntry::make('item_4')
                        ->label('Item 5')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->item_4 ?? 0) > 0 ? Phizz::cdragon()->lol->items($id)->iconUrl() : null)
                        ->imageSize(52)->square(),
                    ImageEntry::make('item_5')
                        ->label('Item 6')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->item_5 ?? 0) > 0 ? Phizz::cdragon()->lol->items($id)->iconUrl() : null)
                        ->imageSize(52)->square(),
                    ImageEntry::make('item_6')
                        ->label('Trinket')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->item_6 ?? 0) > 0 ? Phizz::cdragon()->lol->items($id)->iconUrl() : null)
                        ->imageSize(52)->square(),
                ]),

            Section::make('Spells & Runes')
                ->icon('heroicon-o-sparkles')
                ->columns(8)
                ->schema([
                    ImageEntry::make('spell1')
                        ->label('Spell 1')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->summoner_1_id ?? 0) > 0 ? Phizz::cdragon()->lol->summonerSpells($id)->iconUrl() : null)
                        ->imageSize(52)->square(),

                    ImageEntry::make('spell2')
                        ->label('Spell 2')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->summoner_2_id ?? 0) > 0 ? Phizz::cdragon()->lol->summonerSpells($id)->iconUrl() : null)
                        ->imageSize(52)->square(),

                    ImageEntry::make('keystone')
                        ->label('Keystone')
                        ->state(fn (LeagueMatch $r) => ($id = static::getParticipant($r)?->perks?->styles?->first()?->selections?->first()?->perk ?? 0) > 0
                            ? Phizz::cdragon()->lol->perks($id)->iconUrl()
                            : null
                        )
                        ->imageSize(52)->circular(),

                    ImageEntry::make('secondary_style')
                        ->label('Secondary Style')
                        ->state(function (LeagueMatch $r) {
                            $styleId = static::getParticipant($r)?->perks?->styles?->get(1)?->style ?? 0;
                            if ($styleId <= 0) {
                                return null;
                            }

                            return Phizz::cdragon()->lol->perkstyles()->styles->firstWhere('id', $styleId)?->iconUrl();
                        })
                        ->imageSize(52)->circular(),

                    TextEntry::make('primary_runes')
                        ->label('Primary Runes')
                        ->columnSpan(2)
                        ->state(function (LeagueMatch $r) {
                            $selections = static::getParticipant($r)?->perks?->styles?->first()?->selections ?? collect();

                            return $selections
                                ->map(fn ($s) => ($id = $s?->perk ?? 0) > 0 ? Phizz::cdragon()->lol->perks($id)->name : '')
                                ->filter()
                                ->join(', ');
                        }),

                    TextEntry::make('secondary_runes')
                        ->label('Secondary Runes')
                        ->columnSpan(2)
                        ->state(function (LeagueMatch $r) {
                            $selections = static::getParticipant($r)?->perks?->styles?->get(1)?->selections ?? collect();

                            return $selections
                                ->map(fn ($s) => ($id = $s?->perk ?? 0) > 0 ? Phizz::cdragon()->lol->perks($id)->name : '')
                                ->filter()
                                ->join(', ');
                        }),
                ]),

            Section::make('Team Comparison')
                ->icon('heroicon-o-scale')
                ->columns(3)
                ->schema([
                    TextEntry::make('blue_kills')->label('Blue Kills')
                        ->state(fn (LeagueMatch $r) => ($r->data->info->participants ?? collect())
                            ->where('team_id', 100)->sum('kills')),
                    TextEntry::make('stat_kills')->label('Kills')->state('Kills')->badge()->color('gray'),
                    TextEntry::make('red_kills')->label('Red Kills')
                        ->state(fn (LeagueMatch $r) => ($r->data->info->participants ?? collect())
                            ->where('team_id', 200)->sum('kills')),

                    TextEntry::make('blue_gold')->label('Blue Gold')
                        ->state(fn (LeagueMatch $r) => number_format((int) ($r->data->info->participants ?? collect())
                            ->where('team_id', 100)->sum('gold_earned'))),
                    TextEntry::make('stat_gold')->label('Gold')->state('Gold')->badge()->color('warning'),
                    TextEntry::make('red_gold')->label('Red Gold')
                        ->state(fn (LeagueMatch $r) => number_format((int) ($r->data->info->participants ?? collect())
                            ->where('team_id', 200)->sum('gold_earned'))),

                    TextEntry::make('blue_damage')->label('Blue Damage')
                        ->state(fn (LeagueMatch $r) => number_format((int) ($r->data->info->participants ?? collect())
                            ->where('team_id', 100)->sum('total_damage_dealt_to_champions'))),
                    TextEntry::make('stat_damage')->label('Damage')->state('Damage')->badge()->color('danger'),
                    TextEntry::make('red_damage')->label('Red Damage')
                        ->state(fn (LeagueMatch $r) => number_format((int) ($r->data->info->participants ?? collect())
                            ->where('team_id', 200)->sum('total_damage_dealt_to_champions'))),

                    TextEntry::make('blue_cs')->label('Blue CS')
                        ->state(fn (LeagueMatch $r) => ($r->data->info->participants ?? collect())
                            ->where('team_id', 100)
                            ->sum(fn (ParticipantData $p) => $p->total_minions_killed + $p->neutral_minions_killed)),
                    TextEntry::make('stat_cs')->label('CS')->state('CS')->badge()->color('gray'),
                    TextEntry::make('red_cs')->label('Red CS')
                        ->state(fn (LeagueMatch $r) => ($r->data->info->participants ?? collect())
                            ->where('team_id', 200)
                            ->sum(fn (ParticipantData $p) => $p->total_minions_killed + $p->neutral_minions_killed)),
                ]),

            Section::make('Blue Team')
                ->icon('heroicon-o-shield-check')
                ->schema([
                    RepeatableEntry::make('blue_team')
                        ->hiddenLabel()
                        ->state(fn (LeagueMatch $r) => ParticipantDisplayData::forTeam($r, 100))
                        ->table([
                            TableColumn::make('Champion'),
                            TableColumn::make('Player'),
                            TableColumn::make('K / D / A'),
                            TableColumn::make('KP'),
                            TableColumn::make('CS'),
                            TableColumn::make('Damage'),
                            TableColumn::make('Gold'),
                            TableColumn::make('Wards'),
                            TableColumn::make('Items'),
                        ])
                        ->schema([
                            ImageEntry::make('champion_icon_url')->hiddenLabel()->imageSize(32)->square(),
                            TextEntry::make('summoner_name')->hiddenLabel(),
                            TextEntry::make('kda')->hiddenLabel(),
                            TextEntry::make('kill_participation')->hiddenLabel(),
                            TextEntry::make('cs')->hiddenLabel(),
                            TextEntry::make('damage')->hiddenLabel(),
                            TextEntry::make('gold')->hiddenLabel(),
                            TextEntry::make('wards')->hiddenLabel(),
                            TextEntry::make('items_html')->html()->hiddenLabel(),
                        ]),
                ]),

            Section::make('Red Team')
                ->icon('heroicon-o-shield-exclamation')
                ->schema([
                    RepeatableEntry::make('red_team')
                        ->hiddenLabel()
                        ->state(fn (LeagueMatch $r) => ParticipantDisplayData::forTeam($r, 200))
                        ->table([
                            TableColumn::make('Champion'),
                            TableColumn::make('Player'),
                            TableColumn::make('K / D / A'),
                            TableColumn::make('KP'),
                            TableColumn::make('CS'),
                            TableColumn::make('Damage'),
                            TableColumn::make('Gold'),
                            TableColumn::make('Wards'),
                            TableColumn::make('Items'),
                        ])
                        ->schema([
                            ImageEntry::make('champion_icon_url')->hiddenLabel()->imageSize(32)->square(),
                            TextEntry::make('summoner_name')->hiddenLabel(),
                            TextEntry::make('kda')->hiddenLabel(),
                            TextEntry::make('kill_participation')->hiddenLabel(),
                            TextEntry::make('cs')->hiddenLabel(),
                            TextEntry::make('damage')->hiddenLabel(),
                            TextEntry::make('gold')->hiddenLabel(),
                            TextEntry::make('wards')->hiddenLabel(),
                            TextEntry::make('items_html')->html()->hiddenLabel(),
                        ]),
                ]),

            Section::make('Rank at Match')
                ->icon('heroicon-o-trophy')
                ->columns(2)
                ->visible(fn (LeagueMatch $record) => $record->tier !== null)
                ->schema([
                    TextEntry::make('rank_label')
                        ->label('Tier / Division')
                        ->badge()
                        ->color(fn (LeagueMatch $record) => $record->rank_color),

                    TextEntry::make('points')
                        ->label('LP')
                        ->state(fn (LeagueMatch $record) => $record->points.' LP'),
                ]),
        ]);
    }

    /**
     * Retrieve the typed ParticipantData for the league account associated with the match.
     */
    private static function getParticipant(LeagueMatch $record): ?ParticipantData
    {
        return $record->participant($record->leagueAccount?->puuid);
    }

    /**
     * Return a human-readable queue name for the given queue ID.
     */
    private static function queueName(int $queueId): string
    {
        return match ($queueId) {
            420 => 'Ranked Solo/Duo',
            440 => 'Ranked Flex',
            400 => 'Normal Draft',
            430 => 'Normal Blind',
            450 => 'ARAM',
            default => 'Unknown',
        };
    }
}

<?php

use Phizz\Enums\Platform;
use Phizz\Retry;
use Phizz\TTL;

return [

    /*
    |--------------------------------------------------------------------------
    | Riot Games API Key
    |--------------------------------------------------------------------------
    |
    | Your Riot Games API key. You can obtain one from the Riot Developer Portal.
    | It is recommended to store this in your .env file as RIOT_API_KEY.
    |
    */

    'api_key' => env('RIOT_API_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Default Platform
    |--------------------------------------------------------------------------
    |
    | The platform region to use when making API calls. This can be overridden
    | on a per‑call basis.
    |
    */

    'default_platform' => env('RIOT_DEFAULT_PLATFORM', Platform::NA),

    /*
    |--------------------------------------------------------------------------
    | Request Timeout (seconds)
    |--------------------------------------------------------------------------
    |
    | The maximum number of seconds to wait for a response from the Riot API.
    |
    */

    'timeout' => env('RIOT_TIMEOUT', 60),

    /*
    |--------------------------------------------------------------------------
    | Retry Strategy
    |--------------------------------------------------------------------------
    |
    | The strategy used to calculate delays between retries on 429 responses.
    | Use Retry::exponential() for 1s, 2s, 4s, 8s... backoff, or
    | Retry::fixed(2) for a constant 2s delay between retries.
    |
    */

    'retry' => [
        'strategy' => Retry::exponential(),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | Enable or disable caching of API responses. The default TTL applies to
    | any endpoint not listed under method[]. Per-method TTLs are keyed by
    | the generated TTL constants, navigated via the TTL class:
    |   \Phizz\TTL::lol::matchV5::getMatch => 86400
    |
    */

    'cache' => [
        'enabled' => env('RIOT_CACHE_ENABLED', true),
        'store' => env('RIOT_CACHE_STORE', null),
        'default' => env('RIOT_CACHE_TTL', 60),
        'method' => [
            TTL::riot::accountV1::getByPuuid => 3600,
            TTL::riot::accountV1::getByRiotId => 3600,
            TTL::riot::accountV1::getByAccessToken => 300,
            TTL::riot::accountV1::getActiveShard => 3600,
            TTL::riot::accountV1::getActiveRegion => 3600,
            TTL::lol::challengesV1::getAllChallengeConfigs => 3600,
            TTL::lol::challengesV1::getAllChallengePercentiles => 3600,
            TTL::lol::challengesV1::getChallengeConfigs => 3600,
            TTL::lol::challengesV1::getChallengeLeaderboards => 300,
            TTL::lol::challengesV1::getChallengePercentiles => 3600,
            TTL::lol::challengesV1::getPlayerData => 300,
            TTL::lol::championMasteryV4::getAllChampionMasteriesByPuuid => 300,
            TTL::lol::championMasteryV4::getChampionMasteryByPuuid => 300,
            TTL::lol::championMasteryV4::getTopChampionMasteriesByPuuid => 300,
            TTL::lol::championMasteryV4::getChampionMasteryScoreByPuuid => 300,
            TTL::lol::championV3::getChampionInfo => 3600,
            TTL::lol::clashV1::getPlayersByPuuid => 300,
            TTL::lol::clashV1::getTeamById => 300,
            TTL::lol::clashV1::getTournaments => 600,
            TTL::lol::clashV1::getTournamentByTeam => 300,
            TTL::lol::clashV1::getTournamentById => 600,
            TTL::lol::leagueExpV4::getLeagueEntries => 300,
            TTL::lol::leagueV4::getChallengerLeague => 300,
            TTL::lol::leagueV4::getLeagueEntriesByPuuid => 300,
            TTL::lol::leagueV4::getLeagueEntries => 300,
            TTL::lol::leagueV4::getGrandmasterLeague => 300,
            TTL::lol::leagueV4::getLeagueById => 300,
            TTL::lol::leagueV4::getMasterLeague => 300,
            TTL::lol::matchV5::getMatchIdsByPuuid => 300,
            TTL::lol::matchV5::getReplay => 86400,
            TTL::lol::matchV5::getMatch => 86400,
            TTL::lol::matchV5::getTimeline => 86400,
            TTL::lol::rsoMatchV1::getMatchIds => 300,
            TTL::lol::rsoMatchV1::getMatch => 86400,
            TTL::lol::rsoMatchV1::getTimeline => 86400,
            TTL::lol::spectatorV5::getCurrentGameInfoByPuuid => 30,
            TTL::lol::summonerV4::getByPuuid => 3600,
            TTL::lol::summonerV4::getByAccessToken => 300,
            TTL::lol::tournamentV5::getTournamentCode => 3600,
            TTL::lol::tournamentV5::getGames => 600,
            TTL::lol::tournamentV5::getLobbyEventsByCode => 300,
            TTL::lol::tournamentStubV5::getTournamentCode => 3600,
            TTL::lol::tournamentStubV5::getLobbyEventsByCode => 300,
            TTL::lor::inventoryV1::getCards => 3600,
            TTL::lor::matchV1::getMatchIdsByPuuid => 300,
            TTL::lor::matchV1::getMatch => 86400,
            TTL::lor::rankedV1::getLeaderboards => 300,
            TTL::riftbound::contentV1::getContent => 3600,
            TTL::tft::leagueV1::getLeagueEntriesByPuuid => 300,
            TTL::tft::leagueV1::getChallengerLeague => 300,
            TTL::tft::leagueV1::getLeagueEntries => 300,
            TTL::tft::leagueV1::getGrandmasterLeague => 300,
            TTL::tft::leagueV1::getLeagueById => 300,
            TTL::tft::leagueV1::getMasterLeague => 300,
            TTL::tft::leagueV1::getTopRatedLadder => 300,
            TTL::tft::matchV1::getMatchIdsByPuuid => 300,
            TTL::tft::matchV1::getMatch => 86400,
            TTL::tft::spectatorV5::getCurrentGameInfoByPuuid => 30,
            TTL::tft::summonerV1::getByPuuid => 3600,
            TTL::tft::summonerV1::getByAccessToken => 300,
            TTL::val::consoleMatchV1::getMatch => 86400,
            TTL::val::consoleMatchV1::getMatchlist => 300,
            TTL::val::consoleMatchV1::getRecent => 300,
            TTL::val::consoleRankedV1::getLeaderboard => 300,
            TTL::val::contentV1::getContent => 3600,
            TTL::val::matchV1::getMatch => 86400,
            TTL::val::matchV1::getMatchlist => 300,
            TTL::val::matchV1::getRecent => 300,
            TTL::val::rankedV1::getLeaderboard => 300,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging
    |--------------------------------------------------------------------------
    |
    | Log all API requests and responses? Useful for debugging.
    |
    */

    'logging' => [
        'enabled' => env('RIOT_LOGGING_ENABLED', false),
    ],

];

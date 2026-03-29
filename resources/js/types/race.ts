export type LeaderboardRow = {
    streamer_id: number;
    name: string;
    platform: string | null;
    stream_url: string | null;
    account_display_name: string;
    tier: string | null;
    rank: string | null;
    points: number | null;
    total_lp: number;
    wins: number;
    losses: number;
    win_rate: number;
    champion_icon_url: string | null;
};

export type LpPoint = { t: string; lp: number };

export type LpSeries = { name: string; data: LpPoint[] };

export type MatchParticipantPreview = {
    champion_icon_url: string | null;
    champion_name: string;
    team_id: number;
    is_tracked: boolean;
    // Detailed scoreboard fields — present on streamer page, absent on race home page
    summoner_name?: string;
    kills?: number;
    deaths?: number;
    assists?: number;
    kill_participation?: number;
    cs?: number;
    cs_per_min?: number | null;
    damage?: number;
    gold?: number;
    wards_placed?: number;
    wards_killed?: number;
    items?: (string | null)[];
    trinket_url?: string | null;
};

export type MatchFeedRow = {
    id: number;
    streamer_id: number | null;
    streamer_name: string;
    champion_name: string;
    champion_icon_url: string | null;
    is_win: boolean | null;
    kda: string;
    kills: number | null;
    deaths: number | null;
    assists: number | null;
    tier: string | null;
    rank: string | null;
    points: number | null;
    game_start_at: string | null;
    duration: number | null;
    cs: number | null;
    damage: number | null;
    participants: MatchParticipantPreview[];
};

export type RaceStats = {
    total_games: number;
    total_kills: number;
    total_assists: number;
    avg_duration: number;
    avg_damage: number;
    avg_cs: number;
    most_played_champion: { name: string; icon_url: string | null; games: number; wins: number } | null;
    highest_damage_game: { streamer_name: string; champion_name: string; champion_icon_url: string | null; damage: number } | null;
    best_wr: { name: string; win_rate: number; wins: number; losses: number } | null;
    most_wins: { name: string; wins: number; champion_icon_url: string | null } | null;
};

export type StreamerSpotlightEntry = {
    streamer_id: number;
    name: string;
    stream_url: string | null;
    tier: string | null;
    rank: string | null;
    points: number | null;
    total_lp: number;
    wins: number;
    losses: number;
    win_rate: number;
    champion_icon_url: string | null;
    stats: {
        avg_kda: number;
        avg_damage: number;
        avg_cs_per_min: number;
        avg_duration: number;
        longest_win_streak: number;
        best_kda_game: { champion_name: string; champion_icon_url: string | null; kda: string } | null;
    } | null;
    champion_stats: {
        champion_name: string;
        champion_icon_url: string | null;
        games: number;
        wins: number;
        losses: number;
        win_rate: number;
        avg_kda: number;
    }[];
};

export type RaceData = {
    id: number;
    name: string;
    starts_at: string;
    ends_at: string;
    stream_url: string | null;
    leaderboard: LeaderboardRow[];
    lp_series: LpSeries[];
    matches: MatchFeedRow[];
    stats: RaceStats | null;
    streamers_spotlight: StreamerSpotlightEntry[];
};

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
    tier: string | null;
    rank: string | null;
    points: number | null;
    game_start_at: string | null;
    duration: number | null;
    cs: number | null;
    damage: number | null;
    participants: MatchParticipantPreview[];
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
};

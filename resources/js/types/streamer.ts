export type ChampionStat = {
    champion_name: string;
    champion_icon_url: string | null;
    games: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_kda: number;
};

export type StreamerStats = {
    avg_kda: number;
    avg_damage: number;
    avg_cs_per_min: number;
    avg_duration: number;
    longest_win_streak: number;
    best_kda_game: { champion_name: string; champion_icon_url: string | null; kda: string } | null;
};

export type StreamerProfile = {
    id: number;
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
    champion_stats: ChampionStat[];
    stats: StreamerStats | null;
};

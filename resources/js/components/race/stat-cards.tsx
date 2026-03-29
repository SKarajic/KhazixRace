import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { RaceStats } from '@/types/race';

interface Props {
    stats: RaceStats;
    participantCount: number;
}

function fmtDuration(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

function fmtK(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
};

const card = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function RaceStatCards({ stats, participantCount }: Props) {
    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">Race Stats</h2>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
                <StatCard variants={card} label="Participants" value={participantCount} />
                <StatCard variants={card} label="Games Played" value={stats.total_games} />
                <StatCard variants={card} label="Total Kills" value={stats.total_kills.toLocaleString()} />
                <StatCard variants={card} label="Total Assists" value={stats.total_assists.toLocaleString()} />
                <StatCard variants={card} label="Avg Duration" value={fmtDuration(stats.avg_duration)} mono />
                <StatCard variants={card} label="Avg Damage" value={fmtK(stats.avg_damage)} />
                <StatCard variants={card} label="Avg CS" value={String(stats.avg_cs)} />

                {stats.most_played_champion && (
                    <ChampionStatCard
                        variants={card}
                        label="Most Played"
                        champion={stats.most_played_champion}
                        sub={`${stats.most_played_champion.games}G · ${Math.round((stats.most_played_champion.wins / stats.most_played_champion.games) * 100)}% WR`}
                    />
                )}

                {stats.highest_damage_game && (
                    <ChampionStatCard
                        variants={card}
                        label="Peak Damage"
                        champion={{
                            name: stats.highest_damage_game.champion_name,
                            icon_url: stats.highest_damage_game.champion_icon_url,
                            games: 0,
                            wins: 0,
                        }}
                        sub={`${fmtK(stats.highest_damage_game.damage)} — ${stats.highest_damage_game.streamer_name}`}
                    />
                )}

                {stats.best_wr && (
                    <StatCard
                        variants={card}
                        label="Best Win Rate"
                        value={`${stats.best_wr.win_rate}%`}
                        sub={`${stats.best_wr.name} · ${stats.best_wr.wins}W ${stats.best_wr.losses}L`}
                    />
                )}

                {stats.most_wins && (
                    <ChampionStatCard
                        variants={card}
                        label="Most Wins"
                        champion={{
                            name: stats.most_wins.name,
                            icon_url: stats.most_wins.champion_icon_url,
                            games: 0,
                            wins: stats.most_wins.wins,
                        }}
                        sub={`${stats.most_wins.wins} wins`}
                        nameIsStreamer
                    />
                )}
            </motion.div>
        </section>
    );
}

function StatCard({
    label,
    value,
    sub,
    mono = false,
    variants,
}: {
    label: string;
    value: string | number;
    sub?: string;
    mono?: boolean;
    variants: Variants;
}) {
    return (
        <motion.div
            variants={variants}
            className="bg-[#0d0d18] border border-white/5 rounded-lg px-4 py-4 flex flex-col gap-1"
        >
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#4a4a60]">{label}</p>
            <p className={`text-2xl font-black text-white leading-none ${mono ? 'font-mono' : ''}`}>{value}</p>
            {sub && <p className="text-xs text-[#4a4a60] truncate mt-0.5">{sub}</p>}
        </motion.div>
    );
}

function ChampionStatCard({
    label,
    champion,
    sub,
    nameIsStreamer = false,
    variants,
}: {
    label: string;
    champion: { name: string; icon_url: string | null; games: number; wins: number };
    sub?: string;
    nameIsStreamer?: boolean;
    variants: Variants;
}) {
    return (
        <motion.div
            variants={variants}
            className="bg-[#0d0d18] border border-white/5 rounded-lg px-4 py-4 flex flex-col gap-2"
        >
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#4a4a60]">{label}</p>
            <div className="flex items-center gap-2.5">
                {champion.icon_url ? (
                    <img src={champion.icon_url} alt={champion.name} loading="lazy" className="w-9 h-9 rounded flex-shrink-0" />
                ) : (
                    <div className="w-9 h-9 rounded bg-white/5 flex-shrink-0" />
                )}
                <div className="min-w-0">
                    <p className={`text-sm font-bold text-white leading-tight truncate ${nameIsStreamer ? '' : ''}`}>
                        {champion.name}
                    </p>
                    {sub && <p className="text-xs text-[#4a4a60] truncate">{sub}</p>}
                </div>
            </div>
        </motion.div>
    );
}

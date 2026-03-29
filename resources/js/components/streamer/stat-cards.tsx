import { motion } from 'framer-motion';
import type { StreamerStats } from '@/types/streamer';

interface Props {
    stats: StreamerStats;
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

const cardVariant = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function StreamerStatCards({ stats }: Props) {
    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">Stats (Last 20 Games)</h2>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
                <StatCard label="Avg KDA" value={stats.avg_kda.toFixed(2)} mono />
                <StatCard label="Avg Damage" value={fmtK(stats.avg_damage)} />
                <StatCard label="Avg CS / min" value={String(stats.avg_cs_per_min)} mono />
                <StatCard label="Avg Duration" value={fmtDuration(stats.avg_duration)} mono />
                <StatCard
                    label="Longest Win Streak"
                    value={stats.longest_win_streak}
                    sub={stats.longest_win_streak >= 3 ? '🔥 On fire' : undefined}
                />

                {stats.best_kda_game && (
                    <motion.div
                        variants={cardVariant}
                        className="bg-[#0d0d18] border border-white/5 rounded-lg px-4 py-4 flex flex-col gap-2"
                    >
                        <p className="text-[10px] tracking-[0.35em] uppercase text-[#4a4a60]">Best KDA Game</p>
                        <div className="flex items-center gap-2.5">
                            {stats.best_kda_game.champion_icon_url ? (
                                <img
                                    src={stats.best_kda_game.champion_icon_url}
                                    alt={stats.best_kda_game.champion_name}
                                    className="w-9 h-9 rounded flex-shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded bg-white/5 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{stats.best_kda_game.champion_name}</p>
                                <p className="text-xs font-mono text-[#4a4a60]">{stats.best_kda_game.kda}</p>
                            </div>
                        </div>
                    </motion.div>
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
}: {
    label: string;
    value: string | number;
    sub?: string;
    mono?: boolean;
}) {
    return (
        <motion.div
            variants={cardVariant}
            className="bg-[#0d0d18] border border-white/5 rounded-lg px-4 py-4 flex flex-col gap-1"
        >
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#4a4a60]">{label}</p>
            <p className={`text-2xl font-black text-white leading-none ${mono ? 'font-mono' : ''}`}>{value}</p>
            {sub && <p className="text-xs text-[#4a4a60] mt-0.5">{sub}</p>}
        </motion.div>
    );
}

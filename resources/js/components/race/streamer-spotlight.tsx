import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { tierColor, tierLabel } from '@/lib/tier-utils';
import type { StreamerSpotlightEntry } from '@/types/race';

const TIER_ACCENT_HEX: Record<string, string> = {
    IRON: '#71717a',
    BRONZE: '#b45309',
    SILVER: '#94a3b8',
    GOLD: '#facc15',
    PLATINUM: '#2dd4bf',
    EMERALD: '#34d399',
    DIAMOND: '#38bdf8',
    MASTER: '#c084fc',
    GRANDMASTER: '#fb7185',
    CHALLENGER: '#67e8f9',
};

function tierAccentHex(tier: string | null): string {
    return TIER_ACCENT_HEX[(tier ?? '').toUpperCase()] ?? '#4a4a60';
}

function fmtDuration(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

function fmtK(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

interface Props {
    streamers: StreamerSpotlightEntry[];
}

export function StreamerSpotlight({ streamers }: Props) {
    const [activeIdx, setActiveIdx] = useState(0);
    const active = streamers[Math.min(activeIdx, streamers.length - 1)];

    if (!active) return null;

    const accent = tierAccentHex(active.tier);
    const totalGames = active.wins + active.losses;
    const winPct = totalGames > 0 ? (active.wins / totalGames) * 100 : 0;
    const wrColor = winPct >= 60 ? 'text-cyan-400' : winPct >= 50 ? 'text-white' : 'text-red-400';

    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">Streamer Stats</h2>

            {/* Tabs */}
            {streamers.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {streamers.map((s, i) => (
                        <button
                            key={s.streamer_id}
                            onClick={() => setActiveIdx(i)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                                i === activeIdx
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'text-[#4a4a60] border border-white/5 hover:text-white hover:border-white/15'
                            }`}
                        >
                            {s.name}
                            {s.tier && (
                                <span className={`ml-2 text-[10px] ${i === activeIdx ? 'opacity-70' : 'opacity-40'}`}>
                                    {tierLabel(s.tier)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active.streamer_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="relative rounded-xl overflow-hidden border border-white/5 bg-[#0d0d18]"
                >
                    {/* Champion blurred background */}
                    {active.champion_icon_url && (
                        <img
                            src={active.champion_icon_url}
                            alt=""
                            aria-hidden
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover scale-[3.5] blur-3xl opacity-[0.12] select-none pointer-events-none"
                        />
                    )}

                    {/* Tier accent top line */}
                    <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: `linear-gradient(to right, transparent, ${accent}90, transparent)` }}
                    />

                    {/* Subtle glow below accent */}
                    <div
                        className="absolute top-0 left-0 right-0 h-20 opacity-10 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse 60% 100% at 50% 0%, ${accent}, transparent)` }}
                    />

                    {/* Content */}
                    <div className="relative p-5 sm:p-6">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                            {/* Champion icon + glow */}
                            <div className="relative flex-shrink-0 self-center sm:self-auto">
                                {active.champion_icon_url ? (
                                    <>
                                        <div
                                            className="absolute rounded-full opacity-50 blur-lg"
                                            style={{ inset: '-10px', background: `radial-gradient(circle, ${accent}50, transparent 70%)` }}
                                        />
                                        <img
                                            src={active.champion_icon_url}
                                            alt=""
                                            loading="lazy"
                                            className="relative w-16 h-16 rounded-full"
                                            style={{ border: `2px solid ${accent}50`, boxShadow: `0 0 24px ${accent}25` }}
                                        />
                                    </>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10" />
                                )}
                            </div>

                            {/* Identity */}
                            <div className="flex-1 min-w-0 text-center sm:text-left">
                                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider leading-none truncate">
                                    {active.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 justify-center sm:justify-start">
                                    {active.tier ? (
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${tierColor(active.tier)}`}>
                                            {tierLabel(active.tier)} {active.rank}
                                            {active.points !== null && ` · ${active.points} LP`}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-[#4a4a60]">Unranked</span>
                                    )}
                                    {active.stream_url && (
                                        <a
                                            href={active.stream_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/20 transition-colors"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                            Live
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* W / L / WR */}
                            {totalGames > 0 && (
                                <div className="flex items-center gap-3 flex-shrink-0 self-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-emerald-400 tabular-nums leading-none">
                                            {active.wins}
                                        </div>
                                        <div className="text-[10px] tracking-widest uppercase text-emerald-400/50 mt-0.5">
                                            W
                                        </div>
                                    </div>
                                    <div className="text-[#2a2a40] text-xl font-light">/</div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-red-400 tabular-nums leading-none">
                                            {active.losses}
                                        </div>
                                        <div className="text-[10px] tracking-widest uppercase text-red-400/50 mt-0.5">
                                            L
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-white/10" />
                                    <div className="text-center">
                                        <div className={`text-2xl font-black tabular-nums leading-none ${wrColor}`}>
                                            {active.win_rate}%
                                        </div>
                                        <div className="text-[10px] tracking-widest uppercase text-[#4a4a60] mt-0.5">
                                            {totalGames}G
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Win bar */}
                        {totalGames > 0 && (
                            <div className="h-1 rounded-full overflow-hidden bg-white/5 mb-5">
                                <motion.div
                                    className="h-full rounded-full bg-emerald-500/60"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${winPct}%` }}
                                    transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
                                />
                            </div>
                        )}

                        {/* Stats grid */}
                        {active.stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                                <MiniStat label="Avg KDA" value={active.stats.avg_kda.toFixed(2)} mono />
                                <MiniStat label="Avg Damage" value={fmtK(active.stats.avg_damage)} />
                                <MiniStat label="Avg CS/min" value={String(active.stats.avg_cs_per_min)} mono />
                                <MiniStat label="Avg Duration" value={fmtDuration(active.stats.avg_duration)} mono />
                            </div>
                        )}

                        {/* Most played champions */}
                        {active.champion_stats.length > 0 && (
                            <div>
                                <p className="text-[10px] tracking-[0.35em] uppercase text-[#4a4a60] mb-2">
                                    Most Played
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {active.champion_stats.map((cs) => (
                                        <ChampionPill key={cs.champion_name} stat={cs} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
}

function MiniStat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#4a4a60] leading-tight">{label}</p>
            <p className={`text-lg font-black text-white leading-none mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
    );
}

function ChampionPill({
    stat,
}: {
    stat: {
        champion_name: string;
        champion_icon_url: string | null;
        games: number;
        wins: number;
        win_rate: number;
    };
}) {
    const wrColor =
        stat.win_rate >= 60 ? 'text-cyan-400' : stat.win_rate >= 50 ? 'text-white' : 'text-red-400';

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07]">
            {stat.champion_icon_url ? (
                <img
                    src={stat.champion_icon_url}
                    alt={stat.champion_name}
                    loading="lazy"
                    className="w-6 h-6 rounded flex-shrink-0"
                />
            ) : (
                <div className="w-6 h-6 rounded bg-white/5 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold text-white">{stat.champion_name}</span>
            <span className="text-xs text-[#4a4a60]">{stat.games}G</span>
            <span className={`text-xs font-bold ${wrColor}`}>{stat.win_rate}%</span>
        </div>
    );
}

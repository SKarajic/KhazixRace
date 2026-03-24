import { motion } from 'framer-motion';
import { tierColor, tierLabel } from '@/lib/tier-utils';
import type { StreamerProfile } from '@/types/streamer';

interface Props {
    streamer: StreamerProfile;
    championIconUrl: string | null;
}

export function StreamerHero({ streamer, championIconUrl }: Props) {
    const totalGames = streamer.wins + streamer.losses;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-full overflow-hidden"
        >
            {/* Blurred champion as cinematic backdrop */}
            {championIconUrl && (
                <img
                    src={championIconUrl}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover scale-150 blur-2xl opacity-20 select-none pointer-events-none"
                />
            )}
            <div className="absolute inset-0 bg-[#05050a]/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/40 via-transparent to-[#05050a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/60 via-transparent to-[#05050a]/60" />

            {/* Two-column content grid */}
            <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">

                {/* ── Left: Identity ── */}
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45 }}
                    className="flex flex-col items-center lg:items-start text-center lg:text-left"
                >
                    {/* Champion icon */}
                    {championIconUrl && (
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative mb-5"
                        >
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    boxShadow: '0 0 0 1px #00d4ff25, 0 0 40px #00d4ff20, 0 0 80px #00d4ff10',
                                    borderRadius: '50%',
                                    transform: 'scale(1.3)',
                                }}
                            />
                            <img
                                src={championIconUrl}
                                alt=""
                                className="w-32 h-32 rounded-full border border-cyan-500/30 relative"
                                style={{ boxShadow: '0 0 24px #00d4ff20' }}
                            />
                        </motion.div>
                    )}

                    <p className="text-xs tracking-[0.5em] uppercase text-[#4a4a60] mb-1.5">
                        {streamer.platform ?? 'Streamer'}
                    </p>

                    <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase text-white mb-3 drop-shadow-lg">
                        {streamer.name}
                    </h1>

                    {streamer.tier ? (
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${tierColor(streamer.tier)}`}
                        >
                            {tierLabel(streamer.tier)} {streamer.rank}
                            {streamer.points !== null && ` — ${streamer.points} LP`}
                        </span>
                    ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-white/5 text-[#4a4a60] backdrop-blur-sm">
                            Unranked
                        </span>
                    )}

                    <p className="mt-2 text-sm text-[#4a4a60]">{streamer.account_display_name}</p>

                    {streamer.stream_url && (
                        <a
                            href={streamer.stream_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            Watch Stream →
                        </a>
                    )}
                </motion.div>

                {/* ── Right: Stats + Most Played ── */}
                <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    className="flex flex-col items-center lg:items-start"
                >
                    {/* W / L / WR stat strip */}
                    {totalGames > 0 && (
                        <div className="flex items-center gap-5 mb-8">
                            <div className="text-center lg:text-left">
                                <div className="text-2xl font-bold text-emerald-400 leading-none">{streamer.wins}</div>
                                <div className="text-xs text-emerald-400/60 mt-0.5">Win</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-2xl font-bold text-red-400 leading-none">{streamer.losses}</div>
                                <div className="text-xs text-red-400/60 mt-0.5">Loss</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center lg:text-left">
                                <div
                                    className={`text-2xl font-bold leading-none ${
                                        streamer.win_rate >= 60
                                            ? 'text-cyan-400'
                                            : streamer.win_rate >= 50
                                              ? 'text-white'
                                              : 'text-[#4a4a60]'
                                    }`}
                                >
                                    {streamer.win_rate}%
                                </div>
                                <div className="text-xs text-[#4a4a60] mt-0.5">{totalGames} games</div>
                            </div>
                        </div>
                    )}

                    {/* Most played champions */}
                    {streamer.champion_stats.length > 0 && (
                        <div className="w-full max-w-lg">
                            <p className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-3">
                                Most Played (Last 50 Games)
                            </p>
                            <div className="space-y-1.5">
                                {streamer.champion_stats.map((stat, i) => (
                                    <motion.div
                                        key={stat.champion_name}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 + i * 0.06, duration: 0.3 }}
                                        className="flex items-center gap-3 bg-white/[0.04] rounded-lg px-3 py-2.5 border border-white/[0.06]"
                                    >
                                        {stat.champion_icon_url ? (
                                            <img
                                                src={stat.champion_icon_url}
                                                alt={stat.champion_name}
                                                className="w-9 h-9 rounded flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded bg-white/5 flex-shrink-0" />
                                        )}

                                        <span className="text-sm font-medium text-white w-24 flex-shrink-0 truncate">
                                            {stat.champion_name}
                                        </span>

                                        <span className="text-xs text-[#4a4a60] flex-shrink-0 w-6">{stat.games}G</span>

                                        <span className="text-xs flex-shrink-0">
                                            <span className="text-emerald-400">{stat.wins}W</span>
                                            <span className="text-[#2a2a40] mx-0.5">/</span>
                                            <span className="text-red-400">{stat.losses}L</span>
                                        </span>

                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        stat.win_rate >= 60
                                                            ? 'bg-cyan-500'
                                                            : stat.win_rate >= 50
                                                              ? 'bg-white/40'
                                                              : 'bg-red-500/60'
                                                    }`}
                                                    style={{ width: `${stat.win_rate}%` }}
                                                />
                                            </div>
                                            <span
                                                className={`text-xs font-semibold flex-shrink-0 w-9 text-right ${
                                                    stat.win_rate >= 60
                                                        ? 'text-cyan-400'
                                                        : stat.win_rate >= 50
                                                          ? 'text-white'
                                                          : 'text-red-400'
                                                }`}
                                            >
                                                {stat.win_rate}%
                                            </span>
                                        </div>

                                        <span className="text-xs text-[#4a4a60] flex-shrink-0">
                                            {stat.avg_kda.toFixed(2)} KDA
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}

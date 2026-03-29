import { motion } from 'framer-motion';
import { tierColor, tierLabel } from '@/lib/tier-utils';
import type { StreamerProfile } from '@/types/streamer';

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

interface Props {
    streamer: StreamerProfile;
    championIconUrl: string | null;
}

export function StreamerHero({ streamer, championIconUrl }: Props) {
    const totalGames = streamer.wins + streamer.losses;
    const winPct = totalGames > 0 ? (streamer.wins / totalGames) * 100 : 0;
    const accent = tierAccentHex(streamer.tier);
    const wrColor = winPct >= 60 ? 'text-cyan-400' : winPct >= 50 ? 'text-white' : 'text-red-400';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full overflow-hidden"
            style={{ minHeight: 380 }}
        >
            {/* Champion splash as full-bleed backdrop */}
            {championIconUrl && (
                <img
                    src={championIconUrl}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover scale-[2.5] blur-2xl opacity-30 select-none pointer-events-none"
                />
            )}

            {/* Layered gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/50 via-[#05050a]/40 to-[#05050a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/80 via-transparent to-[#05050a]/80" />
            <div className="absolute inset-0 bg-[#05050a]/30" />

            {/* Tier-colored top accent */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                    background: `linear-gradient(to right, transparent 0%, ${accent}90 50%, transparent 100%)`,
                }}
            />
            {/* Subtle tier glow below the accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-24 opacity-20"
                style={{
                    background: `radial-gradient(ellipse 60% 100% at 50% 0%, ${accent} 0%, transparent 100%)`,
                }}
            />

            {/* Content — aligned to bottom of the banner */}
            <div
                className="relative max-w-5xl mx-auto px-6 flex flex-col justify-end"
                style={{ minHeight: 380 }}
            >
                <div className="pt-20 pb-10">

                    {/* Top row: icon + identity + actions */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-7 mb-7">

                        {/* Champion icon */}
                        {championIconUrl ? (
                            <motion.div
                                initial={{ scale: 0.75, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="relative flex-shrink-0 self-center sm:self-auto"
                            >
                                {/* Ambient glow */}
                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        inset: '-12px',
                                        background: `radial-gradient(circle, ${accent}50 0%, transparent 70%)`,
                                        filter: 'blur(8px)',
                                    }}
                                />
                                <img
                                    src={championIconUrl}
                                    alt=""
                                    className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full"
                                    style={{
                                        border: `2px solid ${accent}50`,
                                        boxShadow: `0 0 0 1px ${accent}20, 0 0 40px ${accent}25`,
                                    }}
                                />
                            </motion.div>
                        ) : (
                            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/5 border border-white/10 flex-shrink-0 self-center sm:self-auto" />
                        )}

                        {/* Identity */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12, duration: 0.4 }}
                            className="flex-1 text-center sm:text-left"
                        >
                            <p className="text-xs tracking-[0.6em] uppercase text-[#4a4a60] mb-2">
                                {streamer.platform ?? 'Streamer'}
                            </p>
                            <h1
                                className="font-black uppercase leading-none mb-3 drop-shadow-lg"
                                style={{
                                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                                    letterSpacing: '0.12em',
                                    color: '#fff',
                                    textShadow: `0 0 60px ${accent}40`,
                                }}
                            >
                                {streamer.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                                {streamer.tier ? (
                                    <span className={`px-3 py-1 rounded text-sm font-bold ${tierColor(streamer.tier)}`}>
                                        {tierLabel(streamer.tier)} {streamer.rank}
                                        {streamer.points !== null && ` · ${streamer.points} LP`}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded text-sm font-semibold bg-white/5 text-[#4a4a60] border border-white/10">
                                        Unranked
                                    </span>
                                )}
                                <span className="text-xs text-[#4a4a60]">{streamer.account_display_name}</span>
                            </div>
                        </motion.div>

                        {/* Stream button */}
                        {streamer.stream_url && (
                            <motion.a
                                href={streamer.stream_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25, duration: 0.4 }}
                                className="self-center sm:self-auto flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                Watch Live
                            </motion.a>
                        )}
                    </div>

                    {/* Stats row */}
                    {totalGames > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22, duration: 0.4 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8"
                        >
                            {/* W / L / WR numbers */}
                            <div className="flex items-baseline gap-5 justify-center sm:justify-start">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-emerald-400 leading-none tabular-nums">
                                        {streamer.wins}
                                    </div>
                                    <div className="text-[10px] tracking-[0.3em] uppercase text-emerald-400/50 mt-1">
                                        Wins
                                    </div>
                                </div>
                                <div className="text-[#2a2a40] text-2xl font-light">/</div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-red-400 leading-none tabular-nums">
                                        {streamer.losses}
                                    </div>
                                    <div className="text-[10px] tracking-[0.3em] uppercase text-red-400/50 mt-1">
                                        Losses
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-center">
                                    <div className={`text-3xl font-black leading-none tabular-nums ${wrColor}`}>
                                        {streamer.win_rate}%
                                    </div>
                                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#4a4a60] mt-1">
                                        {totalGames}G
                                    </div>
                                </div>
                            </div>

                            {/* Win/loss bar */}
                            <div className="flex-1 max-w-xs self-center sm:self-auto">
                                <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                                    <motion.div
                                        className="h-full rounded-full bg-emerald-500/70"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${winPct}%` }}
                                        transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

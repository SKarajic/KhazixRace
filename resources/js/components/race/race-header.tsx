import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useCountdown } from '@/hooks/use-countdown';
import { tierLabel } from '@/lib/tier-utils';
import type { LeaderboardRow, RaceData } from '@/types/race';

interface Props {
    race: RaceData;
    isLast?: boolean;
}

export function RaceHeader({ race, isLast = false }: Props) {
    const isActive = !isLast && new Date(race.ends_at) > new Date();
    const countdown = useCountdown(race.ends_at);

    const totalGames = race.leaderboard.reduce((n, r) => n + r.wins + r.losses, 0);
    const leader = race.leaderboard[0] ?? null;

    return (
        <div className="relative w-full overflow-hidden" style={{ minHeight: 'min(88svh, 700px)' }}>

            {/* ── Background ── */}
            <div className="absolute inset-0 bg-[#05050a]" />

            {/* Hero image — high opacity, let it dominate */}
            <img
                src="/images/hero.png"
                alt=""
                aria-hidden
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover object-[50%_25%] select-none pointer-events-none opacity-70"
            />

            {/* Single directional overlay — only darkens the left side for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/95 via-[#05050a]/50 to-[#05050a]/10" />

            {/* Top edge fade into nav */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#05050a]/80 to-transparent" />

            {/* Bottom fade into page */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#05050a] via-[#05050a]/60 to-transparent" />

            {/* Corner brackets — offset below the fixed navbar (≈4rem) */}
            <div className="absolute top-[4.5rem] left-6 w-8 h-8 border-l border-t border-white/15" />
            <div className="absolute top-[4.5rem] right-6 w-8 h-8 border-r border-t border-white/15" />
            <div className="absolute bottom-16 left-6 w-8 h-8 border-l border-b border-white/15" />
            <div className="absolute bottom-16 right-6 w-8 h-8 border-r border-b border-white/15" />

            {/* ── Content ── */}
            <div
                className="relative flex flex-col justify-center max-w-5xl mx-auto px-6"
                style={{ minHeight: 'min(88svh, 700px)', paddingTop: '5rem', paddingBottom: '5.5rem' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-xl"
                >
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-px w-6 bg-white/30" />
                        <span className="text-[10px] tracking-[0.6em] uppercase text-white/40">
                            {isLast ? 'Final Standings' : 'League of Legends'}
                        </span>
                    </div>

                    {/* Race name */}
                    <h1
                        className="font-black uppercase text-white leading-[0.88] mb-5"
                        style={{
                            fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
                            letterSpacing: '0.05em',
                            textShadow: '0 2px 40px rgba(0,0,0,0.8)',
                        }}
                    >
                        {race.name}
                    </h1>

                    {/* Status */}
                    <div className="flex items-center gap-4 mb-7">
                        <StatusBadge active={isActive} />
                        {leader?.tier && (
                            <span className="text-xs text-white/30">
                                <span className="text-white/60 font-semibold">{leader.name}</span>
                                {' · '}
                                {tierLabel(leader.tier)} {leader.rank}
                                {leader.points !== null && ` ${leader.points} LP`}
                            </span>
                        )}
                        {totalGames > 0 && (
                            <span className="text-xs text-white/30">
                                <span className="text-white/60 font-semibold tabular-nums">{totalGames}</span> games played
                            </span>
                        )}
                    </div>

                    {/* Countdown */}
                    {isActive && !countdown.expired && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-7"
                        >
                            <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 mb-3">
                                Ends in
                            </p>
                            <div className="flex items-end gap-1.5">
                                {countdown.days > 0 && (
                                    <>
                                        <CountdownBlock value={countdown.days} label="Days" />
                                        <Colon />
                                    </>
                                )}
                                <CountdownBlock value={countdown.hours} label="Hrs" />
                                <Colon />
                                <CountdownBlock value={countdown.minutes} label="Min" />
                                <Colon />
                                <CountdownBlock value={countdown.seconds} label="Sec" />
                            </div>
                        </motion.div>
                    )}

                    {/* Stream link */}
                    {race.stream_url && (
                        <motion.a
                            href={race.stream_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase bg-white/10 text-white border border-white/20 hover:bg-white/15 transition-colors backdrop-blur-sm"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Watch Stream
                        </motion.a>
                    )}
                </motion.div>
            </div>

            {/* ── Participant strip ── */}
            {race.leaderboard.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0"
                >
                    <div className="max-w-5xl mx-auto px-6 pb-4">
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                            <span className="text-[10px] tracking-[0.4em] uppercase text-white/25 flex-shrink-0 mr-2">
                                Participants
                            </span>
                            {race.leaderboard.map((row, i) => (
                                <ParticipantChip key={row.streamer_id} row={row} position={i + 1} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function ParticipantChip({ row, position }: { row: LeaderboardRow; position: number }) {
    return (
        <Link
            href={`/streamers/${row.streamer_id}`}
            className="flex items-center gap-1.5 flex-shrink-0 px-2 py-1.5 rounded bg-black/50 border border-white/10 hover:border-white/30 hover:bg-black/70 transition-colors backdrop-blur-sm"
        >
            <span className="text-[10px] font-mono text-white/25 w-3 text-center">{position}</span>
            {row.champion_icon_url && (
                <img src={row.champion_icon_url} alt="" className="w-5 h-5 rounded-sm flex-shrink-0" />
            )}
            <span className="text-xs font-semibold text-white/80">{row.name}</span>
        </Link>
    );
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="bg-black/50 border border-white/15 rounded-lg px-2.5 py-2 sm:px-4 sm:py-2.5 min-w-[3rem] sm:min-w-[4.5rem] text-center backdrop-blur-sm">
                <span className="tabular-nums text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[9px] tracking-[0.35em] uppercase text-white/30">{label}</span>
        </div>
    );
}

function Colon() {
    return (
        <span className="text-2xl sm:text-4xl font-black text-white/20 mb-5 flex-shrink-0 select-none">
            :
        </span>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs tracking-widest uppercase font-semibold backdrop-blur-sm ${
                active
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40'
                    : 'bg-white/5 text-white/30 border border-white/10'
            }`}
        >
            {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
            {active ? 'Live' : 'Ended'}
        </span>
    );
}

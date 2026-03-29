import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useCountdown } from '@/hooks/use-countdown';
import { tierColor, tierLabel } from '@/lib/tier-utils';
import type { LeaderboardRow, RaceData } from '@/types/race';

interface Props {
    race: RaceData;
    isLast?: boolean;
    /** Most-played champion icon for the winner (from deferred spotlight data).
     *  undefined = not yet loaded (show placeholder), null = no data available */
    winnerChampionIconUrl?: string | null;
}

export function RaceHeader({ race, isLast = false, winnerChampionIconUrl }: Props) {
    const isActive = !isLast && new Date(race.ends_at) > new Date();
    const countdown = useCountdown(race.ends_at);

    const totalGames = race.leaderboard.reduce((n, r) => n + r.wins + r.losses, 0);
    const leader = race.leaderboard[0] ?? null;

    // Gold accent when race has ended, cyan decorations otherwise
    const accentGradient = isActive
        ? 'from-transparent via-cyan-500/20 to-transparent'
        : 'from-transparent via-yellow-400/30 to-transparent';

    return (
        <div className="relative w-full overflow-hidden" style={{ minHeight: 'min(88svh, 700px)' }}>

            {/* ── Background ── */}
            <div className="absolute inset-0 bg-[#05050a]" />

            {/* Hero image */}
            <img
                src="/images/hero.png"
                alt=""
                aria-hidden
                draggable={false}
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover object-[50%_25%] select-none pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-70' : 'opacity-40'}`}
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/95 via-[#05050a]/50 to-[#05050a]/10" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#05050a]/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#05050a] via-[#05050a]/60 to-transparent" />

            {/* Top accent line — gold when ended */}
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentGradient}`} />

            {/* Corner brackets */}
            <div className="absolute top-[4.5rem] left-6 w-8 h-8 border-l border-t border-white/15" />
            <div className="absolute top-[4.5rem] right-6 w-8 h-8 border-r border-t border-white/15" />
            <div className="absolute bottom-16 left-6 w-8 h-8 border-l border-b border-white/15" />
            <div className="absolute bottom-16 right-6 w-8 h-8 border-r border-b border-white/15" />

            {/* ── Content ── */}
            <div
                className="relative flex flex-col justify-center max-w-5xl mx-auto px-6"
                style={{ minHeight: 'min(88svh, 700px)', paddingTop: '5rem', paddingBottom: '5.5rem' }}
            >
                {isActive ? (
                    /* ── ACTIVE RACE ── */
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-xl"
                    >
                        <ActiveContent
                            race={race}
                            leader={leader}
                            totalGames={totalGames}
                            countdown={countdown}
                        />
                    </motion.div>
                ) : leader ? (
                    /* ── END CARD ── */
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center justify-between gap-8 w-full"
                    >
                        <EndCard
                            race={race}
                            winner={leader}
                            winnerChampionIconUrl={winnerChampionIconUrl}
                        />
                    </motion.div>
                ) : null}
            </div>

            {/* ── Participant strip ── */}
            {race.leaderboard.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0"
                >
                    <div className="max-w-5xl mx-auto px-6 pb-4">
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                            <span className="text-[10px] tracking-[0.4em] uppercase text-white/25 flex-shrink-0 mr-2">
                                {isActive ? 'Participants' : 'Standings'}
                            </span>
                            {race.leaderboard.map((row, i) => (
                                <ParticipantChip
                                    key={row.streamer_id}
                                    row={row}
                                    position={i + 1}
                                    isEnded={!isActive}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

/* ── Active race content ── */
function ActiveContent({
    race,
    leader,
    totalGames,
    countdown,
}: {
    race: RaceData;
    leader: LeaderboardRow | null;
    totalGames: number;
    countdown: ReturnType<typeof useCountdown>;
}) {
    return (
        <>
            <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-6 bg-white/30" />
                <span className="text-[10px] tracking-[0.6em] uppercase text-white/40">
                    League of Legends
                </span>
            </div>

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

            <div className="flex items-center gap-4 mb-7">
                <StatusBadge active />
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

            {!countdown.expired && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="mb-7"
                >
                    <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 mb-3">Ends in</p>
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

            {race.stream_url && (
                <motion.a
                    href={race.stream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase bg-white/10 text-white border border-white/20 hover:bg-white/15 transition-colors backdrop-blur-sm"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Watch Stream
                </motion.a>
            )}
        </>
    );
}

/* ── End card ── */
function EndCard({
    race,
    winner,
    winnerChampionIconUrl,
}: {
    race: RaceData;
    winner: LeaderboardRow;
    winnerChampionIconUrl?: string | null;
}) {
    const loaded = winnerChampionIconUrl !== undefined;
    const hasIcon = loaded && winnerChampionIconUrl !== null;

    return (
        <>
            {/* Left: text content */}
            <div className="flex-1 min-w-0">
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-px w-6 bg-yellow-400/60" />
                    <span className="text-[10px] tracking-[0.6em] uppercase text-yellow-400/70">
                        Race Champion
                    </span>
                </div>

                {/* Winner name */}
                <h1
                    className="font-black uppercase text-white leading-[0.88] mb-2"
                    style={{
                        fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
                        letterSpacing: '0.05em',
                        textShadow: '0 2px 40px rgba(0,0,0,0.8)',
                    }}
                >
                    {winner.name}
                </h1>

                {/* Race name sub-label */}
                <p className="text-sm text-white/30 uppercase tracking-[0.2em] mb-7">
                    {race.name}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Tier badge */}
                    {winner.tier && (
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${tierColor(winner.tier)}`}>
                            {tierLabel(winner.tier)} {winner.rank}
                            {winner.points !== null && ` · ${winner.points} LP`}
                        </span>
                    )}

                    {/* W / L / WR */}
                    {(winner.wins + winner.losses) > 0 && (
                        <span className="text-xs text-white/50">
                            <span className="text-emerald-400 font-semibold">{winner.wins}W</span>
                            {' / '}
                            <span className="text-red-400 font-semibold">{winner.losses}L</span>
                            {' · '}
                            <span className="font-semibold text-white/70">{winner.win_rate}% WR</span>
                        </span>
                    )}

                    {/* Total LP */}
                    {winner.total_lp > 0 && (
                        <span className="text-xs font-bold text-yellow-400/80 tabular-nums">
                            {winner.total_lp.toLocaleString()} LP
                        </span>
                    )}
                </div>
            </div>

            {/* Right: champion icon with glow */}
            <div className="relative flex-shrink-0 hidden sm:block">
                <div className="relative w-24 h-24">
                    {/* Radial glow */}
                    <div
                        className="absolute rounded-full blur-2xl"
                        style={{ inset: '-20px', background: 'radial-gradient(circle, rgba(250,204,21,0.25), transparent 70%)' }}
                    />
                    {hasIcon ? (
                        <motion.img
                            key={winnerChampionIconUrl}
                            src={winnerChampionIconUrl!}
                            alt={winner.name}
                            loading="lazy"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="relative w-24 h-24 rounded-full ring-2 ring-yellow-400/50 object-cover"
                            style={{ boxShadow: '0 0 32px rgba(250,204,21,0.2)' }}
                        />
                    ) : (
                        /* Placeholder while spotlight data loads */
                        <div className="relative w-24 h-24 rounded-full bg-white/5 border border-white/10" />
                    )}
                </div>
            </div>
        </>
    );
}

/* ── Shared sub-components ── */

function ParticipantChip({
    row,
    position,
    isEnded,
}: {
    row: LeaderboardRow;
    position: number;
    isEnded: boolean;
}) {
    const medal = isEnded
        ? position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null
        : null;

    return (
        <Link
            href={`/streamers/${row.streamer_id}`}
            className={`flex items-center gap-1.5 flex-shrink-0 px-2 py-1.5 rounded border transition-colors backdrop-blur-sm ${
                isEnded && position <= 3
                    ? 'bg-black/60 border-yellow-400/20 hover:border-yellow-400/40'
                    : 'bg-black/50 border-white/10 hover:border-white/30 hover:bg-black/70'
            }`}
        >
            {medal && <span className="text-xs leading-none">{medal}</span>}
            {!medal && <span className="text-[10px] font-mono text-white/25 w-3 text-center">{position}</span>}
            {row.champion_icon_url && (
                <img src={row.champion_icon_url} alt="" loading="lazy" className="w-5 h-5 rounded-sm flex-shrink-0" />
            )}
            <span className={`text-xs font-semibold ${isEnded && position <= 3 ? 'text-white' : 'text-white/80'}`}>
                {row.name}
            </span>
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
        <span className="text-2xl sm:text-4xl font-black text-white/20 mb-5 flex-shrink-0 select-none">:</span>
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

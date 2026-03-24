import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { tierLabel } from '@/lib/tier-utils';
import type { MatchFeedRow, MatchParticipantPreview } from '@/types/race';

interface Props {
    matches: MatchFeedRow[];
}

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
};

const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function fmt(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ── Scoreboard sub-components ─────────────────────────────────────────────────

function ItemSlots({ items, trinket }: { items: (string | null)[]; trinket?: string | null }) {
    return (
        <div className="flex items-center gap-px ml-auto flex-shrink-0">
            {Array.from({ length: 6 }).map((_, i) => {
                const url = items[i] ?? null;
                return url ? (
                    <img key={i} src={url} alt="" className="w-[22px] h-[22px] rounded-sm" />
                ) : (
                    <div key={i} className="w-[22px] h-[22px] rounded-sm bg-white/[0.05]" />
                );
            })}
            <div className="mx-0.5" />
            {trinket ? (
                <img src={trinket} alt="" className="w-[22px] h-[22px] rounded-sm opacity-50" />
            ) : (
                <div className="w-[22px] h-[22px] rounded-sm bg-white/[0.03] opacity-50" />
            )}
        </div>
    );
}

function ScoreboardRow({ p, maxDmg, teamColor }: { p: MatchParticipantPreview; maxDmg: number; teamColor: string }) {
    const kda =
        p.kills !== undefined ? `${p.kills}/${p.deaths}/${p.assists}` : null;
    const dmgPct = p.damage !== undefined && maxDmg > 0 ? Math.round((p.damage / maxDmg) * 100) : 0;

    return (
        <div
            className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
                p.is_tracked ? 'bg-cyan-500/[0.07] border-l-2 border-l-cyan-500/50' : ''
            }`}
        >
            {/* Champion */}
            {p.champion_icon_url ? (
                <img src={p.champion_icon_url} alt={p.champion_name} title={p.champion_name} className="w-6 h-6 rounded-sm flex-shrink-0" />
            ) : (
                <div className="w-6 h-6 rounded-sm bg-white/5 flex-shrink-0" />
            )}

            {/* Summoner name */}
            <span
                className={`w-28 truncate flex-shrink-0 ${p.is_tracked ? 'text-cyan-300 font-medium' : 'text-[#6a6a88]'}`}
            >
                {p.summoner_name ?? p.champion_name}
            </span>

            {/* KDA + kill participation */}
            <div className="w-28 flex-shrink-0 font-mono flex items-center gap-px">
                {kda ? (
                    <>
                        <span className="text-white">{p.kills}</span>
                        <span className="text-[#3a3a50]">/</span>
                        <span className="text-red-400">{p.deaths}</span>
                        <span className="text-[#3a3a50]">/</span>
                        <span className="text-white">{p.assists}</span>
                        {p.kill_participation !== undefined && (
                            <span className="text-[#4a4a60] ml-1 text-[10px] font-sans">
                                ({p.kill_participation}%)
                            </span>
                        )}
                    </>
                ) : (
                    <span className="text-[#4a4a60]">—</span>
                )}
            </div>

            {/* CS */}
            <span className="w-16 flex-shrink-0 text-[#6a6a88] hidden sm:block">
                {p.cs !== undefined ? `${p.cs}${p.cs_per_min != null ? ` (${p.cs_per_min})` : ''}` : '—'}
            </span>

            {/* Damage with proportional bar */}
            <div className="relative w-20 h-5 flex-shrink-0 hidden md:flex items-center overflow-hidden rounded-sm">
                <div
                    className={`absolute inset-y-0 left-0 rounded-sm opacity-20 ${teamColor === 'blue' ? 'bg-blue-400' : 'bg-red-400'}`}
                    style={{ width: `${dmgPct}%` }}
                />
                <span className="relative pl-1 text-[#6a6a88]">
                    {p.damage !== undefined ? fmt(p.damage) : '—'}
                </span>
            </div>

            {/* Wards placed / killed */}
            <span className="w-10 flex-shrink-0 text-[#4a4a60] hidden xl:block">
                {p.wards_placed !== undefined ? `${p.wards_placed}/${p.wards_killed}` : '—'}
            </span>

            {/* Items */}
            {p.items !== undefined && (
                <ItemSlots items={p.items} trinket={p.trinket_url} />
            )}
        </div>
    );
}

function ScoreboardTeam({
    participants,
    won,
    label,
    teamColor,
}: {
    participants: MatchParticipantPreview[];
    won: boolean | null;
    label: string;
    teamColor: 'blue' | 'red';
}) {
    const maxDmg = Math.max(...participants.map((p) => p.damage ?? 0), 1);
    const totalKills = participants.reduce((s, p) => s + (p.kills ?? 0), 0);
    const totalGold = participants.reduce((s, p) => s + (p.gold ?? 0), 0);

    return (
        <div>
            {/* Team header */}
            <div className="flex items-center justify-between px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${teamColor === 'blue' ? 'bg-blue-400' : 'bg-red-400'}`} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#4a4a60]">
                        {label} Team
                    </span>
                </div>
                {won !== null && (
                    <span className={`text-xs font-semibold ${won ? 'text-cyan-400' : 'text-red-400'}`}>
                        {won ? 'Victory' : 'Defeat'}
                    </span>
                )}
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-2 px-3 pb-1 text-[10px] text-[#3a3a50] border-b border-white/[0.04]">
                <div className="w-6 flex-shrink-0" />
                <div className="w-28 flex-shrink-0">Summoner</div>
                <div className="w-28 flex-shrink-0">KDA</div>
                <div className="w-16 flex-shrink-0 hidden sm:block">CS</div>
                <div className="w-20 flex-shrink-0 hidden md:block">Damage</div>
                <div className="w-10 flex-shrink-0 hidden xl:block">Wards</div>
                <div className="ml-auto">Items</div>
            </div>

            {participants.map((p, i) => (
                <ScoreboardRow key={i} p={p} maxDmg={maxDmg} teamColor={teamColor} />
            ))}

            {/* Team totals */}
            <div className="flex items-center gap-4 px-3 py-1.5 border-t border-white/[0.04] text-[10px] text-[#4a4a60]">
                <span>{totalKills} kills</span>
                <span>{(totalGold / 1000).toFixed(1)}k gold</span>
            </div>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MatchList({ matches }: Props) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const toggle = (id: number) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    if (matches.length === 0) {
        return <p className="text-center py-12 text-[#4a4a60]">No matches yet.</p>;
    }

    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">Recent Matches</h2>
            <div className="bg-[#0d0d18] border border-white/5 rounded-lg overflow-hidden">
                <motion.div variants={container} initial="hidden" animate="show">
                    {matches.map((match) => {
                        const isExpanded = expanded.has(match.id);
                        const blueTeam = match.participants.filter((p) => p.team_id === 100);
                        const redTeam = match.participants.filter((p) => p.team_id === 200);
                        const hasScoreboard = match.participants.some((p) => p.summoner_name !== undefined);

                        const csPerMin =
                            match.cs !== null && match.duration && match.duration > 0
                                ? (match.cs / (match.duration / 60)).toFixed(1)
                                : null;

                        const tracked = match.participants.find((p) => p.is_tracked);
                        const blueTeamWon =
                            tracked && match.is_win !== null
                                ? tracked.team_id === 100
                                    ? match.is_win
                                    : !match.is_win
                                : null;

                        return (
                            <motion.div key={match.id} variants={item} className="border-b border-white/5 last:border-0">
                                {/* ── Summary row (always visible, clickable) ── */}
                                <button
                                    onClick={() => hasScoreboard && toggle(match.id)}
                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                                        hasScoreboard ? 'hover:bg-white/[0.02]' : 'cursor-default'
                                    } ${
                                        match.is_win === true
                                            ? 'border-l-2 border-l-cyan-500/40'
                                            : match.is_win === false
                                              ? 'border-l-2 border-l-red-800/40'
                                              : ''
                                    }`}
                                >
                                    {match.champion_icon_url ? (
                                        <img
                                            src={match.champion_icon_url}
                                            alt={match.champion_name}
                                            className="w-10 h-10 rounded flex-shrink-0 mt-0.5"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-white/5 flex-shrink-0 mt-0.5" />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        {/* Top row */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-white">
                                                {match.champion_name}
                                            </span>

                                            <span
                                                className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                                                    match.is_win === null
                                                        ? 'bg-white/5 text-[#4a4a60]'
                                                        : match.is_win
                                                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                                          : 'bg-red-900/30 text-red-400 border border-red-800/40'
                                                }`}
                                            >
                                                {match.is_win === null ? '—' : match.is_win ? 'W' : 'L'}
                                            </span>

                                            <span className="text-xs font-mono text-[#4a4a60]">{match.kda}</span>

                                            {match.cs !== null && (
                                                <span className="text-xs text-[#4a4a60] hidden sm:inline">
                                                    {match.cs} CS{csPerMin ? ` (${csPerMin}/m)` : ''}
                                                </span>
                                            )}

                                            {match.duration !== null && (
                                                <span className="text-xs text-[#4a4a60] hidden sm:inline">
                                                    · {formatDuration(match.duration)}
                                                </span>
                                            )}

                                            {match.damage !== null && (
                                                <span className="text-xs text-[#4a4a60] hidden md:inline">
                                                    · {fmt(match.damage)} dmg
                                                </span>
                                            )}
                                        </div>

                                        {/* Bottom row */}
                                        <div className="flex items-center gap-2 mt-1">
                                            {match.tier && (
                                                <span className="text-xs text-[#4a4a60]">
                                                    {tierLabel(match.tier)} {match.rank}
                                                    {match.points !== null ? ` ${match.points}LP` : ''}
                                                </span>
                                            )}

                                            {/* Mini 5v5 */}
                                            {(blueTeam.length > 0 || redTeam.length > 0) && (
                                                <div className="hidden lg:flex items-center gap-px ml-1">
                                                    {blueTeam.map((p, i) =>
                                                        p.champion_icon_url ? (
                                                            <img
                                                                key={i}
                                                                src={p.champion_icon_url}
                                                                alt={p.champion_name}
                                                                title={p.champion_name}
                                                                className={`w-5 h-5 rounded-sm ${p.is_tracked ? 'ring-1 ring-cyan-400' : 'opacity-60'}`}
                                                            />
                                                        ) : (
                                                            <div key={i} className="w-5 h-5 rounded-sm bg-white/5 opacity-60" />
                                                        ),
                                                    )}
                                                    <div className="w-px h-3 bg-white/15 mx-1" />
                                                    {redTeam.map((p, i) =>
                                                        p.champion_icon_url ? (
                                                            <img
                                                                key={i}
                                                                src={p.champion_icon_url}
                                                                alt={p.champion_name}
                                                                title={p.champion_name}
                                                                className={`w-5 h-5 rounded-sm ${p.is_tracked ? 'ring-1 ring-cyan-400' : 'opacity-60'}`}
                                                            />
                                                        ) : (
                                                            <div key={i} className="w-5 h-5 rounded-sm bg-white/5 opacity-60" />
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                            {match.game_start_at && (
                                                <span className="text-xs text-[#4a4a60] ml-auto hidden sm:block">
                                                    {new Date(match.game_start_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expand chevron */}
                                    {hasScoreboard && (
                                        <span
                                            className={`text-[#4a4a60] text-xs flex-shrink-0 self-center ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        >
                                            ▾
                                        </span>
                                    )}
                                </button>

                                {/* ── Expanded scoreboard ── */}
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-[#07070f] border-t border-white/[0.04] py-2">
                                                <ScoreboardTeam
                                                    participants={blueTeam}
                                                    won={blueTeamWon}
                                                    label="Blue"
                                                    teamColor="blue"
                                                />
                                                <div className="mx-3 my-1.5 border-t border-white/[0.04]" />
                                                <ScoreboardTeam
                                                    participants={redTeam}
                                                    won={blueTeamWon === null ? null : !blueTeamWon}
                                                    label="Red"
                                                    teamColor="red"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

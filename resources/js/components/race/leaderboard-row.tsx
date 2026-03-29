import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { tierColor, tierLabel } from '@/lib/tier-utils';
import type { LeaderboardRow as RowType, MatchFeedRow } from '@/types/race';
import { MatchDrawer } from './match-drawer';

interface Props {
    row: RowType;
    position: number;
    streamerMatches: MatchFeedRow[];
    topLp: number;
    neckAndNeck: boolean;
}

export const rowVariant = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function LeaderboardRow({ row, position, streamerMatches, topLp, neckAndNeck }: Props) {
    const [expanded, setExpanded] = useState(false);
    const isTop = position === 1;
    const isHot = neckAndNeck && !isTop;
    const lpPct = topLp > 0 ? Math.min((row.total_lp / topLp) * 100, 100) : 0;

    return (
        <motion.div variants={rowVariant} className="overflow-hidden">
            <div
                className={`bg-[#0d0d18] border rounded-lg transition-colors ${
                    isHot
                        ? 'border-orange-500/30 hover:border-orange-500/50'
                        : isTop
                          ? 'border-cyan-500/30'
                          : 'border-white/5 hover:border-cyan-500/20'
                }`}
                style={
                    isTop
                        ? { boxShadow: '0 0 20px #00d4ff0a' }
                        : isHot
                          ? { boxShadow: '0 0 16px rgba(249,115,22,0.05)' }
                          : undefined
                }
            >
                {/* LP progress bar along top edge */}
                <div className="h-px w-full bg-white/[0.04] rounded-t-lg overflow-hidden">
                    <motion.div
                        className={`h-full ${isTop ? 'bg-cyan-500/60' : 'bg-white/20'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${lpPct}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                    />
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                    {/* Position */}
                    <span
                        className={`w-5 text-center text-sm font-mono font-bold flex-shrink-0 ${
                            isTop ? 'text-cyan-400' : isHot ? 'text-orange-400' : 'text-[#4a4a60]'
                        }`}
                    >
                        {position}
                    </span>

                    {/* Champion icon */}
                    {row.champion_icon_url ? (
                        <img
                            src={row.champion_icon_url}
                            alt=""
                            className="w-8 h-8 rounded flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0" />
                    )}

                    {/* Name & account */}
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/streamers/${row.streamer_id}`}
                            className="text-sm font-semibold text-white hover:text-cyan-300 transition-colors truncate block"
                        >
                            {row.name}
                        </Link>
                        <p className="text-xs text-[#4a4a60] truncate">{row.account_display_name}</p>
                    </div>

                    {/* Current rank — primary stat */}
                    <div className="flex-shrink-0 text-right hidden sm:block">
                        {row.tier ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${tierColor(row.tier)}`}>
                                {tierLabel(row.tier)} {row.rank}
                                {row.points !== null && ` · ${row.points} LP`}
                            </span>
                        ) : (
                            <span className="text-xs text-[#4a4a60]">Unranked</span>
                        )}
                    </div>

                    {/* W / L */}
                    <div className="text-right hidden md:block flex-shrink-0">
                        <p className="text-sm font-mono">
                            <span className="text-emerald-400">{row.wins}</span>
                            <span className="text-[#4a4a60]"> / </span>
                            <span className="text-red-400">{row.losses}</span>
                        </p>
                        <p className="text-xs text-[#4a4a60]">{row.win_rate}% WR</p>
                    </div>

                    {/* Expand toggle */}
                    {streamerMatches.length > 0 && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="text-[#4a4a60] hover:text-cyan-400 transition-colors ml-1 flex-shrink-0"
                            aria-label={expanded ? 'Collapse matches' : 'Expand matches'}
                        >
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}
                </div>

                <MatchDrawer matches={streamerMatches} open={expanded} />
            </div>
        </motion.div>
    );
}

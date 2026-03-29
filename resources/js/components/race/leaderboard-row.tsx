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
}

export const rowVariant = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function LeaderboardRow({ row, position, streamerMatches }: Props) {
    const [expanded, setExpanded] = useState(false);
    const isTop = position === 1;

    return (
        <motion.div variants={rowVariant} className="overflow-hidden">
            <div
                className={`bg-[#0d0d18] border rounded-lg transition-colors ${
                    isTop ? 'border-cyan-500/30' : 'border-white/5 hover:border-cyan-500/20'
                }`}
                style={isTop ? { boxShadow: '0 0 20px #00d4ff0a' } : undefined}
            >
                <div className="flex items-center gap-3 px-4 py-3">
                    {/* Position */}
                    <span
                        className={`w-5 text-center text-sm font-mono font-bold flex-shrink-0 ${
                            isTop ? 'text-cyan-400' : 'text-[#4a4a60]'
                        }`}
                    >
                        {position}
                    </span>

                    {/* Rank badge */}
                    <TierBadge tier={row.tier} rank={row.rank} points={row.points} />

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

                    {/* W / L */}
                    <div className="text-right hidden md:block flex-shrink-0">
                        <p className="text-sm font-mono">
                            <span className="text-cyan-300">{row.wins}</span>
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

function TierBadge({ tier, rank, points }: { tier: string | null; rank: string | null; points: number | null }) {
    if (!tier) {
        return (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/5 text-[#4a4a60] flex-shrink-0">
                Unranked
            </span>
        );
    }

    return (
        <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${tierColor(tier)}`}
        >
            {tierLabel(tier)} {rank}{points !== null ? ` ${points} LP` : ''}
        </motion.span>
    );
}

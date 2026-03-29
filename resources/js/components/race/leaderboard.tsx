import { motion } from 'framer-motion';
import type { LeaderboardRow as RowType, MatchFeedRow } from '@/types/race';
import { LeaderboardRow } from './leaderboard-row';

interface Props {
    leaderboard: RowType[];
    matches: MatchFeedRow[];
}

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.06 },
    },
};

export function Leaderboard({ leaderboard, matches }: Props) {
    if (leaderboard.length === 0) {
        return <p className="text-center py-16 text-[#4a4a60]">No participants yet.</p>;
    }

    const topLp = leaderboard[0].total_lp;

    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">Leaderboard</h2>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-0">
                {leaderboard.map((row, index) => {
                    const next = leaderboard[index + 1];
                    const gapBelow = next ? row.total_lp - next.total_lp : null;
                    const neckAndNeck = gapBelow !== null && gapBelow <= 50;

                    return (
                        <div key={row.streamer_id}>
                            <LeaderboardRow
                                row={row}
                                position={index + 1}
                                streamerMatches={matches.filter((m) => m.streamer_id === row.streamer_id)}
                                topLp={topLp}
                                neckAndNeck={neckAndNeck}
                            />
                            {gapBelow !== null && (
                                <GapIndicator gap={gapBelow} />
                            )}
                        </div>
                    );
                })}
            </motion.div>
        </section>
    );
}

function GapIndicator({ gap }: { gap: number }) {
    const isHot = gap <= 20;
    const isClose = gap <= 50;

    return (
        <div className="flex items-center gap-2 px-4 py-1">
            <div className={`flex-1 h-px ${isHot ? 'bg-orange-500/25' : isClose ? 'bg-amber-500/15' : 'bg-white/[0.04]'}`} />
            <span
                className={`text-[10px] font-mono flex-shrink-0 ${
                    isHot ? 'text-orange-400' : isClose ? 'text-amber-500/70' : 'text-[#4a4a60]'
                }`}
            >
                {isHot && '● '}+{gap.toLocaleString()} LP
            </span>
            <div className={`flex-1 h-px ${isHot ? 'bg-orange-500/25' : isClose ? 'bg-amber-500/15' : 'bg-white/[0.04]'}`} />
        </div>
    );
}

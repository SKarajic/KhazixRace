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

    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">Leaderboard</h2>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                {leaderboard.map((row, index) => (
                    <LeaderboardRow
                        key={row.streamer_id}
                        row={row}
                        position={index + 1}
                        streamerMatches={matches.filter((m) => m.streamer_id === row.streamer_id)}
                    />
                ))}
            </motion.div>
        </section>
    );
}

import { motion } from 'framer-motion';
import type { MatchFeedRow } from '@/types/race';

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

export function MatchFeed({ matches }: Props) {
    if (matches.length === 0) return null;

    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">Recent Matches</h2>
            <div className="bg-[#0d0d18] border border-white/5 rounded-lg overflow-hidden">
                <motion.div variants={container} initial="hidden" animate="show">
                    {matches.map((match) => (
                        <motion.div
                            key={match.id}
                            variants={item}
                            className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 ${
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
                                    className="w-8 h-8 rounded flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0" />
                            )}

                            <div className="flex-shrink-0 w-24 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{match.streamer_name}</p>
                                <p className="text-xs text-[#4a4a60] truncate">{match.champion_name}</p>
                            </div>

                            <span className="text-xs font-mono text-[#4a4a60] flex-1">{match.kda}</span>

                            {match.tier && (
                                <span className="text-xs text-[#4a4a60] hidden sm:block flex-shrink-0">
                                    {match.tier.charAt(0) + match.tier.slice(1).toLowerCase()} {match.rank}
                                    {match.points !== null && ` ${match.points}LP`}
                                </span>
                            )}

                            <span
                                className={`text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded ${
                                    match.is_win === null
                                        ? 'bg-white/5 text-[#4a4a60]'
                                        : match.is_win
                                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                          : 'bg-red-900/30 text-red-400 border border-red-800/40'
                                }`}
                            >
                                {match.is_win === null ? '—' : match.is_win ? 'W' : 'L'}
                            </span>

                            {match.game_start_at && (
                                <span className="text-xs text-[#4a4a60] flex-shrink-0 hidden md:block">
                                    {new Date(match.game_start_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

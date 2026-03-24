import { AnimatePresence, motion } from 'framer-motion';
import type { MatchFeedRow } from '@/types/race';

interface Props {
    matches: MatchFeedRow[];
    open: boolean;
}

export function MatchDrawer({ matches, open }: Props) {
    return (
        <AnimatePresence initial={false}>
            {open && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-white/5"
                >
                    <div className="py-1">
                        {matches.map((match) => (
                            <div
                                key={match.id}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
                            >
                                {match.champion_icon_url ? (
                                    <img
                                        src={match.champion_icon_url}
                                        alt={match.champion_name}
                                        className="w-7 h-7 rounded flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded bg-white/5 flex-shrink-0" />
                                )}

                                <span className="text-xs font-medium text-white flex-shrink-0 w-20 truncate">
                                    {match.champion_name}
                                </span>

                                <span className="text-xs font-mono text-[#4a4a60] flex-1">{match.kda}</span>

                                <span
                                    className={`text-xs font-bold flex-shrink-0 px-1.5 py-0.5 rounded ${
                                        match.is_win === null
                                            ? 'text-[#4a4a60]'
                                            : match.is_win
                                              ? 'bg-cyan-500/15 text-cyan-300'
                                              : 'bg-red-900/30 text-red-400'
                                    }`}
                                >
                                    {match.is_win === null ? '—' : match.is_win ? 'W' : 'L'}
                                </span>

                                {match.game_start_at && (
                                    <span className="text-xs text-[#4a4a60] flex-shrink-0">
                                        {new Date(match.game_start_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

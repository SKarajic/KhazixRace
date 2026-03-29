import { AnimatePresence, motion } from 'framer-motion';
import type { MatchFeedRow, MatchParticipantPreview } from '@/types/race';

interface Props {
    matches: MatchFeedRow[];
    open: boolean;
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
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
                        {matches.map((match) => {
                            const team1 = match.participants.filter((p) => p.team_id === 100);
                            const team2 = match.participants.filter((p) => p.team_id === 200);
                            const hasParticipants = team1.length > 0 || team2.length > 0;

                            return (
                                <div
                                    key={match.id}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.03] transition-colors"
                                >
                                    {/* Champion icon */}
                                    {match.champion_icon_url ? (
                                        <img
                                            src={match.champion_icon_url}
                                            alt={match.champion_name}
                                            className="w-8 h-8 rounded flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0" />
                                    )}

                                    {/* Champion + stats */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-semibold text-white truncate">
                                                {match.champion_name}
                                            </span>
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                                                    match.is_win === null
                                                        ? 'text-[#4a4a60]'
                                                        : match.is_win
                                                          ? 'bg-emerald-500/15 text-emerald-400'
                                                          : 'bg-red-900/25 text-red-400'
                                                }`}
                                            >
                                                {match.is_win === null ? '—' : match.is_win ? 'W' : 'L'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-[#4a4a60]">
                                            <span className="font-mono">{match.kda}</span>
                                            {match.cs !== null && (
                                                <>
                                                    <span className="text-[#2a2a40]">·</span>
                                                    <span>{match.cs} CS</span>
                                                </>
                                            )}
                                            {match.duration !== null && (
                                                <>
                                                    <span className="text-[#2a2a40]">·</span>
                                                    <span>{formatDuration(match.duration)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* 5v5 champion icons */}
                                    {hasParticipants && (
                                        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                                            <DrawerTeamIcons participants={team1} win={match.is_win === true} />
                                            <span className="text-[9px] text-[#2a2a40] font-mono">vs</span>
                                            <DrawerTeamIcons participants={team2} win={match.is_win === false} />
                                        </div>
                                    )}

                                    {/* Date */}
                                    {match.game_start_at && (
                                        <span className="text-xs text-[#4a4a60] flex-shrink-0 hidden md:block">
                                            {new Date(match.game_start_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function DrawerTeamIcons({ participants, win }: { participants: MatchParticipantPreview[]; win: boolean }) {
    return (
        <div className="flex items-center gap-px">
            {participants.map((p, i) =>
                p.champion_icon_url ? (
                    <img
                        key={i}
                        src={p.champion_icon_url}
                        alt={p.champion_name}
                        title={p.champion_name}
                        className={`w-4 h-4 rounded-sm flex-shrink-0 ${
                            p.is_tracked
                                ? win
                                    ? 'ring-1 ring-emerald-400 opacity-100'
                                    : 'ring-1 ring-red-400 opacity-100'
                                : 'opacity-50'
                        }`}
                    />
                ) : (
                    <div key={i} className="w-4 h-4 rounded-sm bg-white/5 flex-shrink-0" />
                ),
            )}
        </div>
    );
}

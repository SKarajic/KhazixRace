import { motion } from 'framer-motion';
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
    return `${m}:${String(s).padStart(2, '0')}`;
}

export function MatchFeed({ matches }: Props) {
    if (matches.length === 0) return null;

    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">Recent Matches</h2>
            <div className="bg-[#0d0d18] border border-white/5 rounded-lg overflow-hidden">
                <motion.div variants={container} initial="hidden" animate="show">
                    {matches.map((match) => (
                        <MatchRow key={match.id} match={match} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function MatchRow({ match }: { match: MatchFeedRow }) {
    const team1 = match.participants.filter((p) => p.team_id === 100);
    const team2 = match.participants.filter((p) => p.team_id === 200);
    const hasParticipants = team1.length > 0 || team2.length > 0;

    return (
        <motion.div
            variants={item}
            className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 ${
                match.is_win === true
                    ? 'border-l-2 border-l-emerald-500/50'
                    : match.is_win === false
                      ? 'border-l-2 border-l-red-700/50'
                      : ''
            }`}
        >
            {/* Champion icon */}
            {match.champion_icon_url ? (
                <img
                    src={match.champion_icon_url}
                    alt={match.champion_name}
                    className="w-10 h-10 rounded flex-shrink-0"
                />
            ) : (
                <div className="w-10 h-10 rounded bg-white/5 flex-shrink-0" />
            )}

            {/* Identity + stats */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white truncate">{match.streamer_name}</span>
                    <WinBadge win={match.is_win} />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4a4a60]">
                    <span>{match.champion_name}</span>
                    <span className="text-[#2a2a40]">·</span>
                    <span className="font-mono text-white/50">{match.kda}</span>
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
                    {match.tier && (
                        <>
                            <span className="text-[#2a2a40] hidden sm:inline">·</span>
                            <span className="hidden sm:inline">
                                {tierLabel(match.tier)} {match.rank}
                                {match.points !== null && ` ${match.points}LP`}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* 5v5 champion icons */}
            {hasParticipants && (
                <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                    <TeamIcons participants={team1} isWinTeam={match.is_win === true} />
                    <span className="text-[10px] text-[#2a2a40] font-mono">vs</span>
                    <TeamIcons participants={team2} isWinTeam={match.is_win === false} />
                </div>
            )}
        </motion.div>
    );
}

function TeamIcons({ participants, isWinTeam }: { participants: MatchParticipantPreview[]; isWinTeam: boolean }) {
    return (
        <div className="flex items-center gap-0.5">
            {participants.map((p, i) =>
                p.champion_icon_url ? (
                    <img
                        key={i}
                        src={p.champion_icon_url}
                        alt={p.champion_name}
                        title={p.champion_name}
                        className={`w-5 h-5 rounded-sm flex-shrink-0 ${
                            p.is_tracked
                                ? isWinTeam
                                    ? 'ring-1 ring-emerald-400 opacity-100'
                                    : 'ring-1 ring-red-400 opacity-100'
                                : 'opacity-60'
                        }`}
                    />
                ) : (
                    <div key={i} className="w-5 h-5 rounded-sm bg-white/5 flex-shrink-0" />
                ),
            )}
        </div>
    );
}

function WinBadge({ win }: { win: boolean | null }) {
    if (win === null) return null;
    return (
        <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                win
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-red-900/25 text-red-400 border border-red-800/30'
            }`}
        >
            {win ? 'W' : 'L'}
        </span>
    );
}

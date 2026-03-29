import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { LpHistoryChart } from '@/components/streamer/lp-history-chart';
import { MatchList } from '@/components/streamer/match-list';
import { StreamerStatCards } from '@/components/streamer/stat-cards';
import { StreamerHero } from '@/components/streamer/streamer-hero';
import { TwitchEmbed } from '@/components/twitch-embed';
import PublicLayout from '@/layouts/public-layout';
import type { LpPoint, MatchFeedRow } from '@/types/race';
import type { ChampionStat, StreamerProfile } from '@/types/streamer';

interface Props {
    streamer: StreamerProfile;
    recent_matches: MatchFeedRow[];
    lp_history: LpPoint[];
}

export default function Streamer({ streamer, recent_matches, lp_history }: Props) {
    const championIconUrl = recent_matches[0]?.champion_icon_url ?? null;

    return (
        <>
            <Head title={streamer.name} />
            <div>
                <StreamerHero streamer={streamer} championIconUrl={championIconUrl} />
                <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
                    {streamer.stats && <StreamerStatCards stats={streamer.stats} />}
                    {streamer.stream_url && <TwitchEmbed url={streamer.stream_url} />}
                    {streamer.champion_stats.length > 0 && (
                        <ChampionStats stats={streamer.champion_stats} />
                    )}
                    <LpHistoryChart history={lp_history} />
                    <MatchList matches={recent_matches} />
                </div>
            </div>
        </>
    );
}

(Streamer as { layout?: (page: ReactNode) => ReactNode }).layout = (page) => <PublicLayout>{page}</PublicLayout>;

function ChampionStats({ stats }: { stats: ChampionStat[] }) {
    return (
        <section>
            <p className="text-xs tracking-[0.4em] uppercase text-[#4a4a60] mb-4">Most Played (Last 50)</p>
            <div className="space-y-1">
                {stats.map((stat, i) => (
                    <ChampionRow key={stat.champion_name} stat={stat} index={i} />
                ))}
            </div>
        </section>
    );
}

function ChampionRow({ stat, index }: { stat: ChampionStat; index: number }) {
    const wrColor =
        stat.win_rate >= 60 ? 'text-cyan-400' : stat.win_rate >= 50 ? 'text-white' : 'text-red-400';
    const barColor =
        stat.win_rate >= 60 ? 'bg-cyan-500' : stat.win_rate >= 50 ? 'bg-white/40' : 'bg-red-500/60';

    return (
        <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors"
        >
            {/* Champion icon */}
            {stat.champion_icon_url ? (
                <img src={stat.champion_icon_url} alt={stat.champion_name} className="w-8 h-8 rounded flex-shrink-0" />
            ) : (
                <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0" />
            )}

            {/* Name */}
            <span className="text-sm font-semibold text-white w-28 flex-shrink-0 truncate">
                {stat.champion_name}
            </span>

            {/* Games */}
            <span className="text-xs text-[#4a4a60] flex-shrink-0 w-8">{stat.games}G</span>

            {/* W / L */}
            <div className="flex items-center gap-1 text-xs flex-shrink-0">
                <span className="text-emerald-400 font-medium">{stat.wins}W</span>
                <span className="text-[#2a2a40]">/</span>
                <span className="text-red-400 font-medium">{stat.losses}L</span>
            </div>

            {/* WR bar */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${stat.win_rate}%` }} />
                </div>
                <span className={`text-xs font-bold flex-shrink-0 w-9 text-right ${wrColor}`}>
                    {stat.win_rate}%
                </span>
            </div>

            {/* KDA */}
            <span className="text-xs text-[#4a4a60] flex-shrink-0 hidden sm:block w-16 text-right">
                {stat.avg_kda.toFixed(2)} KDA
            </span>
        </motion.div>
    );
}

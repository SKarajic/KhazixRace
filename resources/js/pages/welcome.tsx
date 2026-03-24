import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Leaderboard } from '@/components/race/leaderboard';
import { LpChart } from '@/components/race/lp-chart';
import { MatchFeed } from '@/components/race/match-feed';
import { RaceHeader } from '@/components/race/race-header';
import PublicLayout from '@/layouts/public-layout';
import type { RaceData } from '@/types/race';

interface Props {
    race: RaceData | null;
    upcoming: { name: string; starts_at: string } | null;
    last: RaceData | null;
}

export default function Welcome({ race, upcoming, last }: Props) {
    return (
        <PublicLayout>
            <Head title="Khazix Race" />
            {race ? (
                <RaceView race={race} />
            ) : upcoming ? (
                <UpcomingView upcoming={upcoming} />
            ) : last ? (
                <RaceView race={last} isLast />
            ) : (
                <EmptyView />
            )}
        </PublicLayout>
    );
}

function RaceView({ race, isLast = false }: { race: RaceData; isLast?: boolean }) {
    return (
        <div>
            <RaceHeader race={race} isLast={isLast} />
            <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
                <Leaderboard leaderboard={race.leaderboard} matches={race.matches} />
                <LpChart series={race.lp_series} />
                <MatchFeed matches={race.matches} />
            </div>
        </div>
    );
}

function UpcomingView({ upcoming }: { upcoming: { name: string; starts_at: string } }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full overflow-hidden"
            style={{ minHeight: 460 }}
        >
            <img
                src="/images/hero.png"
                alt="Kha'Zix"
                className="absolute inset-0 w-full h-full object-cover object-[length:center_40%]"
                draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/60 via-transparent to-[#05050a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/40 via-transparent to-[#05050a]/40" />

            <div className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-16" style={{ minHeight: 460 }}>
                <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-xs tracking-[0.5em] uppercase text-[#4a4a60] mb-3"
                >
                    Coming Soon
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-4xl md:text-5xl font-bold tracking-[0.25em] uppercase text-white mb-5 drop-shadow-lg"
                >
                    {upcoming.name}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-sm text-[#4a4a60]"
                >
                    Starts{' '}
                    {new Date(upcoming.starts_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </motion.p>
            </div>
        </motion.div>
    );
}

function EmptyView() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-28 text-[#4a4a60]"
        >
            No races yet.
        </motion.div>
    );
}

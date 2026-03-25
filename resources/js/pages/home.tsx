import { Head } from '@inertiajs/react';
import moment from 'moment-timezone';
import { motion } from 'framer-motion';
import { Leaderboard } from '@/components/race/leaderboard';
import { LpChart } from '@/components/race/lp-chart';
import { MatchFeed } from '@/components/race/match-feed';
import { RaceHeader } from '@/components/race/race-header';
import { useCountdown } from '@/hooks/use-countdown';
import PublicLayout from '@/layouts/public-layout';
import type { RaceData } from '@/types/race';

interface UpcomingStreamer {
    id: number;
    name: string;
    platform: string | null;
    stream_url: string | null;
    account_display_name: string | null;
}

interface UpcomingRace {
    name: string;
    starts_at: string;
    streamers: UpcomingStreamer[];
}

interface Props {
    race: RaceData | null;
    upcoming: UpcomingRace | null;
    last: RaceData | null;
}

export default function Home({ race, upcoming, last }: Props) {
    return (
        <PublicLayout>
            <Head title="" />
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

function UpcomingView({ upcoming }: { upcoming: UpcomingRace }) {
    const countdown = useCountdown(upcoming.starts_at);

    const date = new Date(upcoming.starts_at);
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const m = moment(date).tz(userTz);
    const localStartTime = `${m.format('dddd, MMMM D, HH:mm')} ${m.zoneAbbr()}`;

    return (
        <div>
            {/* Hero */}
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

                <div
                    className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-16"
                    style={{ minHeight: 460 }}
                >
                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="text-xs tracking-[0.5em] uppercase text-gray-200 text-shadow-lg text-shadow-gray-800 mb-3"
                    >
                        Coming Soon
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="text-4xl md:text-5xl font-bold tracking-[0.25em] uppercase text-white mb-8 drop-shadow-lg"
                    >
                        {upcoming.name}
                    </motion.h1>

                    {/* Countdown */}
                    {!countdown.expired && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.4 }}
                            className="flex items-end gap-3 mb-6"
                        >
                            {countdown.days > 0 && (
                                <CountdownUnit value={countdown.days} label="Days" />
                            )}
                            <CountdownUnit value={countdown.hours} label="Hrs" />
                            <CountdownUnit value={countdown.minutes} label="Min" />
                            <CountdownUnit value={countdown.seconds} label="Sec" />
                        </motion.div>
                    )}

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="text-sm text-gray-300 text-shadow-lg text-shadow-gray-800"
                    >
                        {localStartTime}
                    </motion.p>
                </div>
            </motion.div>

            {/* Streamers joining */}
            {upcoming.streamers.length > 0 && (
                <div className="mx-auto max-w-5xl px-4 py-10">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        className="text-xs tracking-[0.5em] uppercase text-gray-500 mb-6 text-center"
                    >
                        Participants
                    </motion.p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {upcoming.streamers.map((streamer, i) => (
                            <StreamerCard key={streamer.id} streamer={streamer} index={i} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="tabular-nums text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg w-16 text-center">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mt-1">{label}</span>
        </div>
    );
}

function StreamerCard({ streamer, index }: { streamer: UpcomingStreamer; index: number }) {
    const inner = (
        <div className="flex flex-col items-center gap-2 px-6 py-5 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm w-40 text-center hover:border-white/20 transition-colors h-full">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                {streamer.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="text-sm font-semibold text-white">{streamer.name}</p>
                {streamer.account_display_name && (
                    <p className="text-xs text-[#4a4a60] mt-0.5">{streamer.account_display_name}</p>
                )}
            </div>
            {streamer.platform && (
                <span className="text-[10px] tracking-widest uppercase text-cyan-500/70">
                    {streamer.platform}
                </span>
            )}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 + index * 0.08, duration: 0.35 }}
        >
            {streamer.stream_url ? (
                <a href={streamer.stream_url} target="_blank" rel="noopener noreferrer">
                    {inner}
                </a>
            ) : (
                inner
            )}
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

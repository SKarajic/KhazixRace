import { Deferred, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import moment from 'moment-timezone';
import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo } from 'react';
import { Leaderboard } from '@/components/race/leaderboard';
import { LpChart } from '@/components/race/lp-chart';
import { MatchFeed } from '@/components/race/match-feed';
import { RaceHeader } from '@/components/race/race-header';
import { StreamerSpotlight } from '@/components/race/streamer-spotlight';
import { TwitchEmbed } from '@/components/twitch-embed';
import { useStream } from '@/contexts/stream-context';
import { useCountdown } from '@/hooks/use-countdown';
import PublicLayout from '@/layouts/public-layout';
import { tierLabel } from '@/lib/tier-utils';
import type { LpSeries, MatchFeedRow, RaceData, StreamerSpotlightEntry } from '@/types/race';

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
    race_matches?: MatchFeedRow[];
    race_lp_series?: LpSeries[];
    race_spotlight?: StreamerSpotlightEntry[];
}

export default function Home({ race, upcoming, last, race_matches = [], race_lp_series = [], race_spotlight = [] }: Props) {
    return (
        <>
            <Head title="" />
            {race ? (
                <RaceView
                    race={race}
                    matches={race_matches}
                    lpSeries={race_lp_series}
                    spotlight={race_spotlight}
                />
            ) : upcoming ? (
                <UpcomingView upcoming={upcoming} />
            ) : last ? (
                <RaceView
                    race={last}
                    isLast
                    matches={race_matches}
                    lpSeries={race_lp_series}
                    spotlight={race_spotlight}
                />
            ) : (
                <EmptyView />
            )}
        </>
    );
}

// Persistent layout — keeps PublicLayout (and its stream context) mounted across navigations
(Home as { layout?: (page: ReactNode) => ReactNode }).layout = (page) => <PublicLayout>{page}</PublicLayout>;

interface RaceViewProps {
    race: RaceData;
    isLast?: boolean;
    matches: MatchFeedRow[];
    lpSeries: LpSeries[];
    spotlight: StreamerSpotlightEntry[];
}

function RaceView({ race, isLast = false, matches, lpSeries, spotlight }: RaceViewProps) {
    const { activeUrl, setActiveUrl } = useStream();

    // Streamers from leaderboard that have stream URLs (for tab bar)
    const streamers = useMemo(
        () => race.leaderboard.filter((r) => !!r.stream_url),
        [race.leaderboard],
    );

    // The embed URL: dedicated race stream takes priority, otherwise use selected stream
    const embedUrl = race.stream_url ?? activeUrl ?? null;

    // Derive which spotlight entry to show based on the active stream URL
    const activeSpotlightIdx = useMemo(() => {
        if (!activeUrl || spotlight.length === 0) return 0;
        const idx = spotlight.findIndex((s) => s.stream_url === activeUrl);
        return idx >= 0 ? idx : 0;
    }, [activeUrl, spotlight]);

    return (
        <div>
            <RaceHeader race={race} isLast={isLast} />
            <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 space-y-10">
                <SponsorBanner />

                <Leaderboard leaderboard={race.leaderboard} matches={matches} />

                {/* Merged stream + streamer stats section */}
                <section className="space-y-4">
                    {/* Tab bar — shown when there's no dedicated race stream and multiple streamers */}
                    {!race.stream_url && streamers.length > 1 && (
                        <div className="flex gap-1.5 flex-wrap">
                            {streamers.map((s) => (
                                <button
                                    key={s.streamer_id}
                                    onClick={() => s.stream_url && setActiveUrl(s.stream_url)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                                        activeUrl === s.stream_url
                                            ? 'bg-white/10 text-white border border-white/20'
                                            : 'text-[#4a4a60] border border-white/5 hover:text-white hover:border-white/15'
                                    }`}
                                >
                                    {s.name}
                                    {s.tier && (
                                        <span className={`ml-2 text-[10px] ${activeUrl === s.stream_url ? 'opacity-70' : 'opacity-40'}`}>
                                            {tierLabel(s.tier)}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Stream embed */}
                    {embedUrl && <TwitchEmbed url={embedUrl} />}

                    {/* Streamer stats — fades in once deferred data resolves */}
                    <Deferred data="race_spotlight" fallback={<SpotlightSkeleton />}>
                        {() => spotlight.length > 0 && (
                            <FadeIn>
                                <StreamerSpotlight
                                    streamers={spotlight}
                                    activeIdx={activeSpotlightIdx}
                                />
                            </FadeIn>
                        )}
                    </Deferred>
                </section>

                {/* {race_stats commented out} */}

                <Deferred data="race_lp_series" fallback={<ChartSkeleton />}>
                    {() => (
                        <FadeIn>
                            <LpChart series={lpSeries} />
                        </FadeIn>
                    )}
                </Deferred>

                <Deferred data="race_matches" fallback={<MatchFeedSkeleton />}>
                    {() => (
                        <FadeIn>
                            <MatchFeed matches={matches} />
                        </FadeIn>
                    )}
                </Deferred>
            </div>
        </div>
    );
}

function FadeIn({ children }: PropsWithChildren) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {children}
        </motion.div>
    );
}

function SpotlightSkeleton() {
    return (
        <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="h-56 bg-white/[0.02] animate-pulse" />
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div>
            <div className="h-3 w-20 rounded bg-white/[0.04] mb-4 animate-pulse" />
            <div className="h-48 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
        </div>
    );
}

function MatchFeedSkeleton() {
    return (
        <div>
            <div className="h-3 w-24 rounded bg-white/[0.04] mb-4 animate-pulse" />
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-lg bg-white/[0.03] border border-white/5 animate-pulse" />
                ))}
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
            <div className="relative w-full overflow-hidden" style={{ minHeight: 300 }}>
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
                    style={{ minHeight: 300 }}
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
            </div>

            <SponsorBanner />

            {/* Streamers joining */}
            {upcoming.streamers.length > 0 && (
                <div className="mx-auto max-w-5xl px-4 py-10">
                    <p className="text-xs tracking-[0.5em] uppercase text-gray-500 mb-6 text-center">
                        Participants
                    </p>
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

function SponsorBanner() {
    return (
        <div className="mx-auto max-w-5xl px-4 pb-4">
            {/* "Presented by" row with gradient lines */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-900/30 to-red-800/50" />
                <p className="text-xs tracking-[0.5em] uppercase text-[#4a4a60] flex-shrink-0">
                    Presented by
                </p>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-red-900/30 to-red-800/50" />
            </div>

            {/* Centered image with ornaments */}
            <div className="flex justify-center">
                <div className="relative">
                    {/* Red ambient glow */}
                    <div className="absolute inset-0 scale-110 rounded-lg bg-red-700/25 blur-2xl" />

                    {/* Corner brackets */}
                    <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-tl border-l-2 border-t-2 border-red-700/60" />
                    <div className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-tr border-r-2 border-t-2 border-red-700/60" />
                    <div className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-bl border-b-2 border-l-2 border-red-700/60" />
                    <div className="absolute -bottom-2.5 -right-2.5 h-5 w-5 rounded-br border-b-2 border-r-2 border-red-700/60" />

                    <a
                        href="https://thunderpick.io/?r=RACE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block overflow-hidden rounded opacity-85 transition-opacity hover:opacity-100"
                    >
                        <img
                            src="/images/thunderpick.png"
                            alt="Thunderpick — Code: Race"
                            className="w-80 object-cover"
                            draggable={false}
                        />
                    </a>
                </div>
            </div>

            {/* Bottom ornament */}
            <div className="mt-8 flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-red-900/30" />
                <div className="h-1 w-1 rounded-full bg-red-800/60" />
                <div className="h-1.5 w-1.5 rounded-full bg-red-700/50" />
                <div className="h-1 w-1 rounded-full bg-red-800/60" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-red-900/30" />
            </div>
        </div>
    );
}

function EmptyView() {
    return (
        <div>
            <div className="flex items-center justify-center py-28 text-[#4a4a60]">
                No races yet.
            </div>
            <SponsorBanner />
        </div>
    );
}

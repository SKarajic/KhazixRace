import { Head } from '@inertiajs/react';
import { LpHistoryChart } from '@/components/streamer/lp-history-chart';
import { MatchList } from '@/components/streamer/match-list';
import { StreamerHero } from '@/components/streamer/streamer-hero';
import PublicLayout from '@/layouts/public-layout';
import type { LpPoint, MatchFeedRow } from '@/types/race';
import type { StreamerProfile } from '@/types/streamer';

interface Props {
    streamer: StreamerProfile;
    recent_matches: MatchFeedRow[];
    lp_history: LpPoint[];
}

export default function Streamer({ streamer, recent_matches, lp_history }: Props) {
    const championIconUrl = recent_matches[0]?.champion_icon_url ?? null;

    return (
        <PublicLayout>
            <Head title={streamer.name} />
            <div>
                <StreamerHero streamer={streamer} championIconUrl={championIconUrl} />
                <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
                    <LpHistoryChart history={lp_history} />
                    <MatchList matches={recent_matches} />
                </div>
            </div>
        </PublicLayout>
    );
}

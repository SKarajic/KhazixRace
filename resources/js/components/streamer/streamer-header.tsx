import { motion } from 'framer-motion';
import { tierColor, tierLabel } from '@/lib/tier-utils';
import type { StreamerProfile } from '@/types/streamer';

interface Props {
    streamer: StreamerProfile;
}

export function StreamerHeader({ streamer }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="py-8"
        >
            <p className="text-xs tracking-[0.4em] uppercase text-[#4a4a60] mb-2">
                {streamer.platform ?? 'Streamer'}
            </p>

            <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-[0.1em] uppercase text-white">
                    {streamer.name}
                </h1>

                {streamer.tier ? (
                    <motion.span
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.2 }}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${tierColor(streamer.tier)}`}
                    >
                        {tierLabel(streamer.tier)} {streamer.rank}
                        {streamer.points !== null && ` — ${streamer.points} LP`}
                    </motion.span>
                ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/5 text-[#4a4a60]">
                        Unranked
                    </span>
                )}
            </div>

            <p className="mt-1 text-sm text-[#4a4a60]">{streamer.account_display_name}</p>

            {streamer.stream_url && (
                <a
                    href={streamer.stream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    Watch Stream →
                </a>
            )}
        </motion.div>
    );
}

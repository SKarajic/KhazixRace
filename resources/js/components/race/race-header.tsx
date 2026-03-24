import { motion } from 'framer-motion';
import type { RaceData } from '@/types/race';

interface Props {
    race: RaceData;
    isLast?: boolean;
}

export function RaceHeader({ race, isLast = false }: Props) {
    const isActive = !isLast && new Date(race.ends_at) > new Date();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full overflow-hidden"
            style={{ minHeight: 460 }}
        >
            {/* Hero image */}
            <img
                src="/images/hero.png"
                alt="Kha'Zix"
                className="absolute inset-0 w-full h-full object-cover object-[length:center_40%]"
                draggable={false}
            />

            {/* Gradient overlays — top fade + bottom fade into page background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/60 via-transparent to-[#05050a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/40 via-transparent to-[#05050a]/40" />

            {/* Content overlay — pt-16 clears the fixed nav */}
            <div className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-16" style={{ minHeight: 460 }}>
                <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-xs tracking-[0.5em] uppercase text-[#4a4a60] mb-3"
                >
                    {isLast ? 'Final Standings' : 'Live Race'}
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-4xl md:text-5xl font-bold tracking-[0.25em] uppercase text-white mb-5 drop-shadow-lg"
                >
                    {race.name}
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45, duration: 0.3 }}
                >
                    <StatusBadge active={isActive} />
                </motion.div>

                {!isLast && isActive && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55, duration: 0.4 }}
                        className="mt-3 text-sm text-[#4a4a60]"
                    >
                        Ends{' '}
                        {new Date(race.ends_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </motion.p>
                )}

                {race.stream_url && (
                    <motion.a
                        href={race.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="mt-5 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        Watch Stream →
                    </motion.a>
                )}
            </div>
        </motion.div>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs tracking-widest uppercase font-semibold backdrop-blur-sm ${
                active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-[#4a4a60] border border-white/15'
            }`}
        >
            {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
            {active ? 'Live' : 'Ended'}
        </span>
    );
}

import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useStream } from '@/contexts/stream-context';

const LS_DISMISSED = 'floating_stream_dismissed';
const LS_EXPANDED = 'floating_stream_expanded';

interface Stream {
    name: string;
    stream_url: string;
}

function extractChannel(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname === 'twitch.tv' || u.hostname === 'www.twitch.tv') {
            const ch = u.pathname.replace(/^\//, '').split('/')[0];
            return ch || null;
        }
    } catch {
        // ignore
    }
    return null;
}

interface Props {
    streams: Stream[];
}

export function FloatingPlayer({ streams }: Props) {
    const { activeUrl, setActiveUrl } = useStream();

    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(LS_DISMISSED) === '1'; } catch { return false; }
    });

    const [expanded, setExpanded] = useState(() => {
        try { return localStorage.getItem(LS_EXPANDED) !== '0'; } catch { return true; }
    });

    const dragControls = useDragControls();
    const constraintsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            if (dismissed) { localStorage.setItem(LS_DISMISSED, '1'); }
            else { localStorage.removeItem(LS_DISMISSED); }
        } catch { /* ignore */ }
    }, [dismissed]);

    useEffect(() => {
        try { localStorage.setItem(LS_EXPANDED, expanded ? '1' : '0'); } catch { /* ignore */ }
    }, [expanded]);

    if (streams.length === 0) return null;

    const show = !dismissed && !!activeUrl;
    const channel = activeUrl ? extractChannel(activeUrl) : null;
    const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    return (
        <>
            {/* Full-page drag constraint boundary */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

            <AnimatePresence>
                {show && (
                    <motion.div
                        drag
                        dragControls={dragControls}
                        dragConstraints={constraintsRef}
                        dragMomentum={false}
                        dragElastic={0}
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{ position: 'fixed', bottom: 20, right: 20 }}
                        className={`z-50 shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-[#0a0a14] transition-[width] duration-200 ${
                            expanded ? 'w-72 sm:w-[480px]' : 'w-72'
                        }`}
                    >
                        {/* Drag handle / header */}
                        <div
                            className="flex items-center gap-2 px-3 py-2 border-b border-white/5 cursor-grab active:cursor-grabbing select-none"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            {/* Drag grip dots */}
                            <div className="flex flex-col gap-[3px] flex-shrink-0 opacity-30">
                                <div className="flex gap-[3px]">
                                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                                </div>
                                <div className="flex gap-[3px]">
                                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                                </div>
                                <div className="flex gap-[3px]">
                                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                                </div>
                            </div>

                            {/* Streamer selector */}
                            {streams.length > 1 ? (
                                <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-none">
                                    {streams.map((s) => (
                                        <button
                                            key={s.stream_url}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onClick={() => setActiveUrl(s.stream_url)}
                                            className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition-colors ${
                                                activeUrl === s.stream_url
                                                    ? 'bg-cyan-500/20 text-cyan-300'
                                                    : 'text-[#4a4a60] hover:text-white'
                                            }`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                    <span className="text-[10px] tracking-widest uppercase text-[#4a4a60] truncate">
                                        {streams[0].name}
                                    </span>
                                </div>
                            )}

                            {/* Expand/collapse — desktop only */}
                            <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => setExpanded((v) => !v)}
                                aria-label={expanded ? 'Collapse player' : 'Expand player'}
                                className="hidden sm:flex flex-shrink-0 text-[#4a4a60] hover:text-white transition-colors w-6 h-6 items-center justify-center rounded hover:bg-white/5"
                            >
                                {expanded ? (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M2 8l4-4 4 4" />
                                    </svg>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M2 4l4 4 4-4" />
                                    </svg>
                                )}
                            </button>

                            {/* Close */}
                            <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => setDismissed(true)}
                                aria-label="Close floating player"
                                className="flex-shrink-0 text-[#4a4a60] hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-white/5"
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M1 1l8 8M9 1l-8 8" />
                                </svg>
                            </button>
                        </div>

                        {/* Embed */}
                        <div className="aspect-video">
                            {channel && (
                                <iframe
                                    key={channel}
                                    src={`https://player.twitch.tv/?channel=${channel}&parent=${parent}`}
                                    className="w-full h-full"
                                    loading="lazy"
                                    allowFullScreen
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Restore pill when dismissed */}
            <AnimatePresence>
                {dismissed && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setDismissed(false)}
                        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0a14] border border-white/10 text-[10px] tracking-widest uppercase text-[#4a4a60] hover:text-white hover:border-white/20 transition-colors shadow-xl"
                        aria-label="Restore stream"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Stream
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
}

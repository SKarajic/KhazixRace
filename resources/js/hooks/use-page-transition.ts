import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Returns `true` while Inertia is navigating away from the current page.
 * Use it to fade out content before the new page mounts.
 *
 * Ignores partial reloads (deferred prop fetches) which hit the same URL —
 * those must not fade the page out or the initial load goes black while
 * deferred data loads.
 */
export function usePageTransition() {
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            // Skip partial reloads (deferred prop fetches) — they target the
            // same URL and should never trigger a page-level fade-out.
            const visit = (event as CustomEvent).detail?.visit;
            const isPartial = visit?.only?.length > 0 || visit?.except?.length > 0;
            if (isPartial) return;

            // Also skip if the destination URL is the same page (e.g. query-string reloads)
            const destPath = visit?.url ? new URL(visit.url, window.location.href).pathname : null;
            if (destPath && destPath === window.location.pathname) return;

            setLeaving(true);
        });

        const removeFinish = router.on('finish', () => {
            setLeaving(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
        });

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    return leaving;
}

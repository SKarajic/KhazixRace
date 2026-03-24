import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Returns `true` while Inertia is navigating away from the current page.
 * Use it to fade out content before the new page mounts.
 */
export function usePageTransition() {
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setLeaving(true));
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

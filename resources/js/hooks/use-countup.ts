import { animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `target` on mount, returning the current animated value.
 */
export function useCountup(target: number, duration = 1.2): number {
    const [value, setValue] = useState(0);
    const prevRef = useRef(0);

    useEffect(() => {
        const controls = animate(prevRef.current, target, {
            duration,
            ease: 'easeOut',
            onUpdate: (v) => setValue(Math.round(v)),
        });
        prevRef.current = target;
        return () => controls.stop();
    }, [target, duration]);

    return value;
}

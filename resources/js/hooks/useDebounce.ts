import { useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

/**
 * Runs `callback` whenever `debouncedValue` changes, skipping the initial mount.
 * Pair with useDebounce to trigger side effects (router.get, etc.) on debounced input.
 */
export function useDebounceEffect(debouncedValue: unknown, callback: () => void): void {
    const isFirst = useRef(true);

    useEffect(() => {
        if (isFirst.current) { isFirst.current = false; return; }
        callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue]);
}

import { createContext, useContext } from 'react';

interface StreamContextValue {
    activeUrl: string | null;
    setActiveUrl: (url: string | null) => void;
}

export const StreamContext = createContext<StreamContextValue>({
    activeUrl: null,
    setActiveUrl: () => {},
});

export function useStream() {
    return useContext(StreamContext);
}

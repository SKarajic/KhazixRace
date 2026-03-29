import { useMemo } from 'react';

function extractTwitchChannel(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname === 'twitch.tv' || u.hostname === 'www.twitch.tv') {
            const channel = u.pathname.replace(/^\//, '').split('/')[0];
            return channel || null;
        }
    } catch {
        // invalid URL
    }
    return null;
}

interface Props {
    url: string;
}

export function TwitchEmbed({ url }: Props) {
    const channel = extractTwitchChannel(url);
    const parent = useMemo(
        () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost'),
        [],
    );

    if (!channel) return null;

    return (
        <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10">
            <iframe
                src={`https://player.twitch.tv/?channel=${channel}&parent=${parent}`}
                className="w-full h-full"
                allowFullScreen
            />
        </div>
    );
}

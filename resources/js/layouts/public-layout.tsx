import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { usePageTransition } from '@/hooks/use-page-transition';

const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Reddit', href: 'https://www.reddit.com/r/KhaZixMains/' },
    { label: 'Discord', href: 'https://discord.gg/VrKjMRPAbJ' },
    { label: 'Thunderpick', href: 'https://thunderpick.io/?r=RACE' },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const leaving = usePageTransition();

    return (
        <div className="min-h-screen bg-[#05050a] text-[#e8e8f0] font-sans">
            {/* Fixed nav — floats over the hero image */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#05050a]/60 backdrop-blur-md">
                <div className="mx-auto max-w-5xl flex items-center gap-8 px-6 py-4">
                    <Link href="/" className="flex-shrink-0">
                        <img src="/images/logo.png" alt="Khazix Race" className="h-8 w-auto" />
                    </Link>

                    <nav className="flex items-center gap-6">
                        {NAV_LINKS.map((link) => {
                            const active = link.href !== '#' && url === link.href;

                            return (link.href.startsWith('http://') || link.href.startsWith('https://')) ? (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className={`text-xs tracking-widest uppercase transition-colors ${
                                        active
                                            ? 'text-cyan-400'
                                            : 'text-[#4a4a60] hover:text-[#e8e8f0]'
                                    }`}
                                    target="_blank"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`text-xs tracking-widest uppercase transition-colors ${
                                        active
                                            ? 'text-cyan-400'
                                            : 'text-[#4a4a60] hover:text-[#e8e8f0]'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Page content — fades out when navigating away */}
            <main
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: leaving ? 0 : 1 }}
            >
                {children}
            </main>
        </div>
    );
}

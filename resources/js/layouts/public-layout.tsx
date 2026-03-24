import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { usePageTransition } from '@/hooks/use-page-transition';

const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Discord', href: '#' },
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const leaving = usePageTransition();

    return (
        <div className="min-h-screen bg-[#05050a] text-[#e8e8f0] font-sans">
            {/* Fixed nav — floats over the hero image */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#05050a]/60 backdrop-blur-md">
                <div className="mx-auto max-w-5xl flex items-center gap-8 px-6 py-4">
                    <Link
                        href="/"
                        className="text-sm font-semibold tracking-[0.3em] uppercase text-white hover:text-cyan-300 transition-colors flex-shrink-0"
                    >
                        Khazix<span className="text-cyan-400">Race</span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        {NAV_LINKS.map((link) => {
                            const active = link.href !== '#' && url === link.href;
                            return (
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

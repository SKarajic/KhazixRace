import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
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
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#05050a] text-[#e8e8f0] font-sans">
            {/* Fixed nav */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#05050a]/70 backdrop-blur-md">
                <div className="mx-auto max-w-5xl flex items-center px-6 py-4">
                    <Link href="/" className="flex-shrink-0 mr-auto" onClick={() => setMenuOpen(false)}>
                        <img src="/images/logo.png" alt="Khazix Race" className="h-8 w-auto" />
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden sm:flex items-center gap-6">
                        {NAV_LINKS.map((link) => {
                            const active = link.href !== '#' && url === link.href;
                            return link.href.startsWith('http') ? (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs tracking-widest uppercase text-[#4a4a60] hover:text-[#e8e8f0] transition-colors"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`text-xs tracking-widest uppercase transition-colors ${
                                        active ? 'text-cyan-400' : 'text-[#4a4a60] hover:text-[#e8e8f0]'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Hamburger button */}
                    <button
                        className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    >
                        <motion.span
                            className="block h-px w-5 bg-[#e8e8f0] origin-center"
                            animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                        <motion.span
                            className="block h-px w-5 bg-[#e8e8f0] origin-center"
                            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                            transition={{ duration: 0.15 }}
                        />
                        <motion.span
                            className="block h-px w-5 bg-[#e8e8f0] origin-center"
                            animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    </button>
                </div>

                {/* Mobile dropdown */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.nav
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="sm:hidden overflow-hidden border-t border-white/5"
                        >
                            <div className="flex flex-col px-6 py-3 gap-1">
                                {NAV_LINKS.map((link) => {
                                    const active = link.href !== '#' && url === link.href;
                                    return link.href.startsWith('http') ? (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setMenuOpen(false)}
                                            className="text-sm tracking-widest uppercase text-[#4a4a60] hover:text-[#e8e8f0] transition-colors py-2.5"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            key={link.label}
                                            href={link.href}
                                            onClick={() => setMenuOpen(false)}
                                            className={`text-sm tracking-widest uppercase transition-colors py-2.5 ${
                                                active ? 'text-cyan-400' : 'text-[#4a4a60] hover:text-[#e8e8f0]'
                                            }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </header>

            {/* Page content */}
            <main
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: leaving ? 0 : 1 }}
            >
                {children}
            </main>
        </div>
    );
}

const TIER_COLORS: Record<string, string> = {
    IRON: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
    BRONZE: 'bg-amber-700/15 text-amber-600 border border-amber-700/30',
    SILVER: 'bg-slate-400/15 text-slate-300 border border-slate-400/30',
    GOLD: 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/30',
    PLATINUM: 'bg-teal-400/15 text-teal-400 border border-teal-400/30',
    EMERALD: 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30',
    DIAMOND: 'bg-sky-400/15 text-sky-400 border border-sky-400/30',
    MASTER: 'bg-purple-400/15 text-purple-400 border border-purple-400/30',
    GRANDMASTER: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    CHALLENGER: 'bg-cyan-300/15 text-cyan-300 border border-cyan-300/30',
};

export function tierColor(tier: string | null): string {
    if (!tier) return 'bg-white/5 text-[#4a4a60] border border-white/10';
    return TIER_COLORS[tier.toUpperCase()] ?? 'bg-white/5 text-[#4a4a60] border border-white/10';
}

export function tierLabel(tier: string | null): string {
    if (!tier) return 'Unranked';
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
}

export const CHART_COLORS = ['#00d4ff', '#ff4466', '#a855f7', '#f59e0b', '#34d399'];

export const TIER_LP_LABELS: [number, string][] = [
    [2800, 'Master'],
    [2400, 'Diamond'],
    [2000, 'Emerald'],
    [1600, 'Platinum'],
    [1200, 'Gold'],
    [800, 'Silver'],
    [400, 'Bronze'],
    [0, 'Iron'],
];

export function lpLabel(lp: number): string {
    const tier = TIER_LP_LABELS.find(([base]) => lp >= base);
    return tier ? `${tier[1]} ${lp - tier[0]} LP` : `${lp} LP`;
}

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { lpLabel } from '@/lib/tier-utils';
import type { LpPoint } from '@/types/race';

interface Props {
    history: LpPoint[];
}

export function LpHistoryChart({ history }: Props) {
    if (history.length < 2) return null;

    const data = history.map((p) => ({ t: new Date(p.t).getTime(), lp: p.lp }));

    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">LP History</h2>
            <div className="bg-[#0d0d18] border border-white/5 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis
                            dataKey="t"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(ts: number) =>
                                new Date(ts).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })
                            }
                            stroke="#4a4a60"
                            tick={{ fontSize: 10, fill: '#4a4a60' }}
                        />
                        <YAxis
                            tickFormatter={lpLabel}
                            domain={[
                                (dataMin: number) => Math.max(0, dataMin - 150),
                                (dataMax: number) => dataMax + 150,
                            ]}
                            stroke="#4a4a60"
                            tick={{ fontSize: 10, fill: '#4a4a60' }}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#0d0d18',
                                border: '1px solid #00d4ff30',
                                borderRadius: 6,
                                fontSize: 12,
                            }}
                            labelFormatter={(label) => new Date(label as number).toLocaleString()}
                            formatter={(value) => [lpLabel(value as number), 'LP']}
                        />
                        <Line
                            type="monotone"
                            dataKey="lp"
                            stroke="#00d4ff"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

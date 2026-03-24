import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { CHART_COLORS, lpLabel } from '@/lib/tier-utils';
import type { LpSeries } from '@/types/race';

interface Props {
    series: LpSeries[];
}

type ChartPoint = Record<string, number>;

function buildChartData(series: LpSeries[]): ChartPoint[] {
    const timestampSet = new Set<number>();
    for (const s of series) {
        for (const p of s.data) {
            timestampSet.add(new Date(p.t).getTime());
        }
    }

    const timestamps = Array.from(timestampSet).sort((a, b) => a - b);
    const lastValues: Record<string, number> = {};

    return timestamps.map((ts) => {
        const point: ChartPoint = { t: ts };
        for (const s of series) {
            const match = s.data.find((p) => new Date(p.t).getTime() === ts);
            if (match) {
                point[s.name] = match.lp;
                lastValues[s.name] = match.lp;
            } else if (lastValues[s.name] !== undefined) {
                point[s.name] = lastValues[s.name];
            }
        }
        return point;
    });
}

export function LpChart({ series }: Props) {
    if (series.length === 0) return null;

    const data = buildChartData(series);

    return (
        <section>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#4a4a60] mb-4">LP Progression</h2>
            <div className="bg-[#0d0d18] border border-white/5 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis
                            dataKey="t"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(ts: number) =>
                                new Date(ts).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                            }
                            stroke="#4a4a60"
                            tick={{ fontSize: 10, fill: '#4a4a60' }}
                        />
                        <YAxis
                            tickFormatter={lpLabel}
                            domain={[
                                (dataMin: number) => Math.max(0, dataMin - 50),
                                (dataMax: number) => dataMax + 50,
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
                            formatter={(value) => [lpLabel(value as number), '']}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#4a4a60' }} />
                        {series.map((s, i) => (
                            <Line
                                key={s.name}
                                type="monotone"
                                dataKey={s.name}
                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

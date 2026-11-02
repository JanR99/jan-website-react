import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { shortDay, weeklyTicks } from "../../utils/stats";

/** Visits and page views per day; its own file, so Recharts is only loaded with the statistics. */
export default function VisitsChart({ days }: { days: StatsResponse["days"] }) {
    return (
        <div className="stats-chart">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="day"
                        ticks={weeklyTicks(days)}
                        tickFormatter={shortDay}
                        stroke="var(--color-text-muted)"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis allowDecimals={false} stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} />
                    <Tooltip
                        labelFormatter={(day) => shortDay(String(day))}
                        contentStyle={{
                            background: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 8,
                            color: "var(--color-text)",
                        }}
                    />
                    <Legend iconType="plainline" wrapperStyle={{ fontSize: 13 }} />
                    <Line
                        type="monotone"
                        dataKey="visits"
                        name="Besuche"
                        stroke="var(--color-accent)"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="pageViews"
                        name="Seitenaufrufe"
                        stroke="var(--color-text-muted)"
                        strokeWidth={2}
                        strokeDasharray="4 3"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

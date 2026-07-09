import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useAnalytics } from "../hooks";

const COLORS = ["#00d4ff", "#a78bfa", "#fb923c", "#4ade80", "#f472b6", "#facc15"];

function fmtDate(d: string) {
  try {
    const [, m, day] = d.split("-");
    return `${parseInt(m)}/${parseInt(day)}`;
  } catch {
    return d;
  }
}

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(14,9,40,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#f0f0ff",
};

export function AnalyticsChart() {
  const { data: analytics, isLoading } = useAnalytics();

  const daily = (analytics?.dailyHours ?? []).slice(-14).map((d) => ({
    ...d,
    label: fmtDate(d.date),
  }));

  const subjects = analytics?.subjectBreakdown ?? [];

  return (
    <section className="glass-panel p-6 sm:p-8 space-y-8">
      {/* Daily hours line chart */}
      <div>
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          📈 Daily Study Hours
        </h2>
        {isLoading ? (
          <div className="h-52 rounded-xl bg-white/5 animate-pulse" />
        ) : daily.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data yet — start logging!
          </div>
        ) : (
          <div className="h-52 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 5, right: 8, left: -24, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: "#00d4ff", fontWeight: 700 }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  name="Hours"
                  stroke="#00d4ff"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0f0a2e", stroke: "#00d4ff", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#fff", stroke: "#00d4ff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Subject breakdown bar chart */}
      {!isLoading && subjects.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            📚 Hours by Subject
          </h2>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects} margin={{ top: 5, right: 8, left: -24, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="subject"
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: "#a78bfa", fontWeight: 700 }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
                />
                <Bar dataKey="totalHours" name="Total Hours" radius={[6, 6, 0, 0]}>
                  {subjects.map((_e, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}

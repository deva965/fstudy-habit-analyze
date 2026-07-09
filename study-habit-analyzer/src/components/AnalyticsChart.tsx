import { format, parseISO } from "date-fns";
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
  Legend,
} from "recharts";
import { useAnalytics } from "../hooks";

const COLORS = [
  "#00d4ff", "#a78bfa", "#fb923c",
  "#4ade80", "#f472b6", "#facc15",
];

export function AnalyticsChart() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <section className="glass p-6 sm:p-8">
        <h2 className="section-title">📈 Weekly Analytics</h2>
        <div className="h-60 rounded-xl bg-white/5 animate-pulse" />
      </section>
    );
  }

  const daily = (analytics?.dailyHours ?? []).slice(-14);
  const subjects = analytics?.subjectBreakdown ?? [];

  const chartData = daily.map((d) => ({
    date: d.date,
    label: (() => {
      try { return format(parseISO(d.date), "MMM d"); } catch { return d.date; }
    })(),
    hours: d.hours,
  }));

  const tooltipStyle = {
    backgroundColor: "rgba(14, 9, 40, 0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#f0f0ff",
  };

  return (
    <section className="glass p-6 sm:p-8 space-y-8">
      <div>
        <h2 className="section-title">📈 Daily Study Hours (Last 14 Days)</h2>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm">
            No data yet — start logging your sessions!
          </div>
        ) : (
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
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
                  contentStyle={tooltipStyle}
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

      {subjects.length > 0 && (
        <div>
          <h2 className="section-title">📚 Hours by Subject</h2>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjects}
                margin={{ top: 5, right: 8, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
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
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#a78bfa", fontWeight: 700 }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
                />
                <Legend
                  wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}
                />
                <Bar dataKey="totalHours" name="Total Hours" radius={[6, 6, 0, 0]}>
                  {subjects.map((_entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.85}
                    />
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

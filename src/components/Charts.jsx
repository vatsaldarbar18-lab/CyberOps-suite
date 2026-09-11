import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "rgba(24, 24, 27, 0.98)",
  border: "1px solid rgba(82, 82, 91, 0.9)",
  borderRadius: 8,
  color: "#f4f4f5",
};

export function TrafficChart({ data, height = 280 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="inbound" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="outbound" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(113, 113, 122, 0.18)" vertical={false} />
          <XAxis dataKey="time" stroke="#71717a" tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="inbound" stroke="#60a5fa" fill="url(#inbound)" strokeWidth={2} />
          <Area type="monotone" dataKey="outbound" stroke="#a1a1aa" fill="url(#outbound)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendChart({ data }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(113, 113, 122, 0.18)" vertical={false} />
          <XAxis dataKey="month" stroke="#71717a" tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="high" stroke="#fb923c" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskPie({ data }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={62} outerRadius={96} dataKey="value" paddingAngle={4}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DeviceBar({ data }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(113, 113, 122, 0.18)" vertical={false} />
          <XAxis dataKey="status" stroke="#71717a" tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" fill="#60a5fa" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

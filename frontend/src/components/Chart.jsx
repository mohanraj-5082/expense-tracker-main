import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getMonthName } from "../utils/currencyFormatter";

const PIE_COLORS = [
  "#6c8ef5", "#00d68f", "#ff5e5e", "#a78bfa",
  "#f5c518", "#38bdf8", "#fb923c", "#f472b6",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1e2235",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
      }}>
        <p style={{ color: "#8b95b5", marginBottom: 6 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: ₹{p.value?.toLocaleString("en-IN")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * IncomeExpenseChart — Area chart showing monthly income vs expense
 */
export const IncomeExpenseChart = ({ data }) => {
  // Transform aggregated monthly data from API
  const chartData = buildMonthlyData(data);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d68f" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00d68f" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff5e5e" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#ff5e5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#8b95b5", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#8b95b5", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#00d68f"
          strokeWidth={2.5}
          fill="url(#incomeGrad)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="#ff5e5e"
          strokeWidth={2.5}
          fill="url(#expenseGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/**
 * CategoryPieChart — Donut chart for category breakdown
 */
export const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <p>No category data available</p>
      </div>
    );
  }

  const pieData = data.map((d) => ({ name: d._id, value: d.total }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {pieData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => `₹${v.toLocaleString("en-IN")}`}
          contentStyle={{
            background: "#1e2235",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            fontSize: 13,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "#8b95b5" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Helper: build monthly data array from API aggregation result
function buildMonthlyData(rawData) {
  if (!rawData || rawData.length === 0) return [];

  const map = {};
  rawData.forEach(({ _id, total }) => {
    const key = `${_id.year}-${_id.month}`;
    if (!map[key]) map[key] = { month: getMonthName(_id.month), income: 0, expense: 0 };
    map[key][_id.type] = total;
  });

  return Object.values(map);
}

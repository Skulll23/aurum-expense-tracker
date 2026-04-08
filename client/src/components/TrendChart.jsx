import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{label}</p>
      <p className="custom-tooltip-value">
        ${Number(payload[0].value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

export default function TrendChart({ data, loading }) {
  if (loading) {
    return (
      <div
        className="skeleton"
        style={{ height: 200, borderRadius: 'var(--r-md)' }}
      />
    );
  }

  if (!data || data.length === 0) {
    return <div className="chart-empty">No data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(255,255,255,0.18)" stopOpacity={1} />
            <stop offset="95%" stopColor="rgba(255,255,255,0)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
          tickFormatter={(v) => '$' + v.toLocaleString()}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
          fill="url(#goldGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#FFFFFF', stroke: '#000000', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

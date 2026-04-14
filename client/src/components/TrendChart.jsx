// ============================================================
// client/src/components/TrendChart.jsx — MONTHLY AREA CHART
//
// Shows how much was spent each month as a smooth line chart
// with a semi-transparent gradient fill underneath (area chart).
//
// Uses the Recharts library — a React charting library built on SVG.
//
// DATA FORMAT expected:
//   [{ name: 'Jan', amount: 150 }, { name: 'Feb', amount: 320 }, ...]
//   This comes from Dashboard.jsx after transforming the API response.
//
// KEY RECHARTS CONCEPTS:
//   ResponsiveContainer — makes the SVG resize with its parent div
//   AreaChart           — the chart type (line + filled area below)
//   Area                — the actual data line and fill
//   XAxis / YAxis       — the horizontal and vertical axes
//   CartesianGrid       — faint background grid lines
//   Tooltip             — popup that appears when you hover a data point
//   linearGradient      — SVG gradient for the white-to-transparent fill
// ============================================================

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Custom tooltip component — replaces Recharts' default tooltip
// active = true when the user is hovering over a data point
// payload = the data for the hovered point
// label = the X-axis label (month name)
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

  // Show skeleton shimmer while data is loading
  if (loading) {
    return (
      <div
        className="skeleton"
        style={{ height: 200, borderRadius: 'var(--r-md)' }}
      />
    );
  }

  // Show a placeholder message if there's no data yet
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data yet</div>;
  }

  return (
    // ResponsiveContainer makes the chart fill 100% of its parent's width
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>

        {/* SVG gradient — white at top fading to transparent at bottom
            This creates the soft glow fill under the line */}
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(255,255,255,0.18)" stopOpacity={1} />
            <stop offset="95%" stopColor="rgba(255,255,255,0)" stopOpacity={1} />
          </linearGradient>
        </defs>

        {/* Faint horizontal grid lines — very subtle for the dark theme
            strokeDasharray="3 3" makes dashed lines, vertical={false} hides vertical lines */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />

        {/* X-axis — shows month names (Jan, Feb, etc.)
            axisLine={false} hides the axis line, tickLine={false} hides tick marks */}
        <XAxis
          dataKey="name"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />

        {/* Y-axis — shows dollar amounts ($0, $90, $180, etc.)
            tickFormatter converts raw numbers to "$300" format
            width={64} gives enough room for the dollar labels */}
        <YAxis
          stroke="rgba(255,255,255,0.2)"
          tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
          tickFormatter={(v) => '$' + v.toLocaleString()}
          axisLine={false}
          tickLine={false}
          width={64}
        />

        {/* Use our custom tooltip component on hover */}
        <Tooltip content={<CustomTooltip />} />

        {/* The actual data line and fill area
            type="monotone" = smooth curve between points
            dataKey="amount" = use the amount property for Y values
            fill="url(#goldGrad)" = reference the gradient defined above
            dot={false} = no dots on each data point (cleaner look)
            activeDot = white dot that appears when hovering */}
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

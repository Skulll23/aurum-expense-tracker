// ============================================================
// client/src/components/CategoryChart.jsx — DONUT CHART
//
// Shows total spending broken down by category as a donut chart.
// A donut chart is a pie chart with a hole in the middle.
// The total amount is displayed in the centre of the hole.
//
// Uses the Recharts library.
//
// DATA FORMAT expected (comes directly from MongoDB aggregation):
//   [{ _id: 'Food & Dining', total: 93.95, count: 2 }, ...]
//
// THE CENTER LABEL BUG WE FIXED:
//   Putting label={<CenterLabel />} directly on <Pie> made Recharts
//   render one label PER SLICE (8 labels!) with wrong viewBox coordinates.
//   Fix: use <Label content={<CenterLabel />} position="center" /> as a
//   CHILD inside <Pie> — this renders exactly one label in the centre.
// ============================================================

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { CATEGORY_COLORS, DEFAULT_COLOR } from '../constants.js';

// Custom tooltip shown when hovering a slice
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{entry.name}</p>
      <p className="custom-tooltip-value">
        ${Number(entry.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

// CenterLabel — renders the total amount in the donut hole
// viewBox is provided by Recharts and contains cx/cy (centre coordinates)
// total is passed via the content prop: <Label content={<CenterLabel total={x} />} />
function CenterLabel({ viewBox, total }) {
  const { cx, cy } = viewBox; // centre coordinates of the donut
  return (
    <g>
      {/* Total amount — e.g. "$955" */}
      <text
        x={cx}
        y={cy - 6}            {/* slightly above centre */}
        textAnchor="middle"
        dominantBaseline="middle"
        className="donut-center-text"
        fill="#F2EDE4"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="18"
        fontWeight="600"
      >
        ${Number(total).toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </text>
      {/* "total" label below the number */}
      <text
        x={cx}
        y={cy + 14}           {/* below centre */}
        textAnchor="middle"
        dominantBaseline="middle"
        className="donut-center-sub"
        fill="#60607A"
        fontFamily="'Inter', sans-serif"
        fontSize="11"
      >
        total
      </text>
    </g>
  );
}

export default function CategoryChart({ data, loading }) {

  // Show skeleton shimmer while loading
  if (loading) {
    return (
      <div
        className="skeleton"
        style={{ height: 220, borderRadius: 'var(--r-md)' }}
      />
    );
  }

  // Show placeholder if no data
  if (!data || data.length === 0) {
    return (
      <>
        <div className="chart-empty">No data yet</div>
      </>
    );
  }

  // Calculate total across all categories (shown in donut centre)
  const total = data.reduce((sum, item) => sum + item.total, 0);

  // Transform MongoDB aggregation format to Recharts format
  // MongoDB: { _id: 'Food & Dining', total: 93.95 }
  // Recharts: { name: 'Food & Dining', value: 93.95 }
  const chartData = data.map((item) => ({
    name: item._id,    // category name becomes the slice label
    value: item.total, // total amount becomes the slice size
    count: item.count,
  }));

  return (
    <>
      {/* ResponsiveContainer makes the chart fit its parent div */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"           {/* centre horizontally */}
            cy="50%"           {/* centre vertically */}
            innerRadius={60}   {/* creates the donut hole — remove this for a full pie */}
            outerRadius={90}   {/* outer edge of the donut ring */}
            paddingAngle={3}   {/* small gap between slices */}
            dataKey="value"    {/* use 'value' property to determine slice size */}
            labelLine={false}  {/* no lines pointing to labels */}
          >
            {/* CenterLabel is rendered once in the donut hole */}
            {/* This must be a CHILD of <Pie>, not a prop — see comment at top */}
            <Label content={<CenterLabel total={total} />} position="center" />

            {/* Each Cell gives a slice its colour from CATEGORY_COLORS */}
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR}
                stroke="transparent"  {/* no border between slices */}
              />
            ))}
          </Pie>

          {/* Custom tooltip on slice hover */}
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Colour legend below the chart — shows each category and its total */}
      <div className="category-legend">
        {chartData.map((entry) => (
          <div className="legend-item" key={entry.name}>
            {/* Coloured dot matching the slice colour */}
            <div
              className="legend-dot"
              style={{ backgroundColor: CATEGORY_COLORS[entry.name] || DEFAULT_COLOR }}
            />
            <span className="legend-label">
              {entry.name} &mdash; ${Number(entry.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

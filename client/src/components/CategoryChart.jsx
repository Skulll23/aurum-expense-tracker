import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { CATEGORY_COLORS, DEFAULT_COLOR } from '../constants.js';

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

function CenterLabel({ viewBox, total }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text
        x={cx}
        y={cy - 6}
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
      <text
        x={cx}
        y={cy + 14}
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
  if (loading) {
    return (
      <div
        className="skeleton"
        style={{ height: 220, borderRadius: 'var(--r-md)' }}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <>
        <div className="chart-empty">No data yet</div>
      </>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);

  const chartData = data.map((item) => ({
    name: item._id,
    value: item.total,
    count: item.count,
  }));

  return (
    <>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
          >
            <Label content={<CenterLabel total={total} />} position="center" />
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="category-legend">
        {chartData.map((entry) => (
          <div className="legend-item" key={entry.name}>
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

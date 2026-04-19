// src/components/ChartTooltip.tsx
type TooltipPayloadEntry = {
  name: string;
  value: number;
  color: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  /** Optional — override how the label string is displayed */
  labelFormatter?: (label: string | number) => string;
  /** Optional — override how each row value is displayed */
  valueFormatter?: (value: number, name: string) => string;
};

/**
 * Drop-in recharts custom tooltip with glass-panel styling.
 *
 * Usage in a chart:
 *   <Tooltip
 *     content={
 *       <ChartTooltip
 *         labelFormatter={(d) => `Day ${d}`}
 *         valueFormatter={(v) => `${Number(v).toFixed(1)} hrs`}
 *       />
 *     }
 *   />
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter
    ? labelFormatter(label ?? '')
    : String(label ?? '');

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-h)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: 'var(--glow-teal)',
        opacity: 0.97,
      }}
    >
      <p
        style={{
          color: 'var(--ink-dim)',
          fontSize: 11,
          marginBottom: payload.length > 1 ? 6 : 2,
        }}
      >
        {displayLabel}
      </p>
      {payload.map((row, i) => (
        <div
          key={i}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: row.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: 'var(--ink-dim)' }}>{row.name}:</span>
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
            {valueFormatter ? valueFormatter(row.value, row.name) : String(row.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// src/components/StoryCallout.tsx
type StoryCalloutProps = {
  icon?: string;
  text: string;
  warning?: boolean;
  label?: string;
};

/**
 * Glass insight panel rendered below a chart.
 * Set warning=true for polar-anomaly / extreme-fasting cases (orange tint).
 */
export default function StoryCallout({ icon = '✦', text, warning = false, label = 'Insight' }: StoryCalloutProps) {
  const borderColor = warning ? 'rgba(249,115,22,0.3)' : 'rgba(74,222,204,0.2)';
  const bgColor     = warning ? 'rgba(249,115,22,0.06)' : 'rgba(74,222,204,0.05)';
  const labelColor  = warning ? 'var(--chart-3)' : 'var(--accent)';

  return (
    <div
      style={{
        marginTop: 12,
        padding: '12px 16px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: labelColor,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        {icon} {label}
      </div>
      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.65, color: 'var(--ink)' }}>
        {text}
      </p>
    </div>
  );
}

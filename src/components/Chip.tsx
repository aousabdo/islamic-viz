// src/components/Chip.tsx
import type { ReactNode } from 'react';

export default function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-xs uppercase tracking-[0.08em] font-semibold px-2 py-1 rounded-lg"
      style={{
        background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
        color: 'var(--accent)',
        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
      }}
    >
      {children}
    </span>
  );
}

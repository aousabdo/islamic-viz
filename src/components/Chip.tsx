import type { ReactNode } from 'react';
export default function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block text-xs uppercase tracking-[0.08em] font-semibold px-2 py-1 rounded-lg bg-[rgba(15,118,110,0.08)] text-accent">
      {children}
    </span>
  );
}

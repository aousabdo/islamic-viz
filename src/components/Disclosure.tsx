import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Disclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-rule mt-8 pt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-ink-dim hover:text-accent"
        aria-expanded={open}
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {summary}
      </button>
      {open && <div className="mt-4 prose prose-sm text-ink-dim max-w-none">{children}</div>}
    </div>
  );
}

// src/components/Layout/Footer.tsx
import Credit from './Credit';

export default function Footer() {
  return (
    <footer className="mt-16" style={{ borderTop: '1px solid var(--rule)' }}>
      <div
        className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between text-xs"
        style={{ color: 'var(--ink-dim)' }}
      >
        <span className="flex items-center gap-2">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <Credit tier={2} />
        </span>
        <span>© 2026</span>
      </div>
    </footer>
  );
}

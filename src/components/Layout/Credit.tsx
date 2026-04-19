// Minimal portfolio byline. Swap for the shared <Credit /> component from
// AWS_product_planning/templates/Credit.tsx once it's published (see PLAYBOOK §7).
export default function Credit({ tier = 2 }: { tier?: 1 | 2 | 3 }) {
  const size = tier === 1 ? 'text-sm' : 'text-xs';
  return (
    <span className={`${size} text-ink-dim`}>
      Built by <a href="https://analyticadss.com" className="text-accent">Analytica DSS</a>
    </span>
  );
}

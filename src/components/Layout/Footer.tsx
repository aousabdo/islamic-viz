import Container from './Container';
import Credit from './Credit';

export default function Footer() {
  return (
    <footer className="border-t border-rule mt-16 py-8 text-ink-dim">
      <Container className="flex items-center justify-between text-sm">
        <Credit tier={2} />
        <span>© 2026</span>
      </Container>
    </footer>
  );
}

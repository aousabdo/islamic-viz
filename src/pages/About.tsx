import { useLang } from '../i18n/useLang';
import Container from '../components/Layout/Container';
import aboutEn from '../i18n/about.en.json';
import aboutAr from '../i18n/about.ar.json';

export default function About() {
  const { lang } = useLang();
  const dict = lang === 'ar' ? aboutAr : aboutEn;
  return (
    <Container>
      <h1 className="text-5xl mb-6">{dict.title}</h1>
      <div className="prose prose-lg max-w-none">
        {dict.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Container>
  );
}

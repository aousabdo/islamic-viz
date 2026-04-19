import { Navigate } from 'react-router-dom';

function detectLang(): 'en' | 'ar' {
  try {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'ar') return stored;
  } catch { /* ignore */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language : '';
  return nav.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export default function LangRedirect() {
  return <Navigate to={`/${detectLang()}/`} replace />;
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LangRoot from './pages/LangRoot';
import LangRedirect from './pages/LangRedirect';
import Home from './pages/Home';
import About from './pages/About';
import NotFound from './pages/NotFound';
import VizPage from './pages/VizPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LangRedirect />} />
        <Route path=":lang" element={<LangRoot />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="v/:slug" element={<VizPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

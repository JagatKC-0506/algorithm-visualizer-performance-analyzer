import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import SortingPage from './pages/SortingPage';
import GraphPage from './pages/GraphPage';
import QuizPage from './pages/QuizPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sorting" element={<SortingPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

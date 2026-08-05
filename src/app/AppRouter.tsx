import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <header>
        <h1>
          <Link to="/">Prueba técnica</Link>
        </h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

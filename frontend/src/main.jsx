import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MangaPage from './pages/MangaPage';
import ReaderPage from './pages/ReaderPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/manga/:id" element={<MangaPage />} />
      <Route path="/manga/:id/read/:chapterIndex" element={<ReaderPage />} />
    </Routes>
  </BrowserRouter>,
);

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';

// Адрес нашего backend API
const API_URL = 'http://localhost:4000';

// Главная страница со списком манги (берём /api/manga)
function HomePage() {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadManga() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/manga`);
        if (!res.ok) {
          throw new Error('Ошибка при загрузке списка манги');
        }

        const data = await res.json();
        setMangaList(data);
      } catch (err) {
        setError(err.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    }

    loadManga();
  }, []);

  if (loading) {
    return <p>Загрузка списка манги...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  return (
    <>
      <h1 className="page-title">Популярная манга</h1>

      <div className="manga-grid">
        {mangaList.map((manga) => (
          <article key={manga.id} className="manga-card">
            <div className="manga-cover-placeholder">Обложка</div>

            <h2 className="manga-title">{manga.title}</h2>
            <p className="manga-meta">
              {manga.totalChapters} глав • {manga.status}
            </p>
            <p className="manga-description">{manga.description}</p>

            <Link to={`/manga/${manga.id}`} className="read-button">
              Открыть
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}

// Страница конкретной манги (берём /api/manga/:mangaId)
function MangaPage() {
  const { mangaId } = useParams();
  const navigate = useNavigate();

  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadManga() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/manga/${mangaId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Манга не найдена');
          }
          throw new Error('Ошибка при загрузке манги');
        }

        const data = await res.json();
        setManga(data);
      } catch (err) {
        setError(err.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    }

    loadManga();
  }, [mangaId]);

  if (loading) {
    return <p>Загрузка манги...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Ошибка: {error}</p>
        <button className="secondary-button" onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    );
  }

  if (!manga) {
    return (
      <div>
        <p>Манга не найдена.</p>
        <button className="secondary-button" onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Главная</Link> / <span>{manga.title}</span>
      </div>

      <h1 className="page-title">{manga.title}</h1>
      <p className="manga-description">{manga.description}</p>
      <p className="manga-meta">
        Всего глав: {manga.totalChapters} • Статус: {manga.status}
      </p>

      <h2 className="section-title">Главы (демо)</h2>

      <ul className="chapter-list">
        {manga.chapters.map((chapter) => (
          <li key={chapter.id} className="chapter-item">
            <div>
              <div className="chapter-title">
                Глава {chapter.number}: {chapter.title}
              </div>
              <div className="chapter-meta">
                {chapter.pages.length} страниц
              </div>
            </div>
            <Link
              to={`/manga/${manga.id}/chapters/${chapter.id}`}
              className="read-button small"
            >
              Читать
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Страница чтения главы (берём /api/manga/:mangaId/chapters/:chapterId)
function ReaderPage() {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();

  const [chapterData, setChapterData] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadChapter() {
      try {
        setLoading(true);
        setError(null);
        setPageIndex(0);

        const res = await fetch(
          `${API_URL}/api/manga/${mangaId}/chapters/${chapterId}`,
        );
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Глава или манга не найдены');
          }
          throw new Error('Ошибка при загрузке главы');
        }

        const data = await res.json();
        setChapterData(data);
      } catch (err) {
        setError(err.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [mangaId, chapterId]);

  if (loading) {
    return <p>Загрузка главы...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Ошибка: {error}</p>
        <button
          className="secondary-button"
          onClick={() => navigate(`/manga/${mangaId}`)}
        >
          К списку глав
        </button>
      </div>
    );
  }

  if (!chapterData) {
    return (
      <div>
        <p>Глава не найдена.</p>
        <button
          className="secondary-button"
          onClick={() => navigate(`/manga/${mangaId}`)}
        >
          К списку глав
        </button>
      </div>
    );
  }

  const { mangaTitle, chapter } = chapterData;
  const totalPages = chapter.pages.length;

  const goPrev = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="reader">
      <div className="breadcrumb">
        <Link to="/">Главная</Link> /{' '}
        <Link to={`/manga/${mangaId}`}>{mangaTitle}</Link> /{' '}
        <span>Глава {chapter.number}</span>
      </div>

      <h1 className="page-title">
        {mangaTitle} — глава {chapter.number}
      </h1>

      <div className="page-box">
        {chapter.pages[pageIndex]}
      </div>

      <div className="reader-controls">
        <div className="reader-buttons">
          <button
            className="secondary-button"
            onClick={() => navigate(`/manga/${mangaId}`)}
          >
            К списку глав
          </button>
          <button
            className="secondary-button"
            onClick={() => navigate('/')}
          >
            На главную
          </button>
        </div>

        <div className="reader-buttons">
          <button
            className="secondary-button"
            onClick={goPrev}
            disabled={pageIndex === 0}
          >
            ← Предыдущая страница
          </button>
          <button
            className="secondary-button"
            onClick={goNext}
            disabled={pageIndex === totalPages - 1}
          >
            Следующая страница →
          </button>
        </div>

        <div className="reader-page-indicator">
          Страница {pageIndex + 1} из {totalPages}
        </div>
      </div>
    </div>
  );
}

// Общий каркас приложения
function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">MANGANOVE</div>
        <p className="subtitle">Онлайн-ридер манги (прототип)</p>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/manga/:mangaId" element={<MangaPage />} />
          <Route
            path="/manga/:mangaId/chapters/:chapterId"
            element={<ReaderPage />}
          />
        </Routes>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} MANGANOVE. Прототип для обучения.</p>
      </footer>
    </div>
  );
}

export default App;

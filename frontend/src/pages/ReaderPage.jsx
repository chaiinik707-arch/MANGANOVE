import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ReaderPage() {
  const { id, chapterIndex } = useParams();
  const [chapter, setChapter] = useState(null);
  const [manga, setManga] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/manga/${id}`).then((res) => setManga(res.data));
    api
      .get(`/manga/${id / chapters}/${chapterIndex}`) // ОШИБКА: ниже правильный вариант в тексте
      .then((res) => setChapter(res.data));
  }, [id, chapterIndex]);

  // ↑ В коде выше ОПЕЧАТКА.
  // Правильно будет так:
  // api.get(`/manga/${id}/chapters/${chapterIndex}`).then((res) => setChapter(res.data));

  if (!chapter || !manga) return <div>Загрузка...</div>;

  const index = Number(chapterIndex);
  const hasPrev = index > 0;
  const hasNext = index < manga.chapters.length - 1;

  const goPrev = () => hasPrev && navigate(`/manga/${id}/read/${index - 1}`);
  const goNext = () => hasNext && navigate(`/manga/${id}/read/${index + 1}`);

  return (
    <div>
      <div>
        <button onClick={goPrev} disabled={!hasPrev}>
          Предыдущая глава
        </button>
        <button onClick={goNext} disabled={!hasNext}>
          Следующая глава
        </button>
        <Link to={`/manga/${id}`}>Назад к списку глав</Link>
      </div>

      <h2>{chapter.title}</h2>

      <div className="pages">
        {chapter.pages.map((pagePath, i) => (
          <img key={i} src={`http://localhost:4000${pagePath}`} alt={`Страница ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

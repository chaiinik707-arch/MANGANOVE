import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function MangaPage() {
  const { id } = useParams();
  const [manga, setManga] = useState(null);

  useEffect(() => {
    api.get(`/manga/${id}`).then((res) => setManga(res.data));
  }, [id]);

  if (!manga) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>{manga.title}</h1>
      <p>{manga.description}</p>

      <h2>Главы</h2>
      <ul>
        {manga.chapters.map((chapter, index) => (
          <li key={index}>
            <Link to={`/manga/${manga.id}/read/${index}`}>
              {chapter.title || `Глава ${index + 1}`}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

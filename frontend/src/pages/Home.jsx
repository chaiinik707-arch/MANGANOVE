import { useEffect, useState } from 'react';
import { api } from '../api/client';
import MangaCard from '../components/MangaCard';

export default function Home() {
  const [manga, setManga] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/manga').then((res) => setManga(res.data));
  }, []);

  const filtered = manga.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <h1>MANGANOVE</h1>
      <input placeholder="Поиск..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="grid">
        {filtered.map((item) => (
          <MangaCard key={item.id} manga={item} />
        ))}
      </div>
    </div>
  );
}

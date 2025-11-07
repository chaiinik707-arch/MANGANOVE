import { Link } from 'react-router-dom';

export default function MangaCard({ manga }) {
  return (
    <div className="manga-card">
      <Link to={`/manga/${manga.id}`}>
        <img src={manga.coverUrl || '/placeholder.jpg'} alt={manga.title} />
        <h3>{manga.title}</h3>
      </Link>
    </div>
  );
}

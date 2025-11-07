// backend/src/server.js

const express = require('express');
const cors = require('cors');
const { mangaList } = require('./mangaData');

const app = express();
const PORT = 4000;

// Разрешаем запросы с фронтенда (http://localhost:5173)
app.use(cors());
app.use(express.json());

// Простой health-check
app.get('/', (req, res) => {
  res.json({ message: 'MANGANOVE API работает' });
});

// Список всей манги
app.get('/api/manga', (req, res) => {
  const shortList = mangaList.map((manga) => ({
    id: manga.id,
    title: manga.title,
    status: manga.status,
    totalChapters: manga.totalChapters,
    description: manga.description,
  }));

  res.json(shortList);
});

// Информация о конкретной манге
app.get('/api/manga/:mangaId', (req, res) => {
  const { mangaId } = req.params;
  const manga = mangaList.find((m) => m.id === mangaId);

  if (!manga) {
    return res.status(404).json({ error: 'Манга не найдена' });
  }

  // Можно сразу отправлять всё, включая главы
  res.json(manga);
});

// Конкретная глава (для читалки)
app.get('/api/manga/:mangaId/chapters/:chapterId', (req, res) => {
  const { mangaId, chapterId } = req.params;

  const manga = mangaList.find((m) => m.id === mangaId);
  if (!manga) {
    return res.status(404).json({ error: 'Манга не найдена' });
  }

  const chapter = manga.chapters.find((ch) => ch.id === chapterId);
  if (!chapter) {
    return res.status(404).json({ error: 'Глава не найдена' });
  }

  res.json({
    mangaId: manga.id,
    mangaTitle: manga.title,
    chapter,
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`MANGANOVE API запущен на http://localhost:${PORT}`);
});

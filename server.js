const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Папки для данных и загрузок
const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(__dirname, "uploads");
const dataFile = path.join(dataDir, "manga.json");

// Создаём папки/файл, если их нет
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf8");

// Функции чтения/записи манги
function readManga() {
  try {
    const text = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
}

function writeManga(list) {
  fs.writeFileSync(dataFile, JSON.stringify(list, null, 2), "utf8");
}

// Настройка загрузок картинок
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, unique + ext);
  }
});

const upload = multer({ storage });

// Раздаём статику и папку с картинками
app.use(express.static(__dirname));
app.use("/uploads", express.static(uploadsDir));
app.use(express.json());

// ===== API =====

// Получить весь список манги
app.get("/api/manga", (req, res) => {
  const list = readManga();
  res.json(list);
});

// Создать новую мангу с одной главой
app.post("/api/manga", upload.array("pages"), (req, res) => {
  const { title, description, tags, chapterTitle } = req.body;

  if (!title || !description || !req.files || req.files.length === 0) {
    return res.status(400).json({
      error: "Нужно заполнить title, description и загрузить хотя бы одну картинку."
    });
  }

  const tagArr = tags
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const pages = req.files.map((file) => "/uploads/" + path.basename(file.path));

  const mangaList = readManga();

  const id = "m" + Date.now();

  const newManga = {
    id,
    title,
    description,
    tags: tagArr,
    coverLabel: title,
    chapters: [
      {
        title: chapterTitle || "Глава 1",
        pages
      }
    ]
  };

  mangaList.push(newManga);
  writeManga(mangaList);

  res.json(newManga);
});

// Добавить главу к существующей манге
app.post("/api/manga/:id/chapters", upload.array("pages"), (req, res) => {
  const mangaId = req.params.id;
  const { title } = req.body;

  const mangaList = readManga();
  const manga = mangaList.find((m) => m.id === mangaId);

  if (!manga) {
    return res.status(404).json({ error: "Манга не найдена" });
  }

  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ error: "Нужно загрузить хотя бы одну картинку." });
  }

  const pages = req.files.map((file) => "/uploads/" + path.basename(file.path));

  const newChapter = {
    title: title || "Новая глава",
    pages
  };

  manga.chapters.push(newChapter);
  writeManga(mangaList);

  res.json(manga);
});

// Удалить мангу целиком
app.delete("/api/manga/:id", (req, res) => {
  const mangaId = req.params.id;
  const mangaList = readManga();
  const index = mangaList.findIndex((m) => m.id === mangaId);

  if (index === -1) {
    return res.status(404).json({ error: "Манга не найдена" });
  }

  const [removed] = mangaList.splice(index, 1);
  writeManga(mangaList);

  // Картинки физически не удаляем из uploads, чтобы не усложнять.
  // Если захочешь — потом можно будет дописать удаление файлов.

  res.json({ ok: true, removedId: removed.id });
});

// Удалить главу по индексу
app.delete("/api/manga/:id/chapters/:chapterIndex", (req, res) => {
  const mangaId = req.params.id;
  const chapterIndex = Number(req.params.chapterIndex);

  const mangaList = readManga();
  const manga = mangaList.find((m) => m.id === mangaId);

  if (!manga) {
    return res.status(404).json({ error: "Манга не найдена" });
  }

  if (
    Number.isNaN(chapterIndex) ||
    chapterIndex < 0 ||
    chapterIndex >= manga.chapters.length
  ) {
    return res.status(400).json({ error: "Неверный индекс главы" });
  }

  const removedChapter = manga.chapters.splice(chapterIndex, 1);
  writeManga(mangaList);

  res.json({
    ok: true,
    removedChapterTitle: removedChapter[0]?.title || null,
    manga
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});

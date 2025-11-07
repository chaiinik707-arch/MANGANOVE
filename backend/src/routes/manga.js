const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const dataPath = path.join(__dirname, "../data/manga.json");

function readManga() {
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

// список всех тайтлов
router.get("/", (req, res) => {
  const manga = readManga();
  res.json(manga);
});

// один тайтл по id
router.get("/:id", (req, res) => {
  const manga = readManga();
  const item = manga.find((m) => m.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Manga not found" });
  }

  res.json(item);
});

// отдельная глава по индексу
router.get("/:id/chapters/:chapterIndex", (req, res) => {
  const manga = readManga();
  const item = manga.find((m) => m.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Manga not found" });
  }

  const chapter = item.chapters[Number(req.params.chapterIndex)];
  if (!chapter) {
    return res.status(404).json({ message: "Chapter not found" });
  }

  res.json(chapter);
});

module.exports = router;

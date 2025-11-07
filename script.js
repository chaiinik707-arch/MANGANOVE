// ================= ГЛОБАЛЬНОЕ СОСТОЯНИЕ =================

let mangaData = [];

let currentManga = null;
let currentChapterIndex = 0;
let currentPageIndex = 0;

// ================= ПОИСК DOM-ЭЛЕМЕНТОВ ==================

// Каталог
const mangaListEl = document.getElementById("manga-list");
// Главная
const popularListEl = document.getElementById("popular-list");
// Поисковая строка (на странице каталога)
const searchInputEl = document.getElementById("search-input");

// Читалка
const readerMangaTitleEl = document.getElementById("reader-manga-title");
const readerChapterTitleEl = document.getElementById("reader-chapter-title");
const pageIndicatorEl = document.getElementById("page-indicator");
const readerPagesEl = document.getElementById("reader-pages");
const prevChapterBtn = document.getElementById("prev-chapter");
const nextChapterBtn = document.getElementById("next-chapter");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const chapterSelectEl = document.getElementById("chapter-select");

// Админка — формы и элементы
const addMangaForm = document.getElementById("add-manga-form");
const newMangaTitleInput = document.getElementById("new-manga-title");
const newMangaDescriptionInput = document.getElementById("new-manga-description");
const newMangaTagsInput = document.getElementById("new-manga-tags");
const newChapterTitleInput = document.getElementById("new-chapter-title");
const newChapterPagesInput = document.getElementById("new-chapter-pages");

const addChapterForm = document.getElementById("add-chapter-form");
const chapterMangaSelect = document.getElementById("chapter-manga-select");
const newChapter2TitleInput = document.getElementById("new-chapter2-title");
const newChapter2PagesInput = document.getElementById("new-chapter2-pages");

const adminMangaListEl = document.getElementById("admin-manga-list");

// ================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===============

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ================== РАБОТА С API =========================

async function loadMangaData() {
  const res = await fetch("/api/manga");
  if (!res.ok) {
    throw new Error("Ошибка при загрузке манги");
  }
  mangaData = await res.json();
}

// Перезагрузить данные после изменений и обновить UI
async function reloadAndRender() {
  await loadMangaData();
  renderPopular();
  refreshChapterMangaSelect();
  renderAdminMangaList();

  // если есть строка поиска — перерисуем с учётом запроса
  if (searchInputEl && mangaListEl) {
    applySearch();
  } else {
    renderCatalog();
  }
}

// ================== ГЛАВНАЯ (index.html) =================

function renderPopular() {
  if (!popularListEl) return; // не на главной

  popularListEl.innerHTML = "";

  // пока просто первые три тайтла из списка
  const popular = mangaData.slice(0, 3);

  popular.forEach((manga) => {
    const card = document.createElement("article");
    card.className = "manga-card";

    let coverImage = null;
    if (manga.chapters && manga.chapters.length > 0) {
      const firstChapter = manga.chapters[0];
      if (firstChapter.pages && firstChapter.pages.length > 0) {
        coverImage = firstChapter.pages[0];
      }
    }

    card.innerHTML = `
      <div class="manga-cover ${coverImage ? "has-image" : ""}">
        ${
          coverImage
            ? `<img src="${coverImage}" alt="Обложка ${manga.title}" class="manga-cover-img" />`
            : `<span>${manga.coverLabel}</span>`
        }
      </div>
      <div class="manga-meta">
        <div class="manga-title">${manga.title}</div>
        <p class="manga-desc">${manga.description}</p>
        <div class="manga-tags">
          ${manga.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
        <a href="reader.html?id=${manga.id}" class="read-btn-link">
          <button class="read-btn">Читать</button>
        </a>
      </div>
    `;

    popularListEl.appendChild(card);
  });
}

function initHomePage() {
  renderPopular();
}

// ================== КАТАЛОГ (catalog.html) ===============

function renderCatalog(list = mangaData) {
  if (!mangaListEl) return;

  mangaListEl.innerHTML = "";

  list.forEach((manga) => {
    const card = document.createElement("article");
    card.className = "manga-card";

    let coverImage = null;
    if (manga.chapters && manga.chapters.length > 0) {
      const firstChapter = manga.chapters[0];
      if (firstChapter.pages && firstChapter.pages.length > 0) {
        coverImage = firstChapter.pages[0];
      }
    }

    card.innerHTML = `
      <div class="manga-cover ${coverImage ? "has-image" : ""}">
        ${
          coverImage
            ? `<img src="${coverImage}" alt="Обложка ${manga.title}" class="manga-cover-img" />`
            : `<span>${manga.coverLabel}</span>`
        }
      </div>
      <div class="manga-meta">
        <div class="manga-title">${manga.title}</div>
        <p class="manga-desc">${manga.description}</p>
        <div class="manga-tags">
          ${manga.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
        <a href="reader.html?id=${manga.id}" class="read-btn-link">
          <button class="read-btn">Читать</button>
        </a>
      </div>
    `;

    mangaListEl.appendChild(card);
  });
}

// поиск по названию / описанию / тегам
function applySearch() {
  if (!searchInputEl || !mangaListEl) return;

  const q = searchInputEl.value.trim().toLowerCase();

  if (!q) {
    renderCatalog(mangaData);
    return;
  }

  const filtered = mangaData.filter((manga) => {
    const title = (manga.title || "").toLowerCase();
    const desc = (manga.description || "").toLowerCase();
    const tags = (manga.tags || []).join(" ").toLowerCase();

    return (
      title.includes(q) ||
      desc.includes(q) ||
      tags.includes(q)
    );
  });

  renderCatalog(filtered);
}

function initCatalogPage() {
  if (!mangaListEl) return;

  renderCatalog();

  if (searchInputEl) {
    searchInputEl.addEventListener("input", applySearch);
  }
}

// ================== ЧИТАЛКА (reader.html) ================

function populateChapterSelect() {
  if (!currentManga || !chapterSelectEl) return;

  chapterSelectEl.innerHTML = "";

  currentManga.chapters.forEach((chapter, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = chapter.title || `Глава ${index + 1}`;
    chapterSelectEl.appendChild(opt);
  });

  chapterSelectEl.value = String(currentChapterIndex);
}

function updateReader() {
  if (!readerPagesEl || !currentManga) return;

  const chapter = currentManga.chapters[currentChapterIndex];
  const pageSrc = chapter.pages[currentPageIndex];

  if (readerMangaTitleEl) {
    readerMangaTitleEl.textContent = currentManga.title;
  }

  if (readerChapterTitleEl) {
    readerChapterTitleEl.textContent = chapter.title;
  }

  if (pageIndicatorEl) {
    pageIndicatorEl.textContent = `Глава ${currentChapterIndex + 1} • Страница ${
      currentPageIndex + 1
    } / ${chapter.pages.length}`;
  }

  readerPagesEl.innerHTML = "";

  const pageEl = document.createElement("div");
  pageEl.className = "manga-page";

  const img = document.createElement("img");
  img.src = pageSrc;
  img.alt = `Страница ${currentPageIndex + 1}`;

  pageEl.appendChild(img);
  readerPagesEl.appendChild(pageEl);

  if (prevChapterBtn && nextChapterBtn && prevPageBtn && nextPageBtn) {
    prevChapterBtn.disabled = currentChapterIndex === 0;
    nextChapterBtn.disabled =
      currentChapterIndex === currentManga.chapters.length - 1;
    prevPageBtn.disabled = currentPageIndex === 0;
    nextPageBtn.disabled = currentPageIndex === chapter.pages.length - 1;
  }

  if (chapterSelectEl) {
    chapterSelectEl.value = String(currentChapterIndex);
  }
}

function initReaderPage() {
  if (!readerPagesEl) return; // не на странице читалки

  const mangaId = getQueryParam("id");
  let chapterIdx = Number(getQueryParam("ch") || "0");
  if (Number.isNaN(chapterIdx)) chapterIdx = 0;

  currentManga = mangaData.find((m) => m.id === mangaId) || null;

  if (!currentManga) {
    if (readerMangaTitleEl) readerMangaTitleEl.textContent = "Манга не найдена";
    if (readerChapterTitleEl) readerChapterTitleEl.textContent = "";
    return;
  }

  if (chapterIdx < 0 || chapterIdx >= currentManga.chapters.length) {
    chapterIdx = 0;
  }
  currentChapterIndex = chapterIdx;
  currentPageIndex = 0;

  populateChapterSelect();
  updateReader();

  if (prevChapterBtn) {
    prevChapterBtn.addEventListener("click", () => {
      if (!currentManga) return;
      if (currentChapterIndex > 0) {
        currentChapterIndex--;
        currentPageIndex = 0;
        updateReader();
      }
    });
  }

  if (nextChapterBtn) {
    nextChapterBtn.addEventListener("click", () => {
      if (!currentManga) return;
      if (currentChapterIndex < currentManga.chapters.length - 1) {
        currentChapterIndex++;
        currentPageIndex = 0;
        updateReader();
      }
    });
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (!currentManga) return;
      if (currentPageIndex > 0) {
        currentPageIndex--;
        updateReader();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      if (!currentManga) return;
      const chapter = currentManga.chapters[currentChapterIndex];
      if (currentPageIndex < chapter.pages.length - 1) {
        currentPageIndex++;
        updateReader();
      }
    });
  }

  if (chapterSelectEl) {
    chapterSelectEl.addEventListener("change", () => {
      if (!currentManga) return;
      const idx = Number(chapterSelectEl.value);
      if (Number.isNaN(idx)) return;
      if (idx < 0 || idx >= currentManga.chapters.length) return;
      currentChapterIndex = idx;
      currentPageIndex = 0;
      updateReader();
    });
  }
}

// ================== АДМИНКА (admin.html) =================

function refreshChapterMangaSelect() {
  if (!chapterMangaSelect) return;

  chapterMangaSelect.innerHTML = "";

  if (mangaData.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Нет манги";
    chapterMangaSelect.appendChild(opt);
    chapterMangaSelect.disabled = true;
    return;
  }

  chapterMangaSelect.disabled = false;

  mangaData.forEach((manga) => {
    const opt = document.createElement("option");
    opt.value = manga.id;
    opt.textContent = manga.title;
    chapterMangaSelect.appendChild(opt);
  });
}

function renderAdminMangaList() {
  if (!adminMangaListEl) return;

  adminMangaListEl.innerHTML = "";

  if (mangaData.length === 0) {
    adminMangaListEl.textContent = "Пока нет ни одной манги.";
    return;
  }

  mangaData.forEach((manga) => {
    const card = document.createElement("div");
    card.className = "admin-manga-card";
    card.dataset.mangaId = manga.id;

    const header = document.createElement("div");
    header.className = "admin-manga-header";

    const titleEl = document.createElement("div");
    titleEl.className = "admin-manga-title";
    titleEl.textContent = manga.title;

    const deleteMangaBtn = document.createElement("button");
    deleteMangaBtn.className = "danger-btn";
    deleteMangaBtn.textContent = "Удалить мангу";
    deleteMangaBtn.dataset.action = "delete-manga";
    deleteMangaBtn.dataset.mangaId = manga.id;

    header.appendChild(titleEl);
    header.appendChild(deleteMangaBtn);

    const ul = document.createElement("ul");
    ul.className = "admin-chapter-list";

    manga.chapters.forEach((chapter, idx) => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = `Глава ${idx + 1}: ${chapter.title}`;

      const delChapterBtn = document.createElement("button");
      delChapterBtn.className = "danger-btn";
      delChapterBtn.textContent = "Удалить главу";
      delChapterBtn.dataset.action = "delete-chapter";
      delChapterBtn.dataset.mangaId = manga.id;
      delChapterBtn.dataset.chapterIndex = idx;

      li.appendChild(span);
      li.appendChild(delChapterBtn);
      ul.appendChild(li);
    });

    card.appendChild(header);
    card.appendChild(ul);
    adminMangaListEl.appendChild(card);
  });
}

function initAdminPage() {
  if (!addMangaForm && !addChapterForm && !adminMangaListEl) return;

  refreshChapterMangaSelect();
  renderAdminMangaList();

  // ===== Добавление новой манги =====
  if (addMangaForm) {
    addMangaForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = newMangaTitleInput.value.trim();
      const description = newMangaDescriptionInput.value.trim();
      const tagsStr = newMangaTagsInput.value.trim();
      const chapterTitle = newChapterTitleInput.value.trim() || "Глава 1";
      const files = Array.from(newChapterPagesInput.files);

      if (!title || !description || files.length === 0) {
        alert("Заполни название, описание и выбери хотя бы одну страницу.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tagsStr);
      formData.append("chapterTitle", chapterTitle);
      files.forEach((file) => formData.append("pages", file));

      try {
        const res = await fetch("/api/manga", {
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          console.error(await res.text());
          alert("Ошибка при добавлении манги.");
          return;
        }

        addMangaForm.reset();
        newChapterTitleInput.value = "Глава 1";

        await reloadAndRender();
        alert("Манга добавлена!");
      } catch (err) {
        console.error(err);
        alert("Ошибка сети при добавлении манги.");
      }
    });
  }

  // ===== Добавление новой главы к существующей манге =====
  if (addChapterForm) {
    addChapterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const mangaId = chapterMangaSelect.value;
      const chapterTitle = newChapter2TitleInput.value.trim() || "Новая глава";
      const files = Array.from(newChapter2PagesInput.files);

      if (!mangaId) {
        alert("Выбери мангу.");
        return;
      }
      if (files.length === 0) {
        alert("Выбери хотя бы одну картинку для страниц главы.");
        return;
      }

      const formData = new FormData();
      formData.append("title", chapterTitle);
      files.forEach((file) => formData.append("pages", file));

      try {
        const res = await fetch(`/api/manga/${mangaId}/chapters`, {
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          console.error(await res.text());
          alert("Ошибка при добавлении главы.");
          return;
        }

        addChapterForm.reset();

        await reloadAndRender();
        alert("Глава добавлена!");
      } catch (err) {
        console.error(err);
        alert("Ошибка сети при добавлении главы.");
      }
    });
  }

  // ===== Удаление манги / главы =====
  if (adminMangaListEl) {
    adminMangaListEl.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const action = btn.dataset.action;
      const mangaId = btn.dataset.mangaId;

      // Удаление манги
      if (action === "delete-manga") {
        const ok = confirm("Точно удалить эту мангу со всеми главами?");
        if (!ok) return;

        try {
          const res = await fetch(`/api/manga/${mangaId}`, {
            method: "DELETE"
          });
          if (!res.ok) {
            console.error(await res.text());
            alert("Ошибка при удалении манги.");
            return;
          }

          await reloadAndRender();
        } catch (err) {
          console.error(err);
          alert("Ошибка сети при удалении манги.");
        }
      }

      // Удаление главы
      if (action === "delete-chapter") {
        const chapterIndex = btn.dataset.chapterIndex;
        const ok = confirm("Удалить эту главу?");
        if (!ok) return;

        try {
          const res = await fetch(
            `/api/manga/${mangaId}/chapters/${chapterIndex}`,
            {
              method: "DELETE"
            }
          );
          if (!res.ok) {
            console.error(await res.text());
            alert("Ошибка при удалении главы.");
            return;
          }

          await reloadAndRender();
        } catch (err) {
          console.error(err);
          alert("Ошибка сети при удалении главы.");
        }
      }
    });
  }
}

// ================== СТАРТ ПРИ ЗАГРУЗКЕ ===================

(async function start() {
  try {
    await loadMangaData();
  } catch (err) {
    console.error(err);
    alert("Не удалось загрузить список манги с сервера.");
  }

  initHomePage();    // index.html (если есть popular-list)
  initCatalogPage(); // catalog.html
  initReaderPage();  // reader.html
  initAdminPage();   // admin.html
})();

//Миша, привет
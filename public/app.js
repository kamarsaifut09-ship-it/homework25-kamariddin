document.addEventListener("DOMContentLoaded", () => {
  // === БАЗА ДАННЫХ ТРЕКОВ ПО КАТЕГОРИЯМ ===
  const musicData = {
    jazz: {
      title: "Jazz",
      description: "Джазовая коллекция",
      color: "linear-gradient(135deg, #a855f7, #6d28d9)",
      tracks: [
        { title: "Midnight Avenue", artist: "Leo Carter", duration: "4:12" },
        { title: "Blue Velvet Rain", artist: "Nora Hayes", duration: "3:58" },
        { title: "Smoke & Saxophone", artist: "The Quiet Trio", duration: "3:45" },
        { title: "Late Night Samarkand", artist: "Aziz Rahimov Quartet", duration: "5:06" },
        { title: "Autumn Coffee", artist: "Mila Stone", duration: "3:21" },
        { title: "Brass Reflections", artist: "Jonah Reed", duration: "4:37" }
      ]
    },
    classic: {
      title: "Classic",
      description: "Классическая музыка",
      color: "linear-gradient(135deg, #f97316, #ea580c)",
      tracks: [
        { title: "Symphony No. 5", artist: "Philharmonic Orchestra", duration: "6:12" },
        { title: "Moonlight Sonata", artist: "Piano Ensemble", duration: "5:20" },
        { title: "Four Seasons - Winter", artist: "Chamber Strings", duration: "4:15" },
        { title: "Nocturne Op. 9", artist: "Frederic Sound", duration: "4:48" }
      ]
    },
    blues: {
      title: "Blues",
      description: "Блюзовая коллекция",
      color: "linear-gradient(135deg, #3b82f6, #2563eb)",
      tracks: [
        { title: "Mississippi Delta", artist: "Old Muddy", duration: "4:02" },
        { title: "City Lights Blues", artist: "B.B. Rhythm", duration: "5:11" },
        { title: "Cold Wind Howlin'", artist: "Slowhand Joe", duration: "3:55" }
      ]
    }
  };

  // === ЭЛЕМЕНТЫ DOM ===
  const themeToggleBtn = document.getElementById("theme-toggle");
  const categoryNav = document.getElementById("category-nav");
  const categoryButtons = document.querySelectorAll(".category");
  
  const crumbCategory = document.getElementById("crumb-category");
  const playlistTitle = document.getElementById("playlist-title");
  const playlistMeta = document.getElementById("playlist-meta");
  const heroCover = document.getElementById("hero-cover");
  const trackCount = document.getElementById("track-count");
  const trackList = document.getElementById("track-list");
  const statusMessage = document.getElementById("status-message");

  // Элементы плеера
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const likeBtn = document.getElementById("like-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const repeatBtn = document.getElementById("repeat-btn");
  
  const nowTitle = document.getElementById("now-title");
  const nowArtist = document.getElementById("now-artist");
  const miniCover = document.getElementById("mini-cover");

  // === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
  let currentCategoryKey = "jazz";
  let currentTrackIndex = 0;
  let isPlaying = false;
  let isLiked = false;

  // === ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ ТЕМЫ ===
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    themeToggleBtn.textContent = isLight ? "☾" : "☼";
  });

  // === РЕНДЕР ПЛЕЙЛИСТА ===
  function loadCategory(categoryKey) {
    currentCategoryKey = categoryKey;
    const category = musicData[categoryKey];

    // Обновляем шапку плейлиста
    crumbCategory.textContent = category.title;
    playlistTitle.textContent = category.title;
    playlistMeta.textContent = `${category.description} • Soundroom`;
    heroCover.style.background = category.color;
    trackCount.textContent = `${category.tracks.length} треков`;
    statusMessage.style.display = "none";

    // Обновление кнопок боковой панели
    categoryButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.category === categoryKey);
    });

    // Отрисовка треков
    trackList.innerHTML = "";
    category.tracks.forEach((track, index) => {
      const row = document.createElement("div");
      row.className = `track-row ${index === currentTrackIndex ? "active" : ""}`;
      row.innerHTML = `
        <span class="track-num">${index + 1}</span>
        <div class="track-info">
          <div class="track-thumb">♫</div>
          <div class="track-details">
            <span class="track-title">${track.title}</span>
            <span class="track-artist">${track.artist}</span>
          </div>
        </div>
        <span class="track-duration">${track.duration}</span>
      `;

      row.addEventListener("click", () => {
        selectTrack(index);
        startPlayback();
      });

      trackList.appendChild(row);
    });
  }

  // === ВЫБОР И ВОСПРОИЗВЕДЕНИЕ ТРЕКА ===
  function selectTrack(index) {
    currentTrackIndex = index;
    const track = musicData[currentCategoryKey].tracks[index];

    nowTitle.textContent = track.title;
    nowArtist.textContent = track.artist;
    miniCover.style.background = musicData[currentCategoryKey].color;

    // Обновляем активный класс в списке
    const rows = trackList.querySelectorAll(".track-row");
    rows.forEach((row, i) => {
      row.classList.toggle("active", i === index);
    });
  }

  function startPlayback() {
    isPlaying = true;
    playBtn.textContent = "❚❚";
  }

  function togglePlayback() {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? "❚❚" : "▶";
  }

  // === ИВЕНТЫ КНОПОК ПЛЕЕРА ===
  playBtn.addEventListener("click", togglePlayback);

  prevBtn.addEventListener("click", () => {
    const tracks = musicData[currentCategoryKey].tracks;
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(currentTrackIndex);
    if (isPlaying) startPlayback();
  });

  nextBtn.addEventListener("click", () => {
    const tracks = musicData[currentCategoryKey].tracks;
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    selectTrack(currentTrackIndex);
    if (isPlaying) startPlayback();
  });

  likeBtn.addEventListener("click", () => {
    isLiked = !isLiked;
    likeBtn.classList.toggle("active", isLiked);
    likeBtn.textContent = isLiked ? "♥" : "♡";
  });

  // Кнопки Shuffle & Repeat (переключатели состояния)
  [shuffleBtn, repeatBtn].forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  // Ивенты категорий
  categoryNav.addEventListener("click", (e) => {
    const button = e.target.closest(".category");
    if (button) {
      const categoryKey = button.dataset.category;
      if (categoryKey !== currentCategoryKey) {
        currentTrackIndex = 0;
        loadCategory(categoryKey);
        selectTrack(0);
      }
    }
  });

  // === ИНИЦИАЛИЗАЦИЯ ===
  loadCategory("jazz");
  selectTrack(0);
});
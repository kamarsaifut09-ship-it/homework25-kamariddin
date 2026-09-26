document.addEventListener("DOMContentLoaded", () => {
  // === БАЗА ДАННЫХ (Встроенный JSON) ===
  const musicData = {
    jazz: {
      title: "Jazz",
      description: "Джазовая коллекция",
      color: "linear-gradient(135deg, #a855f7, #6d28d9)",
      tracks: [
        { id: "j1", title: "Midnight Avenue", artist: "Leo Carter", durationSec: 252 },
        { id: "j2", title: "Blue Velvet Rain", artist: "Nora Hayes", durationSec: 238 },
        { id: "j3", title: "Smoke & Saxophone", artist: "The Quiet Trio", durationSec: 225 },
        { id: "j4", title: "Late Night Samarkand", artist: "Aziz Rahimov Quartet", durationSec: 306 },
        { id: "j5", title: "Autumn Coffee", artist: "Mila Stone", durationSec: 201 },
        { id: "j6", title: "Brass Reflections", artist: "Jonah Reed", durationSec: 277 }
      ]
    },
    classic: {
      title: "Classic",
      description: "Классическая музыка",
      color: "linear-gradient(135deg, #f97316, #ea580c)",
      tracks: [
        { id: "c1", title: "Symphony No. 5", artist: "Philharmonic Orchestra", durationSec: 372 },
        { id: "c2", title: "Moonlight Sonata", artist: "Piano Ensemble", durationSec: 320 },
        { id: "c3", title: "Four Seasons - Winter", artist: "Chamber Strings", durationSec: 255 },
        { id: "c4", title: "Nocturne Op. 9", artist: "Frederic Sound", durationSec: 288 }
      ]
    },
    blues: {
      title: "Blues",
      description: "Блюзовая коллекция",
      color: "linear-gradient(135deg, #3b82f6, #2563eb)",
      tracks: [
        { id: "b1", title: "Mississippi Delta", artist: "Old Muddy", durationSec: 242 },
        { id: "b2", title: "City Lights Blues", artist: "B.B. Rhythm", durationSec: 311 },
        { id: "b3", title: "Cold Wind Howlin'", artist: "Slowhand Joe", durationSec: 235 }
      ]
    }
  };

  // === DOM ЭЛЕМЕНТЫ ===
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

  // Кнопки плеера
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const likeBtn = document.getElementById("like-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const repeatBtn = document.getElementById("repeat-btn");
  const muteBtn = document.getElementById("mute-btn");
  const volumeSlider = document.getElementById("volume");

  // Инфо в плеере
  const nowTitle = document.getElementById("now-title");
  const nowArtist = document.getElementById("now-artist");
  const miniCover = document.getElementById("mini-cover");

  // Прогресс
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const progressBar = document.getElementById("progress");

  // === СОСТОЯНИЕ (STATE) ===
  let viewedCategoryKey = "jazz";        // Категория на экране
  let activePlayingCategoryKey = "jazz"; // Категория в звуке
  let currentTrackIndex = 0;             // Индекс активного трека
  
  let isPlaying = false;
  let isLiked = false;
  let isShuffle = false;
  let isRepeat = false;
  
  let currentTime = 0;
  let trackTimer = null;
  let lastVolume = 70;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // === ПЕРЕКЛЮЧЕНИЕ ТЕМЫ ===
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    themeToggleBtn.textContent = isLight ? "☾" : "☼";
  });

  // === НАВИГАЦИЯ ПО КАТЕГОРИЯМ ===
  function viewCategory(categoryKey) {
    viewedCategoryKey = categoryKey;
    const category = musicData[categoryKey];

    crumbCategory.textContent = category.title;
    playlistTitle.textContent = category.title;
    playlistMeta.textContent = `${category.description} • Soundroom`;
    heroCover.style.background = category.color;
    trackCount.textContent = `${category.tracks.length} треков`;
    statusMessage.style.display = "none";

    categoryButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.category === categoryKey);
    });

    renderTrackList();
  }

  function renderTrackList() {
    const category = musicData[viewedCategoryKey];
    trackList.innerHTML = "";

    category.tracks.forEach((track, index) => {
      // Подсветка активна только при совпадении играющей категории и просмотровой
      const isCurrentlyPlaying = 
        viewedCategoryKey === activePlayingCategoryKey && index === currentTrackIndex;

      const row = document.createElement("div");
      row.className = `track-row ${isCurrentlyPlaying ? "active" : ""}`;
      row.innerHTML = `
        <span class="track-num">${index + 1}</span>
        <div class="track-info">
          <div class="track-thumb">♫</div>
          <div class="track-details">
            <span class="track-title">${track.title}</span>
            <span class="track-artist">${track.artist}</span>
          </div>
        </div>
        <span class="track-duration">${formatTime(track.durationSec)}</span>
      `;

      row.addEventListener("click", () => {
        activePlayingCategoryKey = viewedCategoryKey;
        selectTrack(index);
        startPlayback();
      });

      trackList.appendChild(row);
    });
  }

  // === ЛОГИКА ПЛЕЕРА И ТАЙМЕРА ===
  function selectTrack(index) {
    currentTrackIndex = index;
    const playingCategory = musicData[activePlayingCategoryKey];
    const track = playingCategory.tracks[index];

    nowTitle.textContent = track.title;
    nowArtist.textContent = track.artist;
    miniCover.style.background = playingCategory.color;

    currentTime = 0;
    progressBar.max = track.durationSec;
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = formatTime(track.durationSec);

    renderTrackList();
  }

  function startPlayback() {
    isPlaying = true;
    playBtn.textContent = "❚❚";

    clearInterval(trackTimer);
    trackTimer = setInterval(() => {
      const playingCategory = musicData[activePlayingCategoryKey];
      const currentTrack = playingCategory.tracks[currentTrackIndex];

      if (currentTime < currentTrack.durationSec) {
        currentTime++;
        progressBar.value = currentTime;
        currentTimeEl.textContent = formatTime(currentTime);
      } else {
        handleTrackEnd();
      }
    }, 1000);
  }

  function pausePlayback() {
    isPlaying = false;
    playBtn.textContent = "▶";
    clearInterval(trackTimer);
  }

  function togglePlayback() {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  function handleTrackEnd() {
    if (isRepeat) {
      selectTrack(currentTrackIndex);
      startPlayback();
    } else {
      playNextTrack();
    }
  }

  function playNextTrack() {
    const tracks = musicData[activePlayingCategoryKey].tracks;
    if (isShuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * tracks.length);
      } while (randomIndex === currentTrackIndex && tracks.length > 1);
      currentTrackIndex = randomIndex;
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    }
    selectTrack(currentTrackIndex);
    if (isPlaying) startPlayback();
  }

  function playPrevTrack() {
    const tracks = musicData[activePlayingCategoryKey].tracks;
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(currentTrackIndex);
    if (isPlaying) startPlayback();
  }

  // === СОБЫТИЯ УПРАВЛЕНИЯ ===
  playBtn.addEventListener("click", togglePlayback);
  nextBtn.addEventListener("click", playNextTrack);
  prevBtn.addEventListener("click", playPrevTrack);

  progressBar.addEventListener("input", () => {
    currentTime = parseInt(progressBar.value, 10);
    currentTimeEl.textContent = formatTime(currentTime);
  });

  likeBtn.addEventListener("click", () => {
    isLiked = !isLiked;
    likeBtn.classList.toggle("active", isLiked);
    likeBtn.textContent = isLiked ? "♥" : "♡";
  });

  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
  });

  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
  });

  // Громкость и Mute
  function updateVolumeIcon(val) {
    if (val == 0) muteBtn.textContent = "🔇";
    else if (val < 30) muteBtn.textContent = "🔈";
    else if (val < 70) muteBtn.textContent = "🔉";
    else muteBtn.textContent = "🔊";
  }

  volumeSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    updateVolumeIcon(val);
    if (val > 0) lastVolume = val;
  });

  muteBtn.addEventListener("click", () => {
    if (volumeSlider.value > 0) {
      lastVolume = volumeSlider.value;
      volumeSlider.value = 0;
      updateVolumeIcon(0);
    } else {
      volumeSlider.value = lastVolume || 70;
      updateVolumeIcon(volumeSlider.value);
    }
  });

  // Клик по категориям в меню (НЕ останавливает воспроизведение)
  categoryNav.addEventListener("click", (e) => {
    const button = e.target.closest(".category");
    if (button) {
      const categoryKey = button.dataset.category;
      if (categoryKey !== viewedCategoryKey) {
        viewCategory(categoryKey);
      }
    }
  });

  // === ИНИЦИАЛИЗАЦИЯ ===
  viewCategory("jazz");
  selectTrack(0);
  updateVolumeIcon(volumeSlider.value);
});
document.addEventListener("DOMContentLoaded", () => {
  // === БАЗА ДАННЫХ С ТОЧНЫМИ ПУТЯМИ И НАЗВАНИЯМИ ФАЙЛОВ ===
  const musicData = {
    jazz: {
      title: "Jazz",
      description: "Джазовая коллекция",
      color: "linear-gradient(135deg, #a855f7, #6d28d9)",
      tracks: [
        { id: "j1", title: "Have Yourself A Merry Little Christmas", artist: "Frank Sinatra", url: "public/music/jazz/Frank Sinatra - Have Yourself A Merry Little Christmas.mp3" },
        { id: "j2", title: "Jingle Bells", artist: "Frank Sinatra", url: "public/music/jazz/Frank Sinatra - Jingle Bells.mp3" },
        { id: "j3", title: "My Way", artist: "Frank Sinatra", url: "public/music/jazz/Frank Sinatra - My Way.mp3" },
        { id: "j4", title: "Strangers In The Night", artist: "Frank Sinatra", url: "public/music/jazz/Frank Sinatra - Strangers In The Night.mp3" },
        { id: "j5", title: "Gloria!", artist: "Kim Jo Seph", url: "public/music/jazz/Kim Jo Seph - Gloria!.mp3" },
        { id: "j6", title: "Hello Dolly", artist: "Louis Armstrong", url: "public/music/jazz/Louis Armstrong - Hello Dolly.mp3" },
        { id: "j7", title: "Let My People Go", artist: "Louis Armstrong", url: "public/music/jazz/Louis Armstrong - Let My People Go.mp3" },
        { id: "j8", title: "What A Wonderful World", artist: "Louis Armstrong", url: "public/music/jazz/Louis Armstrong - What A Wonderful World.mp3" }
      ]
    },
    classic: {
      title: "Classic",
      description: "Классическая музыка",
      color: "linear-gradient(135deg, #f97316, #ea580c)",
      tracks: [
        { id: "c1", title: "Summer Storm (The Four Seasons Summer, Op. 8, Rv315)", artist: "Antonio Vivaldi", url: "public/music/classic/Antonio Vivaldi - Summer Storm (The Four Seasons Summer, Op. 8, Rv315).mp3" },
        { id: "c2", title: "Весна (Времена Года RV 315)", artist: "Antonio Vivaldi", url: "public/music/classic/Antonio Vivaldi - Весна (Времена Года RV 315).mp3" },
        { id: "c3", title: "Le Vent, Le Cri", artist: "Ennio Morricone", url: "public/music/classic/Ennio Morricone - Le Vent, Le Cri.mp3" },
        { id: "c4", title: "Fur Elise (Bagatelle In A Minor, Woo 59)", artist: "Ludwig Van Beethoven", url: "public/music/classic/Ludwig Van Beethoven - Fur Elise (Bagatelle In A Minor, Woo 59).mp3" },
        { id: "c5", title: "Каприз N24 ля-минор", artist: "Niccolo Paganini", url: "public/music/classic/Niccolo Paganini - Каприз N24 ля-минор.mp3" },
        { id: "c6", title: "In This Shirt", artist: "The Irrepressibles", url: "public/music/classic/The Irrepressibles - In This Shirt.mp3" }
      ]
    },
    blues: {
      title: "Blues",
      description: "Блюзовая коллекция",
      color: "linear-gradient(135deg, #3b82f6, #2563eb)",
      tracks: [
        { id: "b1", title: "Black Velvet", artist: "Alannah Myles", url: "public/music/blues/Alannah Myles - Black Velvet.mp3" },
        { id: "b2", title: "I Just Wanna Be With You", artist: "Chris Rea", url: "public/music/blues/Chris Rea - I Just Wanna Be With You.mp3" },
        { id: "b3", title: "The Road To Hell. Part 2 (LP Version)", artist: "Chris Rea", url: "public/music/blues/Chris Rea - The Road To Hell. Part 2 (LP Version).mp3" },
        { id: "b4", title: "Have You Ever Seen the Rain", artist: "Creedence Clearwater Revived", url: "public/music/blues/Creedence Clearwater Revived - Have You Ever Seen the Rain.mp3" },
        { id: "b5", title: "Oh, Darling!", artist: "The Beatles", url: "public/music/blues/The Beatles - Oh, Darling!.mp3" },
        { id: "b6", title: "Living In A Ghost Town", artist: "The Rolling Stones", url: "public/music/blues/The Rolling Stones - Living In A Ghost Town.mp3" }
      ]
    }
  };

  // === ОБЪЕКТ АУДИО ===
  const audio = new Audio();

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

  // Кнопки управления
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const likeBtn = document.getElementById("like-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const repeatBtn = document.getElementById("repeat-btn");
  const muteBtn = document.getElementById("mute-btn");
  const volumeSlider = document.getElementById("volume");

  // Карточка текущего трека
  const nowTitle = document.getElementById("now-title");
  const nowArtist = document.getElementById("now-artist");
  const miniCover = document.getElementById("mini-cover");

  // Прогресс
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");
  const progressBar = document.getElementById("progress");

  // === СОСТОЯНИЕ (STATE) ===
  let viewedCategoryKey = "jazz";
  let activePlayingCategoryKey = "jazz";
  let currentTrackIndex = 0;
  
  let isLiked = false;
  let isShuffle = false;
  let isRepeat = false;
  let lastVolume = 0.7;

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // === 1. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ ===
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    themeToggleBtn.textContent = isLight ? "☾" : "☼";
  });

  // === 2. НАВИГАЦИЯ И КАТЕГОРИИ ===
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
        <span class="track-duration">♪</span>
      `;

      row.addEventListener("click", () => {
        activePlayingCategoryKey = viewedCategoryKey;
        selectTrack(index);
        playAudio();
      });

      trackList.appendChild(row);
    });
  }

  // === 3. ВОСПРОИЗВЕДЕНИЕ ===
  function selectTrack(index) {
    currentTrackIndex = index;
    const playingCategory = musicData[activePlayingCategoryKey];
    const track = playingCategory.tracks[index];

    nowTitle.textContent = track.title;
    nowArtist.textContent = track.artist;
    miniCover.style.background = playingCategory.color;

    audio.src = track.url;
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";

    renderTrackList();
  }

  function playAudio() {
    audio.play().then(() => {
      playBtn.textContent = "❚❚";
    }).catch(err => {
      console.warn("Ошибка воспроизведения:", err);
    });
  }

  function pauseAudio() {
    audio.pause();
    playBtn.textContent = "▶";
  }

  function togglePlayback() {
    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  audio.addEventListener("timeupdate", () => {
    if (!isNaN(audio.duration) && isFinite(audio.duration)) {
      const progressPercent = (audio.currentTime / audio.duration) * 1000;
      progressBar.max = 1000;
      progressBar.value = progressPercent || 0;
      
      currentTimeEl.textContent = formatTime(audio.currentTime);
      durationEl.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      playAudio();
    } else {
      playNextTrack();
    }
  });

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
    playAudio();
  }

  function playPrevTrack() {
    const tracks = musicData[activePlayingCategoryKey].tracks;
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(currentTrackIndex);
    playAudio();
  }

  progressBar.addEventListener("input", () => {
    if (!isNaN(audio.duration) && isFinite(audio.duration)) {
      audio.currentTime = (progressBar.value / 1000) * audio.duration;
    }
  });

  // === 4. КНОПКИ УПРАВЛЕНИЯ ===
  playBtn.addEventListener("click", togglePlayback);
  nextBtn.addEventListener("click", playNextTrack);
  prevBtn.addEventListener("click", playPrevTrack);

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

  // === 5. ГРОМКОСТЬ ===
  audio.volume = volumeSlider.value / 100;

  function updateVolumeIcon(val) {
    if (val == 0) muteBtn.textContent = "🔇";
    else if (val < 30) muteBtn.textContent = "🔈";
    else if (val < 70) muteBtn.textContent = "🔉";
    else muteBtn.textContent = "🔊";
  }

  volumeSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    audio.volume = val / 100;
    updateVolumeIcon(val);
    if (val > 0) lastVolume = audio.volume;
  });

  muteBtn.addEventListener("click", () => {
    if (audio.volume > 0) {
      lastVolume = audio.volume;
      audio.volume = 0;
      volumeSlider.value = 0;
      updateVolumeIcon(0);
    } else {
      audio.volume = lastVolume || 0.7;
      volumeSlider.value = audio.volume * 100;
      updateVolumeIcon(volumeSlider.value * 100);
    }
  });

  categoryNav.addEventListener("click", (e) => {
    const button = e.target.closest(".category");
    if (button) {
      const categoryKey = button.dataset.category;
      if (categoryKey !== viewedCategoryKey) {
        viewCategory(categoryKey);
      }
    }
  });

  // ИНИЦИАЛИЗАЦИЯ
  viewCategory("jazz");
  selectTrack(0);
  updateVolumeIcon(volumeSlider.value);
});
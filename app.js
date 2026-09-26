(() => {
  'use strict';
  const audio = new Audio(); // Единственный Audio на весь плеер.
  audio.preload = 'metadata';
  const state = { category: 'jazz', trackId: null, isPlaying: false, volume: 0.7, muted: false, previousVolume: 0.7, shuffle: false, repeat: false };
  let tracks = [];
  const $ = id => document.getElementById(id);
  const els = {
    nav: $('category-nav'), list: $('track-list'), status: $('status-message'), count: $('track-count'),
    title: $('playlist-title'), crumb: $('crumb-category'), meta: $('playlist-meta'), cover: $('hero-cover'),
    nowTitle: $('now-title'), nowArtist: $('now-artist'), play: $('play-btn'), progress: $('progress'),
    current: $('current-time'), duration: $('duration'), volume: $('volume'), mute: $('mute-btn'),
    mini: $('mini-cover'), like: $('like-btn'), shuffle: $('shuffle-btn'), repeat: $('repeat-btn')
  };
  const categoryNames = { jazz:'Jazz', classic:'Classic', blues:'Blues' };
  const categoryColors = { jazz:['#9b5cff','#5423c5'], classic:['#d97706','#8a3d08'], blues:['#3975f6','#183caa'] };
  const currentTrack = () => tracks.find(t => t.id === state.trackId) || null;
  const categoryTracks = () => tracks.filter(t => t.category === state.category);
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  }
  function safeFilePath(file) {
    return file.split('/').map((part, i) => i === 0 ? part : encodeURIComponent(part)).join('/');
  }
  function renderCategories() {
    els.nav.querySelectorAll('[data-category]').forEach(btn => {
      const active = btn.dataset.category === state.category;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
      const count = tracks.filter(t => t.category === btn.dataset.category).length;
      btn.querySelector('small').textContent = `${count} треков`;
    });
  }
  function renderList() {
    const items = categoryTracks();
    els.count.textContent = `${items.length} ${items.length === 1 ? 'трек' : 'треков'}`;
    els.list.replaceChildren();
    items.forEach((track, i) => {
      const active = track.id === state.trackId;
      const row = document.createElement('button');
      row.type = 'button'; row.className = `track-row${active ? ' active' : ''}`;
      row.style.setProperty('--i', i);
      row.setAttribute('aria-label', `${track.title}, ${track.artist}${active ? ', выбран' : ''}`);
      row.innerHTML = `<span class="track-number">${active && state.isPlaying ? '♫' : i + 1}</span><span class="track-info"><span class="track-thumb">${active && state.isPlaying ? '♫' : '♪'}</span><span class="track-text"><span class="track-title"></span><span class="track-artist"></span></span></span><span class="track-duration">${active && Number.isFinite(audio.duration) ? formatTime(audio.duration) : '—:—'}</span>`;
      row.querySelector('.track-title').textContent = track.title;
      row.querySelector('.track-artist').textContent = track.artist;
      row.addEventListener('click', () => selectTrack(track, true));
      els.list.append(row);
    });
    els.status.textContent = items.length ? '' : 'В этой категории пока нет треков.';
  }
  function renderNowPlaying() {
    const track = currentTrack();
    els.nowTitle.textContent = track ? track.title : 'Выберите трек';
    els.nowArtist.textContent = track ? track.artist : '—';
    els.mini.textContent = track ? '♫' : '♪';
    els.play.textContent = state.isPlaying ? 'Ⅱ' : '▶';
    els.play.setAttribute('aria-label', state.isPlaying ? 'Пауза' : 'Воспроизвести');
    els.like.classList.remove('liked');
    renderList();
  }
  function updateProgress() {
    const duration = audio.duration;
    const current = audio.currentTime || 0;
    const pct = Number.isFinite(duration) && duration > 0 ? current / duration * 100 : 0;
    els.progress.value = Math.round(pct * 10);
    els.progress.style.setProperty('--fill', `${pct}%`);
    els.current.textContent = formatTime(current);
    els.duration.textContent = formatTime(duration);
  }
  function setCategory(category) {
    if (!categoryNames[category]) return;
    state.category = category;
    const [c1,c2] = categoryColors[category];
    els.cover.style.background = `linear-gradient(135deg,${c1},${c2})`;
    els.mini.style.background = `linear-gradient(135deg,${c1},${c2})`;
    els.title.textContent = categoryNames[category];
    els.crumb.textContent = categoryNames[category];
    els.meta.textContent = `${categoryTracks().length} треков • Soundroom`;
    renderCategories(); renderList();
  }
  async function selectTrack(track, autoplay) {
    if (state.trackId === track.id) {
      if (autoplay) togglePlayback();
      return;
    }
    state.trackId = track.id;
    audio.pause();
    state.isPlaying = false;
    audio.src = safeFilePath(track.file);
    audio.load();
    audio.volume = state.muted ? 0 : state.volume;
    updateProgress(); renderNowPlaying();
    if (autoplay) await playAudio();
  }
  async function playAudio() {
    if (!currentTrack()) {
      const first = categoryTracks()[0];
      if (!first) return;
      state.trackId = first.id;
      audio.src = safeFilePath(first.file);
      audio.load();
    }
    try {
      await audio.play();
      state.isPlaying = true;
      renderNowPlaying();
    } catch (err) {
      state.isPlaying = false;
      renderNowPlaying();
      els.status.textContent = 'Не удалось воспроизвести файл. Проверьте наличие MP3 и запустите страницу через локальный сервер.';
      console.error('Playback error:', err);
    }
  }
  function pauseAudio() { audio.pause(); state.isPlaying = false; renderNowPlaying(); }
  function togglePlayback() { state.isPlaying ? pauseAudio() : playAudio(); }
  async function playAdjacent(direction) {
    const list = categoryTracks();
    if (!list.length) return;
    const active = currentTrack();
    let index = list.findIndex(t => t.id === active?.id);
    if (index < 0) index = direction > 0 ? -1 : 0;
    let nextIndex;
    if (state.shuffle && list.length > 1) {
      do { nextIndex = Math.floor(Math.random() * list.length); } while (nextIndex === index);
    } else nextIndex = (index + direction + list.length) % list.length;
    await selectTrack(list[nextIndex], true);
  }
  els.nav.addEventListener('click', e => {
    const btn = e.target.closest('[data-category]');
    if (btn) setCategory(btn.dataset.category);
  });
  els.play.addEventListener('click', togglePlayback);
  $('prev-btn').addEventListener('click', () => playAdjacent(-1));
  $('next-btn').addEventListener('click', () => playAdjacent(1));
  els.progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Number(els.progress.value) / 1000 * audio.duration;
      updateProgress();
    }
  });
  els.volume.addEventListener('input', () => {
    state.volume = Number(els.volume.value) / 100;
    if (!state.muted) audio.volume = state.volume;
    if (state.volume > 0) { state.previousVolume = state.volume; state.muted = false; }
    updateVolumeUI();
  });
  function updateVolumeUI() {
    els.volume.style.setProperty('--fill', `${Number(els.volume.value)}%`);
    els.mute.textContent = state.muted || state.volume === 0 ? '◖×' : '◖))';
    els.mute.setAttribute('aria-label', state.muted ? 'Включить звук' : 'Выключить звук');
  }
  els.mute.addEventListener('click', () => {
    if (state.muted || state.volume === 0) {
      state.muted = false; state.volume = state.previousVolume || 0.7;
    } else {
      state.previousVolume = state.volume; state.muted = true;
    }
    audio.volume = state.muted ? 0 : state.volume;
    els.volume.value = Math.round(state.volume * 100);
    updateVolumeUI();
  });
  els.shuffle.addEventListener('click', () => {
    state.shuffle = !state.shuffle; els.shuffle.style.color = state.shuffle ? 'var(--accent)' : '';
    els.shuffle.setAttribute('aria-pressed', String(state.shuffle));
  });
  els.repeat.addEventListener('click', () => {
    state.repeat = !state.repeat; audio.loop = state.repeat;
    els.repeat.style.color = state.repeat ? 'var(--accent)' : '';
    els.repeat.setAttribute('aria-pressed', String(state.repeat));
  });
  els.like.addEventListener('click', () => {
    const liked = els.like.classList.toggle('liked'); els.like.textContent = liked ? '♥' : '♡';
  });
  $('theme-toggle').addEventListener('click', () => document.body.classList.toggle('light'));
  audio.addEventListener('play', () => { state.isPlaying = true; renderNowPlaying(); });
  audio.addEventListener('pause', () => { state.isPlaying = false; renderNowPlaying(); });
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', () => { updateProgress(); renderList(); });
  audio.addEventListener('ended', () => { if (!state.repeat) playAdjacent(1); });
  audio.addEventListener('error', () => {
    if (currentTrack()) {
      els.status.textContent = `Не удалось загрузить «${currentTrack().title}». Убедитесь, что файл находится в public/music/${currentTrack().category}/.`;
      console.error('Audio load error:', audio.error);
    }
  });
  async function init() {
    try {
      const response = await fetch('tracks.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('tracks.json должен содержать массив треков');
      const ids = new Set();
      tracks = data.filter(t => {
        const valid = Number.isInteger(t.id) && t.title && t.artist && categoryNames[t.category] && typeof t.file === 'string' && !ids.has(t.id);
        if (valid) ids.add(t.id);
        return valid;
      });
      if (!tracks.length) throw new Error('В tracks.json нет корректных треков');
      setCategory(state.category);
      els.status.textContent = '';
      renderNowPlaying();
    } catch (error) {
      console.error('Tracks loading error:', error);
      els.status.textContent = 'Не удалось загрузить tracks.json. Запустите проект через локальный сервер (например, Live Server).';
      els.count.textContent = 'Ошибка загрузки';
    }
  }
  audio.volume = state.volume;
  updateVolumeUI();
  init();
})();
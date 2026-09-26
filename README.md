# Soundroom — учебный музыкальный плеер

## Запуск
`fetch()` не работает надёжно при открытии `index.html` напрямую через `file://`. Запустите проект через локальный сервер:
- VS Code: установите/запустите **Live Server** и откройте `index.html`; или
- Python: из папки проекта выполните `python -m http.server 8000`, затем откройте `http://localhost:8000`.

## Структура
- `index.html`, `styles.css`, `app.js`
- `public/tracks.json` — каталог всех аудиотреков
- `public/music/jazz/`, `public/music/classic/`, `public/music/blues/` — MP3 по категориям

JSON хранит пути относительно папки `public`, например `music/jazz/имя-файла.mp3`. Поэтому папку `public` нужно считать корнем сайта при запуске/публикации (для простого локального сервера можно открыть `public/index.html`; либо скопировать `index.html`, `styles.css`, `app.js` в `public`). 

**Быстрый запуск:** переместите `index.html`, `styles.css`, `app.js` внутрь `public/` или используйте корень `public` как web root.

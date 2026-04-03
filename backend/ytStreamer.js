import { spawn } from 'child_process';
import fs from 'fs';

// Случайные User-Agents для обхода банов на стороне YouTube
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Базовые аргументы yt-dlp: использование прокси, подмена юзер-агента и импорт кук.
 */
function getBaseArgs() {
  const args = [
    '--proxy', 'socks5://127.0.0.1:10808', // Направляем трафик через поднятый Xray
    '--user-agent', getRandomUserAgent(),
    '--no-warnings'
  ];

  // Анти-бан: файл cookies (должен быть смонтирован в data/cookies.txt)
  // Это позволит скачивать видео без 403 Forbidden
  if (fs.existsSync('./data/cookies.txt')) {
    args.push('--cookies', './data/cookies.txt');
  }
  
  return args;
}

/**
 * Выполняем поиск видео на YouTube.
 * Используем ytsearch для получения до 10 результатов.
 */
export async function searchYoutube(query) {
  const args = [
    ...getBaseArgs(),
    '--dump-json',
    '--no-playlist',
    `ytsearch10:${query}`
  ];

  return new Promise((resolve, reject) => {
    const yt = spawn('yt-dlp', args);
    let output = '';

    yt.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });

    yt.on('close', (code) => {
      if (code !== 0 && !output) {
        return reject(new Error(`Ошибка поиска yt-dlp (код ${code})`));
      }
      try {
        const lines = output.trim().split('\n').filter(l => l.length > 0);
        const results = lines.map(line => {
          const v = JSON.parse(line);
          return {
            id: v.id,
            title: v.title,
            thumbnail: v.thumbnail,
            duration: v.duration_string,
            uploader: v.uploader,
            url: v.original_url || `https://www.youtube.com/watch?v=${v.id}`
          };
        });
        resolve(results);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Прямая потоковая передача видео в HTTP-ответ.
 * Направляет данные из стандартного вывода yt-dlp прямо к клиенту.
 */
export function pipeVideoToClient(req, res, videoIdOrUrl) {
  const url = videoIdOrUrl.startsWith('http') ? videoIdOrUrl : `https://www.youtube.com/watch?v=${videoIdOrUrl}`;
  
  // Выбираем формат, обеспечивающий минимальную задержку: мы берём 'best' 
  // (обычно это 720p с уже объединённым аудио и видео - идеально для экранов авто).
  // Пайпим সরাসরি в стандартный вывод (-o -) без сохранения на диск сервера.
  const args = [
    ...getBaseArgs(),
    '-f', 'best', 
    '-o', '-', 
    '--no-playlist',
    url
  ];

  const yt = spawn('yt-dlp', args);

  // Стандарты для прогрессивного видео-потока
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Transfer-Encoding', 'chunked');

  // Непрерывный пайп видеоданных в Express Response
  yt.stdout.pipe(res);

  yt.stderr.on('data', (data) => {
    const msg = data.toString();
    // Логируем только ошибки
    if (msg.includes('ERROR:')) {
      console.error(`yt-dlp Сервис стриминга: ${msg.trim()}`);
    }
  });

  req.on('close', () => {
    console.log(`[Stream] Клиент отключился. Убиваем процесс yt-dlp для видео: ${url}`);
    yt.kill('SIGKILL');
  });
}

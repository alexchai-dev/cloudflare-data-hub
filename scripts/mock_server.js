import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Импортируем наш обработчик Cloudflare Worker
import worker from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Имитируем окружение Cloudflare Workers и бакет R2 (считываем из локальной папки data/)
const env = {
  DATA_VAULT: {
    async get(key) {
      const filePath = path.join(__dirname, '../data', key);
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          return {
            body: fs.createReadStream(filePath),
            httpEtag: `"${stats.mtimeMs}"`,
            uploaded: stats.mtime
          };
        }
      } catch (err) {
        console.error("Ошибка чтения mock-файла R2:", err);
      }
      return null;
    }
  }
};

const server = http.createServer(async (req, res) => {
  const fullUrl = `http://${req.headers.host || 'localhost'}${req.url}`;
  
  // Конструируем объект Request (как во Workers)
  const method = req.method;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, value);
  }
  
  let body = null;
  if (method !== 'GET' && method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }
  
  const webRequest = new Request(fullUrl, {
    method,
    headers,
    body
  });
  
  try {
    // Вызываем fetch-обработчик Worker
    const webResponse = await worker.fetch(webRequest, env, {});
    
    // Переносим статус и заголовки в ответ Node.js
    res.statusCode = webResponse.status;
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Передаем тело ответа (поток)
    if (webResponse.body) {
      const reader = webResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error("Ошибка при выполнении worker fetch:", err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "Mock-сервер упал", details: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[Успех] Симулятор Cloudflare Worker запущен на http://localhost:${PORT}`);
  console.log(`Главная страница: http://localhost:${PORT}/`);
  console.log(`Тестовый эндпоинт: http://localhost:${PORT}/expat/rent-tbilisi`);
});

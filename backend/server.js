import express from 'express';
import cors from 'cors';
import { startXray } from './xrayManager.js';
import { searchYoutube, pipeVideoToClient } from './ytStreamer.js';

const app = express();
// Configure CORS to accept requests from any origin explicitly
app.use(cors({ origin: '*' }));
app.use(express.json());

// Current proxy status
let isProxyRunning = false;
let currentProxyPorts = null;

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    proxyRunning: isProxyRunning
  });
});

// Endpoint to start proxy
app.post('/api/proxy/start', async (req, res) => {
  try {
    currentProxyPorts = await startXray();
    isProxyRunning = true;
    res.json({
      success: true,
      message: 'Локальный прокси успешно запущен',
      ports: currentProxyPorts
    });
  } catch (error) {
    isProxyRunning = false;
    currentProxyPorts = null;
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint to search YouTube
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Параметр запроса "q" обязателен' });
  }

  if (!isProxyRunning) {
    return res.status(503).json({ error: 'Прокси Xray не запущен. Сначала отправьте VLESS конфигурацию.' });
  }

  try {
    const results = await searchYoutube(q);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to stream video file directly without disk usage
app.get('/api/stream', (req, res) => {
  const { v } = req.query;
  if (!v) {
    return res.status(400).json({ error: 'Параметр "v" (ID или URL видео) обязателен' });
  }

  if (!isProxyRunning) {
    return res.status(503).json({ error: 'Прокси Xray не запущен. Сначала отправьте VLESS конфигурацию.' });
  }

  pipeVideoToClient(req, res, v);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API запущен на порту ${PORT}`);
});

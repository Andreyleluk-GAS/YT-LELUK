"use client";

import { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import { getApiBaseUrl } from '../lib/api';

export default function Home() {
  const [vlessUri, setVlessUri] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vless_uri');
    if (saved) {
      setVlessUri(saved);
      connectProxy(saved);
    }
  }, []);

  const connectProxy = async (uri: string) => {
    setIsConnecting(true);
    setErrorText('');
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/proxy/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vlessUri: uri })
      });
      const data = await res.json();
      if (data.success) {
        setIsConnected(true);
        localStorage.setItem('vless_uri', uri);
      } else {
        setErrorText(data.error || 'Ошибка подключения');
        localStorage.removeItem('vless_uri');
      }
    } catch (e: any) {
      setErrorText('Не удалось соединиться с сервером');
    }
    setIsConnecting(false);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setErrorText('');
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setErrorText(data.error);
      }
    } catch (e: any) {
      setErrorText('Ошибка поиска. Возможно прокси недоступен.');
    }
    setIsSearching(false);
  };

  const playVideo = (id: string) => {
    setActiveVideo(`${getApiBaseUrl()}/api/stream?v=${id}`);
  };

  if (activeVideo) {
    return (
      <div className="container">
        <button className="btn-back" onClick={() => setActiveVideo(null)}>
          ⬅ Назад к результатам
        </button>
        <VideoPlayer src={activeVideo} />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container vless-screen">
        <h1 className="title">YouTube Прокси (VLESS)</h1>
        {errorText && <p style={{ color: 'var(--error)', fontSize: '1.4rem', textAlign: 'center', marginBottom: '20px' }}>{errorText}</p>}
        <input 
          className="input-huge"
          type="text" 
          placeholder="Вставьте ссылку VLESS://"
          value={vlessUri}
          onChange={(e) => setVlessUri(e.target.value)}
        />
        <button 
          className="btn-huge primary" 
          onClick={() => connectProxy(vlessUri)}
          disabled={isConnecting}
        >
          {isConnecting ? 'Соединяем...' : 'Запустить прокси'}
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="title" style={{ marginTop: '20px', marginBottom: '30px', fontSize: '2.5rem' }}>Поиск YouTube</h2>
      
      {errorText && <p style={{ color: 'var(--error)', fontSize: '1.4rem', marginBottom: '20px' }}>{errorText}</p>}
      
      <div className="search-box">
        <input 
          className="input-huge" 
          style={{ marginBottom: 0 }}
          placeholder="Поисковой запрос или ссылка..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button 
          className="btn-huge primary" 
          style={{ width: '150px' }} 
          onClick={handleSearch}
        >
          {isSearching ? '⏳' : '🔍 Искать'}
        </button>
      </div>

      <div className="search-results">
        {results.map((video: any) => (
          <div key={video.id} className="video-card" onClick={() => playVideo(video.id)}>
            <img src={video.thumbnail} alt={video.title} className="video-thumb" />
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <span className="video-meta">{video.uploader} • {video.duration}</span>
            </div>
          </div>
        ))}
        {results.length === 0 && !isSearching && searchQuery && !errorText && (
          <p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>Ничего не найдено</p>
        )}
      </div>
    </div>
  );
}

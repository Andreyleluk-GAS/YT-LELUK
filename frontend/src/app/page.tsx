"use client";

import { useState } from 'react';
import VideoPlayer from '../components/VideoPlayer';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setErrorText('');
    try {
      const res = await fetch(`${backendUrl}/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setErrorText(data.error);
      }
    } catch (e: any) {
      setErrorText('Ошибка поиска. Возможно сервер недоступен.');
    }
    setIsSearching(false);
  };

  const playVideo = (id: string) => {
    setActiveVideo(`${backendUrl}/api/stream?v=${id}`);
  };

  if (activeVideo) {
    return (
      <div className="container" style={{ padding: '0', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <button 
          className="btn-huge" 
          onClick={() => setActiveVideo(null)}
          style={{ width: '100%', margin: '0', borderRadius: '0', background: '#333', color: 'white', padding: '20px', fontSize: '2rem' }}
        >
          ⬅ Назад к результатам
        </button>
        <div style={{ flex: 1, backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <VideoPlayer src={activeVideo} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px' }}>
      <h2 className="title" style={{ marginTop: '10px', marginBottom: '30px', fontSize: '3rem', textAlign: 'center' }}>YouTube Поиск</h2>
      
      {errorText && <p style={{ color: 'var(--error)', fontSize: '1.8rem', textAlign: 'center', marginBottom: '20px' }}>{errorText}</p>}
      
      <div className="search-box" style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
        <input 
          className="input-huge" 
          style={{ flex: 1, padding: '25px', fontSize: '2rem', borderRadius: '12px', marginBottom: 0 }}
          placeholder="Поисковой запрос или ссылка..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button 
          className="btn-huge primary" 
          style={{ padding: '25px 40px', fontSize: '2rem', borderRadius: '12px', minWidth: '160px' }} 
          onClick={handleSearch}
        >
          {isSearching ? '⏳...' : '🔍 Искать'}
        </button>
      </div>

      <div className="search-results" style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr' }}>
        {results.map((video: any) => (
          <div 
            key={video.id} 
            className="video-card" 
            onClick={() => playVideo(video.id)}
            style={{ display: 'flex', gap: '20px', backgroundColor: '#222', padding: '15px', borderRadius: '15px', cursor: 'pointer', alignItems: 'center' }}
          >
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              style={{ width: '240px', height: '135px', objectFit: 'cover', borderRadius: '8px' }} 
            />
            <div className="video-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '10px', color: 'white', lineHeight: '1.3' }}>{video.title}</h3>
              <span style={{ fontSize: '1.5rem', color: '#aaa' }}>{video.uploader} • {video.duration}</span>
            </div>
          </div>
        ))}
        {results.length === 0 && !isSearching && searchQuery && !errorText && (
          <p style={{ textAlign: 'center', fontSize: '2rem', color: 'var(--text-secondary)', marginTop: '50px' }}>Ничего не найдено</p>
        )}
      </div>
    </div>
  );
}

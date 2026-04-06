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
    if (!searchQuery.trim()) return;
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
          onClick={() => setActiveVideo(null)}
          style={{ width: '100%', margin: '0', borderRadius: '0', background: '#333', color: 'white', padding: '15px', fontSize: '16px', border: 'none', cursor: 'pointer' }}
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
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginTop: '10px', marginBottom: '30px', fontSize: '24px', textAlign: 'center', color: 'white' }}>YouTube Поиск</h2>
      
      {errorText && <p style={{ color: '#ff4444', fontSize: '16px', textAlign: 'center', marginBottom: '20px' }}>{errorText}</p>}
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <input 
          style={{ width: '80%', maxWidth: '600px', backgroundColor: 'white', border: '2px solid black', color: 'black', padding: '10px 15px', fontSize: '16px', borderRadius: '4px', outline: 'none' }}
          placeholder="Введите название видео..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button 
          style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', fontSize: '16px', borderRadius: '4px', cursor: 'pointer' }} 
          onClick={handleSearch}
        >
          {isSearching ? '⏳...' : 'Искать'}
        </button>
      </div>

      <div className="search-results" style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr' }}>
        {results.map((video: any) => (
          <div 
            key={video.id} 
            className="video-card" 
            onClick={() => playVideo(video.id)}
            style={{ display: 'flex', gap: '15px', backgroundColor: '#222', padding: '10px', borderRadius: '8px', cursor: 'pointer', alignItems: 'center' }}
          >
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              style={{ width: '160px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} 
            />
            <div className="video-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '18px', margin: '0 0 5px 0', color: 'white', lineHeight: '1.3' }}>{video.title}</h3>
              <span style={{ fontSize: '14px', color: '#aaa' }}>{video.uploader} • {video.duration}</span>
            </div>
          </div>
        ))}
        {results.length === 0 && !isSearching && searchQuery && !errorText && (
          <p style={{ textAlign: 'center', fontSize: '16px', color: '#aaa', marginTop: '30px' }}>Ничего не найдено</p>
        )}
      </div>
    </div>
  );
}

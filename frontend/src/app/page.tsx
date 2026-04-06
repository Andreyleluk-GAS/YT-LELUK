"use client";

import React, { useState } from 'react';
import VideoPlayer from '../components/VideoPlayer';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setErrorText('');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setErrorText(data.error);
      }
    } catch (e: any) {
      setErrorText('Ошибка поиска. Сервер недоступен.');
    }
    setIsSearching(false);
  };

  const playVideo = (id: string) => {
    setActiveVideo(`/api/stream?v=${id}`);
  };

  if (activeVideo) {
    return (
      <div style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f0f0f' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #333' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.2rem', marginRight: '20px' }}>YT-Proxy</h1>
          <button 
            onClick={() => setActiveVideo(null)}
            style={{ backgroundColor: '#272727', color: 'white', padding: '8px 16px', borderRadius: '18px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ← Назад
          </button>
        </div>
        <div style={{ flex: 1, backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <VideoPlayer src={activeVideo} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      <style>{`
        body { margin: 0; background-color: #0f0f0f; }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        @media (max-width: 600px) {
          .grid-container { grid-template-columns: 1fr; }
        }
        .header {
          position: sticky;
          top: 0;
          background-color: #0f0f0f;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          height: 60px;
          box-sizing: border-box;
        }
        .header-logo {
          font-size: 1.2rem;
          font-weight: bold;
          white-space: nowrap;
        }
        .search-form {
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 600px;
          margin: 0 20px;
        }
        .search-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #303030;
          background-color: #121212;
          color: white;
          border-radius: 40px 0 0 40px;
          font-size: 1rem;
          outline: none;
        }
        .search-input:focus {
          border-color: #1c62b9;
        }
        .search-button {
          padding: 10px 20px;
          background-color: #222222;
          border: 1px solid #303030;
          border-left: none;
          border-radius: 0 40px 40px 0;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
        }
        .search-button:hover {
          background-color: #303030;
        }
        .video-card {
          cursor: pointer;
          border-radius: 12px;
          overflow: hidden;
          background-color: transparent;
          transition: transform 0.2s;
        }
        .video-card:hover {
          transform: scale(1.02);
        }
        .video-thumbnail {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          border-radius: 12px;
        }
        .video-info {
          padding: 10px 0;
        }
        .video-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }
        .video-meta {
          font-size: 0.9rem;
          color: #aaaaaa;
        }
        .spinner {
          border: 4px solid #333;
          border-top: 4px solid #fff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 40px auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      
      <header className="header">
        <div className="header-logo">YT-Proxy</div>
        <form className="search-form" onSubmit={handleSearch}>
          <input 
            className="search-input"
            placeholder="Введите запрос..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
        <div style={{ width: '80px' }}></div>
      </header>

      {errorText && <p style={{ color: '#ff4444', textAlign: 'center', marginTop: '20px' }}>{errorText}</p>}
      
      {isSearching ? (
        <div className="spinner"></div>
      ) : (
        <div className="grid-container">
          {results.map((video: any) => (
            <div key={video.id} className="video-card" onClick={() => playVideo(video.id)}>
              <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <span className="video-meta">{video.uploader} • {video.duration}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isSearching && searchQuery && !errorText && (
        <p style={{ textAlign: 'center', color: '#aaaaaa', marginTop: '40px' }}>Ничего не найдено</p>
      )}
    </div>
  );
}

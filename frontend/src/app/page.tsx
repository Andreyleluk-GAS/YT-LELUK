"use client";

import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from '../components/VideoPlayer';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<{ id: string, title?: string } | null>(null);
  const [errorText, setErrorText] = useState('');

  // Search History State
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('yt_search_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveHistory = (query: string) => {
    const fresh = query.trim();
    if (!fresh) return;
    const newHistory = [fresh, ...history.filter(h => h !== fresh)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('yt_search_history', JSON.stringify(newHistory));
  };

  const removeHistoryItem = (item: string) => {
    const newHistory = history.filter(h => h !== item);
    setHistory(newHistory);
    localStorage.setItem('yt_search_history', JSON.stringify(newHistory));
  };

  const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
    e?.preventDefault();
    const query = directQuery || searchQuery;
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setShowHistory(false);
    saveHistory(query);

    setIsSearching(true);
    setErrorText('');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
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

  const playVideo = (id: string, title: string) => {
    setActiveVideo({ id, title });
  };

  if (activeVideo) {
    return (
      <div style={{ height: '100vh', width: '100vw', backgroundColor: 'black' }}>
        <VideoPlayer 
          src={`/api/stream?v=${activeVideo.id}`} 
          title={activeVideo.title}
          onBack={() => setActiveVideo(null)} 
        />
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
        .search-container {
          position: relative;
          flex: 1;
          max-width: 600px;
          margin: 0 20px;
        }
        .search-form {
          display: flex;
          align-items: center;
          width: 100%;
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
        .history-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          margin-top: 5px;
          padding: 8px 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.5);
          z-index: 110;
        }
        .history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .history-item:hover {
          background-color: #2a2a2a;
        }
        .history-item-text {
          flex: 1;
        }
        .history-delete {
          color: #aaa;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .history-delete:hover {
          color: #ff4444;
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
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>YT-Proxy</div>
        
        <div className="search-container" ref={searchContainerRef}>
          <form className="search-form" onSubmit={handleSearch}>
            <input 
              className="search-input"
              placeholder="Введите запрос..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
          {showHistory && history.length > 0 && (
            <div className="history-dropdown">
              {history.map((h, i) => (
                <div key={i} className="history-item">
                  <div className="history-item-text" onClick={() => handleSearch(undefined, h)}>
                    <span style={{ marginRight: '10px', color: '#888' }}>🕒</span> {h}
                  </div>
                  <button className="history-delete" onClick={(e) => { e.stopPropagation(); removeHistoryItem(h); }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '80px' }}></div>
      </header>

      {errorText && <p style={{ color: '#ff4444', textAlign: 'center', marginTop: '20px' }}>{errorText}</p>}
      
      {isSearching ? (
        <div className="spinner"></div>
      ) : (
        <div className="grid-container">
          {results.map((video: any) => (
            <div key={video.id} className="video-card" onClick={() => playVideo(video.id, video.title)}>
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

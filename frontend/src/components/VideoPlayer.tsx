"use client";

import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onBack?: () => void;
}

export default function VideoPlayer({ src, title = "Видео", onBack }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error(e));
    }
  }, [src]);

  const togglePlay = () => {
    if (isLocked) return;
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const formatTime = (time: number) => {
    if (time === undefined || isNaN(time) || !isFinite(time)) return "--:--";
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cycleRate = () => {
    if (isLocked) return;
    const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    let next = rates.indexOf(playbackRate) + 1;
    if (next >= rates.length) next = 0;
    const r = rates[next];
    setPlaybackRate(r);
    if (videoRef.current) videoRef.current.playbackRate = r;
  };

  const containerStyle = isMinimized ? {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    width: '320px',
    height: '180px',
    zIndex: 2000,
    boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
    borderRadius: '12px',
    backgroundColor: 'black',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } : {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 2000,
    backgroundColor: 'black',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      
      {/* Minimized Restore Overlay */}
      {isMinimized && (
        <div onClick={() => setIsMinimized(false)} style={{ position: 'absolute', inset: 0, zIndex: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '5px', color: 'white', fontWeight: 'bold' }}>Развернуть</div>
          <button onClick={(e) => { e.stopPropagation(); onBack && onBack(); }} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', padding: '5px 8px', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Top Bar Overlay */}
      {!isMinimized && (
        <div style={{ opacity: isLocked ? 0 : 1, pointerEvents: isLocked ? 'none' : 'auto', transition: 'opacity 0.3s', position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '10px' }}>
            &lt; Выход
          </button>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{title}</span>
          <div>
            <button onClick={() => setIsMinimized(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer', marginRight: '15px' }}>
              ◰
            </button>
            <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
              ⋮
            </button>
          </div>
        </div>
      )}

      {/* Main Video */}
      <video 
        ref={videoRef} 
        src={src} 
        style={{ width: '100%', maxHeight: '100%' }} 
        controls={false}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        autoPlay
      />

      {/* Left Overlay - Lock Button is always clickable to unlock */}
      {!isMinimized && (
        <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7, zIndex: 20 }}>
          <button onClick={() => setIsLocked(!isLocked)} style={{ background: 'none', border: 'none', color: isLocked ? '#4ade80' : 'white', fontSize: '2rem', cursor: 'pointer' }}>
            {isLocked ? '🔒' : '🔓'}
          </button>
        </div>
      )}

      {/* Right Overlay */}
      {!isMinimized && (
        <div style={{ opacity: isLocked ? 0 : 0.7, pointerEvents: isLocked ? 'none' : 'auto', transition: 'opacity 0.3s', position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 10 }}>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer' }}>-</button>
          <button onClick={cycleRate} style={{ background: 'transparent', border: 'none', color: 'white', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', marginTop: '5px', cursor: 'pointer' }}>
            {playbackRate}x
          </button>
        </div>
      )}

      {/* Bottom Control Bar Overlay */}
      {!isMinimized && (
        <div style={{ opacity: isLocked ? 0 : 1, pointerEvents: isLocked ? 'none' : 'auto', transition: 'opacity 0.3s', position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,15,15,0.9)', padding: '15px 25px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Progress Bar Container */}
        <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            style={{ 
              width: '100%', 
              cursor: 'pointer',
              appearance: 'none',
              background: `linear-gradient(to right, #4ade80 ${(currentTime / (duration || 1)) * 100}%, #333 ${(currentTime / (duration || 1)) * 100}%)`,
              height: '6px',
              borderRadius: '3px',
              outline: 'none'
            }} 
            className="custom-range"
          />
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => skip(-10)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>
              &lt;&lt;
            </button>
            <button onClick={togglePlay} style={{ background: '#4ade80', border: '2px solid #4ade80', color: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', cursor: 'pointer' }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={() => skip(10)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>
              &gt;&gt;
            </button>
            <span style={{ color: 'white', fontFamily: 'sans-serif', fontSize: '1rem', marginLeft: '10px' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
            ☰
          </button>
        </div>
      </div>
      )}

      <style>{`
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #4ade80;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

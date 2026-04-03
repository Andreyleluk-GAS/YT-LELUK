"use client";

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        sources: [{
          src,
          type: 'video/mp4' // yt-dlp "best" is piped as mp4 chunked video
        }]
      });
    } else if (playerRef.current) {
      playerRef.current.src({ src, type: 'video/mp4' });
      playerRef.current.play();
    }
  }, [src]);

  useEffect(() => {
     return () => {
       if (playerRef.current && !playerRef.current.isDisposed()) {
         playerRef.current.dispose();
         playerRef.current = null;
       }
     };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
}

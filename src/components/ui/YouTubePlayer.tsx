'use client';

import React, { useState } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
}

/**
 * Custom YouTube player that shows thumbnail first
 * and only embeds video when user clicks play
 * This prevents unwanted redirects to YouTube
 */
export default function YouTubePlayer({ videoId, title = 'Video' }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (isPlaying) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className="aspect-video w-full rounded-lg overflow-hidden bg-black relative cursor-pointer group"
      onClick={() => setIsPlaying(true)}
    >
      {/* Thumbnail */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to lower quality thumbnail
          (e.target as HTMLImageElement).src = fallbackThumbnail;
        }}
      />
      
      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <button className="w-20 h-14 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
      
      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm font-medium truncate">{title}</p>
      </div>
    </div>
  );
}

"use client";

import { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  src: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function VideoPlayer({ src, onLoad, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleError = (e: Event) => {
      setIsLoading(false);
      setError("Failed to load video");
      onError?.(new Error("Video loading failed"));
    };

    video.addEventListener("loadeddata", handleLoad);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleLoad);
      video.removeEventListener("error", handleError);
    };
  }, [src, onLoad, onError]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">❌ {error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Loading video...</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-auto"
        controls
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        <p className="p-4 text-white bg-gray-900">
          Your browser doesn't support the video tag.
        </p>
      </video>
    </div>
  );
}

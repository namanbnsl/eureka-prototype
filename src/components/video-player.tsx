"use client";

import { useRef, useState } from "react";

interface VideoPlayerProps {
  src?: string;
  status: "generating" | "ready";
  description: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div
      className={"w-full rounded-lg border border-border bg-card text-card-foreground p-6 flex items-center justify-center"}
      style={{ aspectRatio: "16 / 9" }}
      aria-busy="true"
      aria-label="Video container generating"
    >
      <div className="mx-auto max-w-md text-center space-y-4">
        <h2 className="text-balance text-lg font-medium">Video generating. Please wait</h2>
        <p className="text-sm text-muted-foreground">This may take a moment.</p>

        {/* Loading bar (indeterminate) */}
        <div className="mt-4">
          <div
            className="h-2 w-full overflow-hidden rounded bg-muted"
            role="progressbar"
            aria-label="Generating video"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full w-1/3 rounded bg-primary animate-pulse" />
          </div>
        </div>

        {/* Screen reader live status */}
        <p className="sr-only" aria-live="polite" role="status">
          Video generating. Please wait
        </p>
      </div>
    </div>);
}

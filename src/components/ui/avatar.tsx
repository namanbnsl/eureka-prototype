import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string;
  alt: string;
  fallback?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300", className)}>
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" />
      ) : (
        <span className="text-xs font-medium">{fallback ?? alt.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}


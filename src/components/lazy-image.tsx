"use client";

import { useState, useRef, useEffect } from "react";

export function LazyImage({
  src,
  alt,
  className = "",
  fallbackChar,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackChar?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!src || error) {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-center bg-code-green/5 ${className}`}
      >
        <span className="text-3xl font-bold text-code-green/20">
          {fallbackChar || alt.charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-medium-gray/10" />
      )}
      {inView && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

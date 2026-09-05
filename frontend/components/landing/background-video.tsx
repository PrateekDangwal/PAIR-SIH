'use client';

import { useEffect, useState } from 'react';

export function BackgroundVideo() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-black/80" />
    );
  }

  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/pair-fallback.jpg"
      >
        <source src="/videos/pair-background.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />

      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-black opacity-70" />
    </>
  );
}

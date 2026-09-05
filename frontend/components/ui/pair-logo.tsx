'use client';

import { motion } from 'framer-motion';

type PairLogoProps = {
  size?: number;
  showWordmark?: boolean;
  animated?: boolean;
  className?: string;
};

export function PairLogo({ size = 40, showWordmark = true, animated = false, className = '' }: PairLogoProps) {
  const mark = (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PAIR logo"
      className="shrink-0"
      animate={animated ? { rotate: [0, 1.5, -1.5, 0] } : undefined}
      transition={animated ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <rect x="2" y="2" width="44" height="44" rx="13" fill="rgba(255,255,255,.025)" stroke="rgba(255,255,255,.12)"/>
      <path d="M24 8.5L28.7 18.8L39.5 19.9L31.4 27.2L33.8 38L24 32.3L14.2 38L16.6 27.2L8.5 19.9L19.3 18.8L24 8.5Z" stroke="#E8E8EB" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M24 15.5V32.2M16.1 21.5L31.9 21.5M18.2 29.5L29.8 18" stroke="rgba(255,255,255,.45)" strokeWidth="1"/>
      <circle cx="24" cy="24" r="3.2" fill="#0b0b0d" stroke="#F3F3F5" strokeWidth="1.6"/>
      <circle cx="24" cy="24" r="1" fill="#C7BFFF"/>
    </motion.svg>
  );
  if (!showWordmark) return <div className={className}>{mark}</div>;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {mark}
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-[0.16em] text-white">PAIR</div>
        <div className="mt-1 text-[8px] tracking-[0.16em] text-gray-600 uppercase">Procurement AI Review</div>
      </div>
    </div>
  );
}

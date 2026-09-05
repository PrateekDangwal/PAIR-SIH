'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NetworkNode {
  id: string;
  label: string;
  angle: number;
  radius: number;
  color: string;
  delay: number;
}

const NODES: NetworkNode[] = [
  { id: 'claude', label: 'Claude', angle: 0, radius: 180, color: 'from-red-500 to-red-600', delay: 0 },
  { id: 'gpt', label: 'GPT', angle: 51.4, radius: 180, color: 'from-green-500 to-green-600', delay: 0.1 },
  { id: 'gemini', label: 'Gemini', angle: 102.8, radius: 180, color: 'from-blue-500 to-blue-600', delay: 0.2 },
  { id: 'deepseek', label: 'DeepSeek', angle: 154.2, radius: 180, color: 'from-purple-500 to-purple-600', delay: 0.3 },
  { id: 'grok', label: 'Grok', angle: 205.6, radius: 180, color: 'from-yellow-500 to-yellow-600', delay: 0.4 },
  { id: 'code', label: 'Code', angle: 257, radius: 180, color: 'from-cyan-500 to-cyan-600', delay: 0.5 },
  { id: 'data', label: 'Data', angle: 308.4, radius: 180, color: 'from-indigo-500 to-indigo-600', delay: 0.6 },
];

const getNodePosition = (angle: number, radius: number) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
};

export function PAIRNetworkBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-purple-950/40 via-black to-black">
      {/* SVG Canvas for connections */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0.2)" />
          </linearGradient>

          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines from nodes to center */}
        {NODES.map((node) => {
          const pos = getNodePosition(node.angle, node.radius);
          const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
          const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

          return (
            <motion.line
              key={`line-${node.id}`}
              x1={centerX}
              y1={centerY}
              x2={centerX + pos.x}
              y2={centerY + pos.y}
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              opacity={prefersReducedMotion ? 0.3 : 0.5}
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: prefersReducedMotion ? 0.3 : 0.5 }}
              transition={{
                pathLength: { duration: 2, delay: node.delay },
                opacity: { duration: 1, delay: node.delay },
              }}
            />
          );
        })}

        {/* Flowing particles along connections */}
        {!prefersReducedMotion &&
          NODES.map((node) => {
            const pos = getNodePosition(node.angle, node.radius);
            const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
            const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

            return (
              <motion.circle
                key={`particle-${node.id}`}
                cx={centerX}
                cy={centerY}
                r="2"
                fill="rgba(168, 85, 247, 0.6)"
                filter="url(#particleGlow)"
                animate={{
                  cx: [centerX, centerX + pos.x * 0.3, centerX + pos.x * 0.6, centerX + pos.x],
                  cy: [centerY, centerY + pos.y * 0.3, centerY + pos.y * 0.6, centerY + pos.y],
                }}
                transition={{
                  duration: 3,
                  delay: node.delay + 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            );
          })}

        {/* Reverse flow - from nodes back to center */}
        {!prefersReducedMotion &&
          NODES.map((node) => {
            const pos = getNodePosition(node.angle, node.radius);
            const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
            const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

            return (
              <motion.circle
                key={`particle-return-${node.id}`}
                cx={centerX + pos.x}
                cy={centerY + pos.y}
                r="1.5"
                fill="rgba(59, 130, 246, 0.5)"
                filter="url(#particleGlow)"
                animate={{
                  cx: [centerX + pos.x, centerX + pos.x * 0.5, centerX],
                  cy: [centerY + pos.y, centerY + pos.y * 0.5, centerY],
                }}
                transition={{
                  duration: 3.5,
                  delay: node.delay + 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
      </svg>

      {/* Animated Node Elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {NODES.map((node) => {
          const pos = getNodePosition(node.angle, node.radius);

          return (
            <motion.div
              key={node.id}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: pos.x,
                y: pos.y,
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
              }}
            >
              <motion.div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${node.color} flex items-center justify-center text-white text-xs font-semibold shadow-lg`}
                style={{
                  marginLeft: '-24px',
                  marginTop: '-24px',
                }}
                animate={{
                  boxShadow: prefersReducedMotion
                    ? '0 0 0 0 rgba(168, 85, 247, 0)'
                    : [
                        '0 0 10px 0 rgba(168, 85, 247, 0.5)',
                        '0 0 20px 0 rgba(168, 85, 247, 0.8)',
                        '0 0 10px 0 rgba(168, 85, 247, 0.5)',
                      ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: node.delay,
                }}
              >
                <span className="text-center text-xs">{node.label.substring(0, 2)}</span>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Central PAIR Brain */}
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-center shadow-2xl flex-shrink-0"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-48px',
            marginTop: '-48px',
          }}
          animate={{
            scale: prefersReducedMotion ? 1 : [1, 1.05, 1],
            boxShadow: prefersReducedMotion
              ? '0 0 0 0 rgba(168, 85, 247, 0.5)'
              : [
                  '0 0 20px 0 rgba(168, 85, 247, 0.5)',
                  '0 0 50px 0 rgba(168, 85, 247, 0.8)',
                  '0 0 20px 0 rgba(168, 85, 247, 0.5)',
                ],
          }}
          transition={{
            scale: { duration: 2.5, repeat: Infinity },
            boxShadow: { duration: 2.5, repeat: Infinity },
          }}
        >
          <div className="text-sm font-bold">PAIR</div>
        </motion.div>
      </div>

      {/* Dark overlay to ensure readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/80" />
    </div>
  );
}

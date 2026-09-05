'use client';

import { ReactNode } from 'react';
import { PairIntro } from './pair-intro';

export function ExperienceShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PairIntro />
      {children}
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { mockProjects } from '@/lib/mock-data';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProjects(mockProjects);
    setIsLoading(false);
  }, []);

  return { projects, isLoading };
}

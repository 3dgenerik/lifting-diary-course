'use client';

import { trpc } from '@/utils/trpc';

/**
 * Hook to fetch all exercises
 */
export function useExercises() {
  return trpc.exercise.getAll.useQuery();
}

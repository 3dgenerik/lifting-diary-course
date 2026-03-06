'use client';

import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to add a set to a workout exercise
 */
export function useAddSet() {
  const queryClient = useQueryClient();

  return trpc.set.create.useMutation({
    onSettled: () => {
      // Invalidate workout queries to refetch with new set
      queryClient.invalidateQueries({ queryKey: [['workout', 'getById']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
    },
  });
}

/**
 * Hook to update a set
 */
export function useUpdateSet() {
  const queryClient = useQueryClient();

  return trpc.set.update.useMutation({
    onSettled: () => {
      // Invalidate workout queries to refetch
      queryClient.invalidateQueries({ queryKey: [['workout', 'getById']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
    },
  });
}

/**
 * Hook to delete a set
 */
export function useDeleteSet() {
  const queryClient = useQueryClient();

  return trpc.set.delete.useMutation({
    onSettled: () => {
      // Invalidate workout queries to refetch
      queryClient.invalidateQueries({ queryKey: [['workout', 'getById']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
    },
  });
}

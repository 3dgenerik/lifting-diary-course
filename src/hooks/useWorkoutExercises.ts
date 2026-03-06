'use client';

import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to add exercise to workout with optimistic updates
 */
export function useAddExerciseToWorkout() {
  const queryClient = useQueryClient();

  return trpc.workoutExercise.create.useMutation({
    onSettled: () => {
      // Invalidate workout queries to refetch with new exercise
      queryClient.invalidateQueries({ queryKey: [['workout', 'getById']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
    },
  });
}

/**
 * Hook to delete exercise from workout
 */
export function useDeleteWorkoutExercise() {
  const queryClient = useQueryClient();

  return trpc.workoutExercise.delete.useMutation({
    onSettled: () => {
      // Invalidate workout queries to refetch
      queryClient.invalidateQueries({ queryKey: [['workout', 'getById']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
    },
  });
}

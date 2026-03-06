'use client';

import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';
import type { AppRouter } from '@/server/routers/_app';
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;
type WorkoutWithRelations = RouterOutput['workout']['getAll'][number];

/**
 * Hook to fetch workouts for a specific date
 * @param date - ISO date string (e.g., "2026-03-03")
 */
export function useWorkoutsByDate(date: string) {
  return trpc.workout.getByDate.useQuery({ date });
}

/**
 * Hook to fetch all workouts for the current user
 */
export function useWorkouts() {
  return trpc.workout.getAll.useQuery();
}

/**
 * Hook to fetch a single workout by ID
 * @param id - Workout ID
 */
export function useWorkoutById(id: number) {
  return trpc.workout.getById.useQuery({ id });
}

/**
 * Hook to create a new workout with optimistic updates
 */
export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return trpc.workout.create.useMutation({
    onMutate: async (newWorkout) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [['workout', 'getAll']] });

      // Snapshot previous value
      const previousWorkouts = queryClient.getQueryData([['workout', 'getAll']]);

      // Optimistically update
      queryClient.setQueryData([['workout', 'getAll']], (old: WorkoutWithRelations[] = []) => [
        {
          ...newWorkout,
          id: -1, // temporary ID
          userId: 'temp',
          createdAt: new Date(),
          updatedAt: new Date(),
          workoutExercises: [],
        },
        ...old,
      ]);

      return { previousWorkouts };
    },

    onError: (err, newWorkout, context) => {
      // Rollback on error
      if (context?.previousWorkouts) {
        queryClient.setQueryData([['workout', 'getAll']], context.previousWorkouts);
      }
    },

    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
    },
  });
}

/**
 * Hook to update a workout with optimistic updates
 */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return trpc.workout.update.useMutation({
    onMutate: async (updatedWorkout) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [['workout', 'getAll']] });
      await queryClient.cancelQueries({ queryKey: [['workout', 'getById']] });

      // Snapshot previous values
      const previousWorkouts = queryClient.getQueryData([['workout', 'getAll']]);
      const previousWorkout = queryClient.getQueryData([['workout', 'getById'], { input: { id: updatedWorkout.id } }]);

      // Optimistically update in the list
      queryClient.setQueryData([['workout', 'getAll']], (old: WorkoutWithRelations[] = []) =>
        old.map((workout) =>
          workout.id === updatedWorkout.id
            ? { ...workout, ...updatedWorkout }
            : workout
        )
      );

      return { previousWorkouts, previousWorkout };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousWorkouts) {
        queryClient.setQueryData([['workout', 'getAll']], context.previousWorkouts);
      }
    },

    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getById']] });
    },
  });
}

/**
 * Hook to delete a workout with optimistic updates
 */
export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return trpc.workout.delete.useMutation({
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [['workout', 'getAll']] });

      // Snapshot previous value
      const previousWorkouts = queryClient.getQueryData([['workout', 'getAll']]);

      // Optimistically remove
      queryClient.setQueryData([['workout', 'getAll']], (old: WorkoutWithRelations[] = []) =>
        old.filter((workout) => workout.id !== id)
      );

      return { previousWorkouts };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousWorkouts) {
        queryClient.setQueryData([['workout', 'getAll']], context.previousWorkouts);
      }
    },

    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
    },
  });
}

/**
 * Hook to complete a workout
 */
export function useCompleteWorkout() {
  const queryClient = useQueryClient();

  return trpc.workout.complete.useMutation({
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: [['workout', 'getAll']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getByDate']] });
      queryClient.invalidateQueries({ queryKey: [['workout', 'getById']] });
    },
  });
}

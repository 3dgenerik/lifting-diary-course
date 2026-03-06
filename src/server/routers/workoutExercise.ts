import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/db';
import { workoutExercises, workouts } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const workoutExerciseRouter = router({
  // Add exercise to workout
  create: protectedProcedure
    .input(
      z.object({
        workoutId: z.number(),
        exerciseId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verify workout ownership
      const workout = await db.query.workouts.findFirst({
        where: and(eq(workouts.id, input.workoutId), eq(workouts.userId, userId)),
      });

      if (!workout) {
        throw new Error('Workout not found or unauthorized');
      }

      // Get the highest exerciseOrder for this workout
      const existingExercises = await db.query.workoutExercises.findMany({
        where: eq(workoutExercises.workoutId, input.workoutId),
        orderBy: [desc(workoutExercises.exerciseOrder)],
        limit: 1,
      });

      const nextOrder = existingExercises.length > 0 ? existingExercises[0].exerciseOrder + 1 : 1;

      // Create workout exercise
      const [newWorkoutExercise] = await db
        .insert(workoutExercises)
        .values({
          workoutId: input.workoutId,
          exerciseId: input.exerciseId,
          exerciseOrder: nextOrder,
        })
        .returning();

      return newWorkoutExercise;
    }),

  // Delete exercise from workout
  delete: protectedProcedure
    .input(z.object({ id: z.number(), workoutId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verify workout ownership
      const workout = await db.query.workouts.findFirst({
        where: and(eq(workouts.id, input.workoutId), eq(workouts.userId, userId)),
      });

      if (!workout) {
        throw new Error('Workout not found or unauthorized');
      }

      await db.delete(workoutExercises).where(eq(workoutExercises.id, input.id));

      return { success: true };
    }),
});

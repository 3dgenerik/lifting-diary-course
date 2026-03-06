import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/db';
import { sets, workoutExercises, workouts } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const setRouter = router({
  // Create a new set
  create: protectedProcedure
    .input(
      z.object({
        workoutExerciseId: z.number(),
        weight: z.string(), // numeric as string
        reps: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verify workout ownership through workoutExercise
      const workoutExercise = await db.query.workoutExercises.findFirst({
        where: eq(workoutExercises.id, input.workoutExerciseId),
        with: {
          workout: true,
        },
      });

      if (!workoutExercise || workoutExercise.workout.userId !== userId) {
        throw new Error('Workout exercise not found or unauthorized');
      }

      // Get the highest setOrder for this workout exercise
      const existingSets = await db.query.sets.findMany({
        where: eq(sets.workoutExerciseId, input.workoutExerciseId),
        orderBy: [desc(sets.setOrder)],
        limit: 1,
      });

      const nextOrder = existingSets.length > 0 ? existingSets[0].setOrder + 1 : 1;

      // Create set
      const [newSet] = await db
        .insert(sets)
        .values({
          workoutExerciseId: input.workoutExerciseId,
          setOrder: nextOrder,
          weight: input.weight,
          reps: input.reps,
        })
        .returning();

      return newSet;
    }),

  // Update a set
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        workoutExerciseId: z.number(),
        weight: z.string(),
        reps: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verify workout ownership
      const workoutExercise = await db.query.workoutExercises.findFirst({
        where: eq(workoutExercises.id, input.workoutExerciseId),
        with: {
          workout: true,
        },
      });

      if (!workoutExercise || workoutExercise.workout.userId !== userId) {
        throw new Error('Workout exercise not found or unauthorized');
      }

      const [updatedSet] = await db
        .update(sets)
        .set({
          weight: input.weight,
          reps: input.reps,
        })
        .where(eq(sets.id, input.id))
        .returning();

      return updatedSet;
    }),

  // Delete a set
  delete: protectedProcedure
    .input(z.object({ id: z.number(), workoutExerciseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verify workout ownership
      const workoutExercise = await db.query.workoutExercises.findFirst({
        where: eq(workoutExercises.id, input.workoutExerciseId),
        with: {
          workout: true,
        },
      });

      if (!workoutExercise || workoutExercise.workout.userId !== userId) {
        throw new Error('Workout exercise not found or unauthorized');
      }

      await db.delete(sets).where(eq(sets.id, input.id));

      return { success: true };
    }),
});

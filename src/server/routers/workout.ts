import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

export const workoutRouter = router({
  getByDate: protectedProcedure
    .input(
      z.object({
        date: z.string(), // ISO date string
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const date = new Date(input.date);

      // Set start and end of day for the selected date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch workouts for this user on the selected date with all related data
      const userWorkouts = await db.query.workouts.findMany({
        where: and(
          eq(workouts.userId, userId),
          gte(workouts.startedAt, startOfDay),
          lte(workouts.startedAt, endOfDay)
        ),
        orderBy: [desc(workouts.createdAt)],
        with: {
          workoutExercises: {
            orderBy: [asc(workoutExercises.exerciseOrder)],
            with: {
              exercise: true,
              sets: {
                orderBy: [asc(sets.setOrder)],
              },
            },
          },
        },
      });

      return userWorkouts;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const userWorkouts = await db.query.workouts.findMany({
      where: eq(workouts.userId, userId),
      orderBy: [desc(workouts.createdAt)],
      with: {
        workoutExercises: {
          orderBy: [asc(workoutExercises.exerciseOrder)],
          with: {
            exercise: true,
            sets: {
              orderBy: [asc(sets.setOrder)],
            },
          },
        },
      },
    });

    return userWorkouts;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        startedAt: z.date(),
        completedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const [newWorkout] = await db
        .insert(workouts)
        .values({
          userId,
          name: input.name,
          startedAt: input.startedAt,
          completedAt: input.completedAt,
        })
        .returning();

      return newWorkout;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verify ownership before deleting
      const workout = await db.query.workouts.findFirst({
        where: and(eq(workouts.id, input.id), eq(workouts.userId, userId)),
      });

      if (!workout) {
        throw new Error('Workout not found or unauthorized');
      }

      await db.delete(workouts).where(eq(workouts.id, input.id));

      return { success: true };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      const workout = await db.query.workouts.findFirst({
        where: and(eq(workouts.id, input.id), eq(workouts.userId, userId)),
        with: {
          workoutExercises: {
            orderBy: [asc(workoutExercises.exerciseOrder)],
            with: {
              exercise: true,
              sets: {
                orderBy: [asc(sets.setOrder)],
              },
            },
          },
        },
      });

      return workout;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        startedAt: z.date(),
        completedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verify ownership before updating
      const workout = await db.query.workouts.findFirst({
        where: and(eq(workouts.id, input.id), eq(workouts.userId, userId)),
      });

      if (!workout) {
        throw new Error('Workout not found or unauthorized');
      }

      const [updatedWorkout] = await db
        .update(workouts)
        .set({
          name: input.name,
          startedAt: input.startedAt,
          completedAt: input.completedAt,
        })
        .where(eq(workouts.id, input.id))
        .returning();

      return updatedWorkout;
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verify ownership before updating
      const workout = await db.query.workouts.findFirst({
        where: and(eq(workouts.id, input.id), eq(workouts.userId, userId)),
      });

      if (!workout) {
        throw new Error('Workout not found or unauthorized');
      }

      const [completedWorkout] = await db
        .update(workouts)
        .set({
          completedAt: new Date(),
        })
        .where(eq(workouts.id, input.id))
        .returning();

      return completedWorkout;
    }),
});

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/db';
import { exercises } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const exerciseRouter = router({
  // Get all exercises (shared library)
  getAll: protectedProcedure.query(async () => {
    const allExercises = await db.query.exercises.findMany({
      orderBy: [asc(exercises.name)],
    });

    return allExercises;
  }),
});

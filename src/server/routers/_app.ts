import { router } from '../trpc';
import { workoutRouter } from './workout';

export const appRouter = router({
  workout: workoutRouter,
});

export type AppRouter = typeof appRouter;

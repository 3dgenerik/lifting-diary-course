import { router } from '../trpc';
import { workoutRouter } from './workout';
import { exerciseRouter } from './exercise';
import { workoutExerciseRouter } from './workoutExercise';
import { setRouter } from './set';

export const appRouter = router({
  workout: workoutRouter,
  exercise: exerciseRouter,
  workoutExercise: workoutExerciseRouter,
  set: setRouter,
});

export type AppRouter = typeof appRouter;

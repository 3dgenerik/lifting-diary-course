import { pgTable, text, integer, timestamp, numeric, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Workouts table - top-level workout sessions
export const workouts = pgTable('workouts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  adress: text('name').notNull(),
  city: text('name').notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('workouts_user_id_idx').on(table.userId),
    index('workouts_created_at_idx').on(table.createdAt),
]);

// Exercises table - shared library of exercises
export const exercises = pgTable('exercises', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull().unique(),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('exercises_category_idx').on(table.category),
]);

// Workout Exercises bridge table - links workouts to exercises
export const workoutExercises = pgTable('workout_exercises', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'restrict' }),
  exerciseOrder: integer('exercise_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('workout_exercises_workout_id_idx').on(table.workoutId),
  index('workout_exercises_exercise_id_idx').on(table.exerciseId),
  index('workout_exercises_workout_order_idx').on(table.workoutId, table.exerciseOrder),
]);

// Sets table - individual sets within a workout exercise
export const sets = pgTable('sets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setOrder: integer('set_order').notNull(),
  weight: numeric('weight', { precision: 10, scale: 2 }).notNull(),
  reps: integer('reps').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('sets_workout_exercise_id_idx').on(table.workoutExerciseId),
  index('sets_workout_exercise_order_idx').on(table.workoutExerciseId, table.setOrder),
]);

// Drizzle relations for type-safe queries
export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

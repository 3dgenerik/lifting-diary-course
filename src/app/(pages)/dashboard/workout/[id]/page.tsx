'use client';

import { useState } from 'react';
import { Plus, ArrowLeft, CheckCircle, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useWorkoutById, useUpdateWorkout, useCompleteWorkout } from '@/hooks/useWorkouts';
import { AddExerciseModal } from '@/components/add-exercise-modal';
import { WorkoutExerciseItem } from '@/components/workout-exercise-item';

const workoutNameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type WorkoutNameValues = z.infer<typeof workoutNameSchema>;

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = Number(params.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: workout, isLoading, error } = useWorkoutById(workoutId);
  const updateWorkout = useUpdateWorkout();
  const completeWorkout = useCompleteWorkout();

  const form = useForm<WorkoutNameValues>({
    resolver: zodResolver(workoutNameSchema),
    defaultValues: {
      name: workout?.name || '',
    },
  });

  // Update form when workout data loads
  if (workout && form.getValues().name === '' && workout.name) {
    form.reset({ name: workout.name });
  }

  const onSubmit = async (data: WorkoutNameValues) => {
    if (!workout || !workout.startedAt) return;

    try {
      await updateWorkout.mutateAsync({
        id: workoutId,
        name: data.name,
        startedAt: new Date(workout.startedAt),
        completedAt: workout.completedAt ? new Date(workout.completedAt) : undefined,
      });
    } catch (error) {
      console.error('Failed to update workout:', error);
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      await completeWorkout.mutateAsync({ id: workoutId });
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  };

  const handleBackToDashboard = () => {
    if (workout?.startedAt) {
      const dateParam = format(new Date(workout.startedAt), 'yyyy-MM-dd');
      router.push(`/dashboard?date=${dateParam}`);
    } else {
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Workout Not Found</h1>
          <p className="text-red-500 mt-2">
            Workout not found or you don't have permission to view it.
          </p>
          <Button onClick={handleBackToDashboard} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = !!workout.completedAt;
  const formattedStartDate = workout.startedAt
    ? format(new Date(workout.startedAt), "do MMM yyyy 'at' HH:mm")
    : 'Not started';

  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Header with back button and complete button */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={handleBackToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        {!isCompleted && (
          <Button
            onClick={handleCompleteWorkout}
            disabled={completeWorkout.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {completeWorkout.isPending ? 'Completing...' : 'Complete Workout'}
          </Button>
        )}
      </div>

      {/* Workout name and status */}
      <Card className="p-6 mb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workout name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-semibold">Started:</span> {formattedStartDate}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Status:</span>{' '}
                {isCompleted ? (
                  <span className="text-green-600 dark:text-green-400">
                    Completed on {format(new Date(workout.completedAt!), "do MMM yyyy 'at' HH:mm")}
                  </span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400">In Progress</span>
                )}
              </div>
            </div>

            <Button type="submit" disabled={updateWorkout.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateWorkout.isPending ? 'Saving...' : 'Save Name'}
            </Button>
          </form>
        </Form>
      </Card>

      {/* Add Exercise Button */}
      <div className="mb-6">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="w-full h-18 text-lg"
        >
          <Plus className="h-6 w-6 mr-2" />
          Add Exercise
        </Button>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {workout.workoutExercises.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-center">
              No exercises added yet. Click "Add Exercise" to get started.
            </p>
          </Card>
        ) : (
          workout.workoutExercises.map((workoutExercise) => (
            <WorkoutExerciseItem
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
              workoutId={workoutId}
            />
          ))
        )}
      </div>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        workoutId={workoutId}
      />
    </div>
  );
}

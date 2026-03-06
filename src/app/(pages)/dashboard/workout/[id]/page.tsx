'use client';

import { useParams, useRouter } from 'next/navigation';
import { WorkoutForm } from '@/components/workout-form';
import { Card } from '@/components/ui/card';
import { useWorkoutById } from '@/hooks/useWorkouts';

export default function EditWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = Number(params.id);

  const { data: workout, isLoading, error } = useWorkoutById(workoutId);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Workout</h1>
          <p className="text-muted-foreground mt-2">Loading workout data...</p>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Workout</h1>
          <p className="text-red-500 mt-2">
            Workout not found or you don't have permission to edit it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Workout</h1>
        <p className="text-muted-foreground mt-2">
          Update your workout details
        </p>
      </div>

      <Card className="p-6">
        <WorkoutForm
          mode="edit"
          workoutId={workoutId}
          initialValues={{
            name: workout.name,
            startedAt: new Date(workout.startedAt),
          }}
        />
      </Card>
    </div>
  );
}

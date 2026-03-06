import { auth } from '@clerk/nextjs/server';
import { WorkoutForm } from '@/components/workout-form';
import { Card } from '@/components/ui/card';

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Workout</h1>
        <p className="text-muted-foreground mt-2">
          Start tracking your fitness journey by creating a new workout session
        </p>
      </div>

      <Card className="p-6">
        <WorkoutForm />
      </Card>
    </div>
  );
}

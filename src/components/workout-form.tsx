'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateWorkout } from '@/hooks/useWorkouts';

const workoutFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startedAt: z.string().min(1, 'Start time is required'),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

export function WorkoutForm() {
  const router = useRouter();
  const createWorkout = useCreateWorkout();

  // Format current date and time for datetime-local input (YYYY-MM-DDTHH:mm)
  const now = new Date();
  const defaultDateTime = format(now, "yyyy-MM-dd'T'HH:mm");

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: '',
      startedAt: defaultDateTime,
    },
  });

  const onSubmit = async (data: WorkoutFormValues) => {
    try {
      await createWorkout.mutateAsync({
        name: data.name,
        startedAt: new Date(data.startedAt),
      });

      // Navigate back to the dashboard after successful creation
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create workout:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <FormField
          control={form.control}
          name="startedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                When did you start this workout?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createWorkout.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createWorkout.isPending}>
            {createWorkout.isPending ? 'Creating...' : 'Create Workout'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

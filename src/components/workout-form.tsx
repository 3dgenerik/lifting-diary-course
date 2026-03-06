'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useCreateWorkout, useUpdateWorkout } from '@/hooks/useWorkouts';

const workoutFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startedAt: z.string().min(1, 'Start time is required'),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

interface WorkoutFormProps {
  mode?: 'create' | 'edit';
  workoutId?: number;
  initialValues?: {
    name: string;
    startedAt: Date;
  };
}

export function WorkoutForm({
  mode = 'create',
  workoutId,
  initialValues
}: WorkoutFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();

  // Get date from URL parameter if available (only for create mode), otherwise use current date
  const dateParam = searchParams.get('date');
  const now = new Date();

  // If date param exists, use that date but with current time
  // Otherwise just use current date and time
  let dateTimeToUse: Date;
  if (dateParam && mode === 'create') {
    // Parse date in local timezone (format: YYYY-MM-DD)
    const [year, month, day] = dateParam.split('-').map(Number);
    // Create new date with selected date but current time (month is 0-indexed)
    dateTimeToUse = new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes()
    );
  } else {
    dateTimeToUse = now;
  }

  // Determine default values based on mode
  let defaultDateTime: string;
  let defaultName: string;

  if (mode === 'edit' && initialValues) {
    defaultDateTime = format(initialValues.startedAt, "yyyy-MM-dd'T'HH:mm");
    defaultName = initialValues.name;
  } else {
    defaultDateTime = format(dateTimeToUse, "yyyy-MM-dd'T'HH:mm");
    defaultName = '';
  }

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: defaultName,
      startedAt: defaultDateTime,
    },
  });

  const onSubmit = async (data: WorkoutFormValues) => {
    try {
      if (mode === 'edit' && workoutId) {
        await updateWorkout.mutateAsync({
          id: workoutId,
          name: data.name,
          startedAt: new Date(data.startedAt),
        });
      } else {
        await createWorkout.mutateAsync({
          name: data.name,
          startedAt: new Date(data.startedAt),
        });
      }

      // Navigate back to the dashboard with the workout date
      const workoutDate = format(new Date(data.startedAt), 'yyyy-MM-dd');
      router.push(`/dashboard?date=${workoutDate}`);
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const isSubmitting = createWorkout.isPending || updateWorkout.isPending;

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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (mode === 'edit' ? 'Updating...' : 'Creating...')
              : (mode === 'edit' ? 'Update Workout' : 'Create Workout')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useUpdateSet } from '@/hooks/useSets';

const editSetSchema = z.object({
  weight: z.string().min(1, 'Weight is required'),
  reps: z.string().min(1, 'Reps is required'),
});

type EditSetValues = z.infer<typeof editSetSchema>;

interface EditSetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: {
    id: number;
    weight: string;
    reps: number;
    setOrder: number;
  } | null;
  workoutExerciseId: number;
}

export function EditSetModal({
  open,
  onOpenChange,
  set,
  workoutExerciseId,
}: EditSetModalProps) {
  const updateSet = useUpdateSet();

  const form = useForm<EditSetValues>({
    resolver: zodResolver(editSetSchema),
    defaultValues: {
      weight: set?.weight || '',
      reps: set?.reps.toString() || '',
    },
  });

  // Update form when set changes
  useEffect(() => {
    if (set) {
      form.reset({
        weight: set.weight,
        reps: set.reps.toString(),
      });
    }
  }, [set, form]);

  const onSubmit = async (data: EditSetValues) => {
    if (!set) return;

    try {
      await updateSet.mutateAsync({
        id: set.id,
        workoutExerciseId,
        weight: data.weight,
        reps: Number(data.reps),
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update set:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Set {set?.setOrder}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reps</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateSet.isPending}>
                {updateSet.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

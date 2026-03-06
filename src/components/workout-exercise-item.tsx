'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useAddSet, useDeleteSet } from '@/hooks/useSets';
import { useDeleteWorkoutExercise } from '@/hooks/useWorkoutExercises';
import { EditSetModal } from '@/components/edit-set-modal';

const setFormSchema = z.object({
  weight: z.string().min(1, 'Weight is required'),
  reps: z.string().min(1, 'Reps is required'),
});

type SetFormValues = z.infer<typeof setFormSchema>;

interface WorkoutExerciseItemProps {
  workoutExercise: {
    id: number;
    exerciseOrder: number;
    exercise: {
      id: number;
      name: string;
      category: string | null;
    };
    sets: Array<{
      id: number;
      setOrder: number;
      weight: string;
      reps: number;
    }>;
  };
  workoutId: number;
}

export function WorkoutExerciseItem({
  workoutExercise,
  workoutId,
}: WorkoutExerciseItemProps) {
  const [editingSet, setEditingSet] = useState<{
    id: number;
    weight: string;
    reps: number;
    setOrder: number;
  } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const addSet = useAddSet();
  const deleteSet = useDeleteSet();
  const deleteWorkoutExercise = useDeleteWorkoutExercise();

  const form = useForm<SetFormValues>({
    resolver: zodResolver(setFormSchema),
    defaultValues: {
      weight: '',
      reps: '',
    },
  });

  const onSubmit = async (data: SetFormValues) => {
    try {
      await addSet.mutateAsync({
        workoutExerciseId: workoutExercise.id,
        weight: data.weight,
        reps: Number(data.reps),
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Failed to add set:', error);
    }
  };

  const handleEditSet = (set: {
    id: number;
    weight: string;
    reps: number;
    setOrder: number;
  }) => {
    setEditingSet(set);
    setIsEditModalOpen(true);
  };

  const handleDeleteSet = async (setId: number) => {
    try {
      await deleteSet.mutateAsync({
        id: setId,
        workoutExerciseId: workoutExercise.id,
      });
    } catch (error) {
      console.error('Failed to delete set:', error);
    }
  };

  const handleDeleteExercise = async () => {
    if (!confirm('Are you sure you want to remove this exercise?')) return;

    try {
      await deleteWorkoutExercise.mutateAsync({
        id: workoutExercise.id,
        workoutId,
      });
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{workoutExercise.exercise.name}</h3>
          {workoutExercise.exercise.category && (
            <p className="text-sm text-muted-foreground">
              {workoutExercise.exercise.category}
            </p>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteExercise}
          disabled={deleteWorkoutExercise.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </div>

      {/* Display existing sets */}
      {workoutExercise.sets.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="grid grid-cols-[80px_1fr_1fr_200px] gap-2 font-semibold text-sm text-muted-foreground mb-2">
            <div>Set</div>
            <div>Weight (kg)</div>
            <div>Reps</div>
            <div>Actions</div>
          </div>
          {workoutExercise.sets.map((set) => (
            <div key={set.id} className="grid grid-cols-[80px_1fr_1fr_200px] gap-2 items-center">
              <div>{set.setOrder}</div>
              <div>{set.weight}</div>
              <div>{set.reps}</div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditSet(set)}
                  disabled={deleteSet.isPending}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSet(set.id)}
                  disabled={deleteSet.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add set form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-[80px_1fr_1fr_200px] gap-2 items-end">
            <div className="text-sm font-medium pb-2">
              Set {workoutExercise.sets.length + 1}
            </div>

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Weight (kg)"
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
                  <FormControl>
                    <Input type="number" placeholder="Reps" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={addSet.isPending} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {addSet.isPending ? 'Adding...' : 'Add Set'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Edit Set Modal */}
      <EditSetModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        set={editingSet}
        workoutExerciseId={workoutExercise.id}
      />
    </Card>
  );
}

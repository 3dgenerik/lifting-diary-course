'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useExercises } from '@/hooks/useExercises';
import { useAddExerciseToWorkout } from '@/hooks/useWorkoutExercises';

interface AddExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: number;
}

export function AddExerciseModal({
  open,
  onOpenChange,
  workoutId,
}: AddExerciseModalProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const { data: exercises, isLoading } = useExercises();
  const addExercise = useAddExerciseToWorkout();

  const handleAdd = async () => {
    if (!selectedExerciseId) return;

    try {
      await addExercise.mutateAsync({
        workoutId,
        exerciseId: Number(selectedExerciseId),
      });

      // Reset and close
      setSelectedExerciseId('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  };

  const handleCancel = () => {
    setSelectedExerciseId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedExerciseId}
            onValueChange={setSelectedExerciseId}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises?.map((exercise) => (
                <SelectItem key={exercise.id} value={String(exercise.id)}>
                  {exercise.name}
                  {exercise.category && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({exercise.category})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedExerciseId || addExercise.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            {addExercise.isPending ? 'Adding...' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

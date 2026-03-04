"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeader } from "@/components/ui/section-header"
import { useWorkoutsByDate } from "@/hooks/useWorkouts"

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Fetch workouts for the selected date
  const { data: workouts = [], isLoading, error } = useWorkoutsByDate(
    selectedDate.toISOString()
  )

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Workout Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Picker Section */}
        <div className="lg:col-span-1">
          <SectionHeader
            title="Select Date"
            subtitle={format(selectedDate, "do MMM yyyy")}
          />
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>

        {/* Workouts List Section */}
        <div className="lg:col-span-2">
          <SectionHeader
            title={`Workouts for ${format(selectedDate, "do MMM yyyy")}`}
            subtitle={
              isLoading
                ? "Loading..."
                : `${workouts.length} workout${workouts.length !== 1 ? "s" : ""} logged`
            }
          />

          <div className="space-y-4">
            {error ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-red-500">
                    Error loading workouts. Please try again.
                  </p>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading workouts...</p>
                </CardContent>
              </Card>
            ) : workouts.length > 0 ? (
              workouts.map((workout) => {
                // Calculate workout duration if available
                const duration =
                  workout.startedAt && workout.completedAt
                    ? Math.round(
                        (new Date(workout.completedAt).getTime() -
                          new Date(workout.startedAt).getTime()) /
                          (1000 * 60)
                      )
                    : null;

                const completedTime = workout.completedAt
                  ? format(new Date(workout.completedAt), "h:mm a")
                  : null;

                return (
                  <Card key={workout.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{workout.name}</CardTitle>
                          <CardDescription>
                            {completedTime && `Completed at ${completedTime}`}
                            {duration && ` • Duration: ${duration}m`}
                            {!completedTime && !duration && "Workout logged"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {workout.workoutExercises.map((workoutExercise) => {
                          const totalSets = workoutExercise.sets.length;

                          // Calculate average reps and weight
                          const avgReps = totalSets > 0
                            ? Math.round(
                                workoutExercise.sets.reduce(
                                  (sum, set) => sum + set.reps,
                                  0
                                ) / totalSets
                              )
                            : 0;

                          const avgWeight = totalSets > 0
                            ? workoutExercise.sets.reduce(
                                (sum, set) => sum + Number(set.weight),
                                0
                              ) / totalSets
                            : 0;

                          return (
                            <div
                              key={workoutExercise.id}
                              className="flex justify-between items-center p-3 bg-muted rounded-lg"
                            >
                              <span className="font-medium">
                                {workoutExercise.exercise.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {totalSets} set{totalSets !== 1 ? "s" : ""} × {avgReps} reps
                                {avgWeight > 0 && ` @ ${avgWeight.toFixed(1)}kg`}
                              </span>
                            </div>
                          );
                        })}
                        {workout.workoutExercises.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No exercises logged
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No workouts logged for this date
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

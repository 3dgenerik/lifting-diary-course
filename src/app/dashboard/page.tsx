"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeader } from "@/components/ui/section-header"

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: 1,
    name: "Morning Strength Training",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 80 },
      { name: "Squats", sets: 4, reps: 10, weight: 100 },
      { name: "Deadlifts", sets: 3, reps: 6, weight: 120 },
    ],
    duration: "1h 15m",
    completedAt: "09:30 AM",
  },
  {
    id: 2,
    name: "Evening Cardio",
    exercises: [
      { name: "Running", sets: 1, reps: 1, weight: 0 },
      { name: "Cycling", sets: 1, reps: 1, weight: 0 },
    ],
    duration: "45m",
    completedAt: "06:00 PM",
  },
]

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

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
            subtitle={`${mockWorkouts.length} workout${mockWorkouts.length !== 1 ? "s" : ""} logged`}
          />

          <div className="space-y-4">
            {mockWorkouts.length > 0 ? (
              mockWorkouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{workout.name}</CardTitle>
                        <CardDescription>
                          Completed at {workout.completedAt} • Duration: {workout.duration}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workout.exercises.map((exercise, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-muted rounded-lg"
                        >
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
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

---
name: workout-chart
description: Generate a bar chart visualization showing workout frequency by month for the past year. Use this skill when the user wants to visualize workout data, see workout trends, analyze training frequency, generate workout statistics charts, or create any visualization of their workout history over time.
---

# Workout Chart Generator

This skill queries the database for all workout entries from the past year and generates a bar chart visualization showing the number of workouts completed per month.

## What it does

1. Loads the database connection string from the `.env` file
2. Connects to the PostgreSQL database using the workouts schema
3. Queries all workouts from the past 12 months
4. Aggregates workout count by month
5. Generates a bar chart with:
   - X-axis: Months (formatted as "MMM YYYY")
   - Y-axis: Number of workouts
6. Exports the chart as a PNG image file

## Usage

When invoked, this skill will:
- Execute the Python script `scripts/generate_workout_chart.py`
- Create a file called `workout_frequency_chart.png` in the project root
- Display information about the chart generation process

## Requirements

The script requires the following Python packages:
- `psycopg2-binary` - PostgreSQL database adapter
- `matplotlib` - Plotting library
- `python-dotenv` - Load environment variables from .env file
- `pandas` - Data manipulation

Install with:
```bash
pip install psycopg2-binary matplotlib python-dotenv pandas
```

## Output

The skill generates a PNG file named `workout_frequency_chart.png` showing:
- Bar chart with monthly workout counts
- Title: "Workout Frequency - Past 12 Months"
- Properly formatted month labels
- Grid lines for easier reading
- Auto-sized figure for optimal display

## Instructions

When this skill is triggered:

1. Check if required Python packages are installed. If not, inform the user and ask if they want to install them.

2. Execute the Python script:
   ```bash
   python .claude/skills/workout-chart/scripts/generate_workout_chart.py
   ```

3. After successful execution, inform the user:
   - Where the chart was saved
   - How many workouts were found
   - The date range of the data

4. If there are any errors (database connection, no data, etc.), explain them clearly to the user.

## Database Schema

This skill queries the `workouts` table which has the following relevant columns:
- `id`: Workout identifier
- `userId`: User who created the workout
- `createdAt`: Timestamp when the workout was created
- `completedAt`: Timestamp when the workout was completed (may be null)

The query counts workouts grouped by month based on the `createdAt` timestamp.

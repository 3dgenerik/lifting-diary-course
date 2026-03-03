# Workout Chart Generator Skill

This skill generates a bar chart visualization of workout frequency over the past 12 months.

## What it does

- Queries your PostgreSQL database for all workouts from the past year
- Groups workouts by month
- Creates a professional bar chart showing workout frequency
- Exports the chart as a high-resolution PNG image

## Installation

Install the required Python dependencies:

```bash
pip install psycopg2-binary matplotlib python-dotenv pandas
```

## Usage

### Via Claude Code

Simply ask Claude to generate a workout chart:
- "Generate a workout frequency chart"
- "Show me my workout trends"
- "Create a visualization of my workouts"
- "Plot my workout data"

### Manual execution

You can also run the script directly:

```bash
python .claude/skills/workout-chart/scripts/generate_workout_chart.py
```

## Output

The script creates a file named `workout_frequency_chart.png` in your project root directory with:

- **X-axis**: Months (formatted as "MMM YYYY", e.g., "Jan 2025")
- **Y-axis**: Number of workouts
- **Chart style**: Professional bar chart with value labels
- **Resolution**: 300 DPI (high quality)

## Requirements

- PostgreSQL database with workouts table
- `DATABASE_URL` environment variable in `.env` file
- Python 3.7 or higher
- Required Python packages (see Installation)

## Database Schema

The skill queries the `workouts` table:
- `created_at`: Used to determine when the workout was logged
- Counts all workouts grouped by month

## Error Handling

The script handles:
- Missing dependencies (prompts to install)
- Database connection errors
- Missing .env file
- No workout data (creates a chart with a message)

## Example Output

After running, you'll see:
```
Generating workout frequency chart...
--------------------------------------------------
✓ Loaded database configuration
✓ Querying workouts from the past 12 months...
✓ Found 8 months with workout data
✓ Creating chart...
Chart saved to: /path/to/project/workout_frequency_chart.png

Statistics:
  Total workouts: 42
  Average per month: 5.2
  Months with data: 8
--------------------------------------------------
✓ Chart generation complete!
```

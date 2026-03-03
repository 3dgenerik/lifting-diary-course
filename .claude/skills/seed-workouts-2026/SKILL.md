---
name: seed-workouts-2026
description: Add 3 test workout records for user user_3A9t2acgrY0pYyrTyOkqDQKHBUQ in year 2026 with different months using Neon database. Use this skill when the user wants to seed workout data, add sample workouts, populate workout table with test data, or add dummy workout records for 2026.
---

# Seed Workouts 2026

This skill adds 3 test workout records to the database for user `user_3A9t2acgrY0pYyrTyOkqDQKHBUQ` with dates spread across different months in 2026.

## When to Use

Use this skill when the user asks to:
- Add test workouts for 2026
- Seed workout data
- Populate the workouts table with sample data
- Add dummy workout records
- Create sample workouts for testing

## How It Works

The skill uses the Neon MCP `run_sql_transaction` tool to insert 3 workout records in a single transaction. Each workout has:
- A unique user ID: `user_3A9t2acgrY0pYyrTyOkqDQKHBUQ`
- A descriptive name (e.g., "Upper Body Workout", "Leg Day", "Full Body Session")
- A `created_at` timestamp in different months of 2026 (e.g., January, May, September)

## Steps

1. **Get the project ID**: First, list available Neon projects using `list_projects` to find the correct project ID for the lifting diary database.

2. **Insert workout records**: Use the `run_sql_transaction` tool with the project ID to insert 3 workout records:

```sql
INSERT INTO workouts (user_id, name, created_at) VALUES
  ('user_3A9t2acgrY0pYyrTyOkqDQKHBUQ', 'Upper Body Workout', '2026-01-15 10:30:00'),
  ('user_3A9t2acgrY0pYyrTyOkqDQKHBUQ', 'Leg Day', '2026-05-22 14:15:00'),
  ('user_3A9t2acgrY0pYyrTyOkqDQKHBUQ', 'Full Body Session', '2026-09-10 09:00:00');
```

3. **Confirm success**: After the transaction completes, confirm to the user that 3 workouts have been added for 2026 (January, May, and September).

## Important Notes

- Use `run_sql_transaction` (not `run_sql`) because we're inserting multiple records
- The `sqlStatements` parameter should be an array with a single INSERT statement
- If the database name is not "neondb", ask the user or check the project details first
- The workout dates are hardcoded to specific months in 2026 to ensure distribution across the year

## Example Usage

**User prompt**: "Add test workouts for 2026"

**Action**:
1. List projects to get project ID
2. Execute transaction with 3 INSERT statements
3. Report success

## Error Handling

If the transaction fails:
- Check if the `workouts` table exists
- Verify the `user_id` column accepts the provided string format
- Confirm the `created_at` column accepts timestamp values
- Check if there are any foreign key constraints or unique constraints that might be violated

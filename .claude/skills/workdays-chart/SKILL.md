---
name: workdays-chart
description: Generate a bar chart visualization showing the number of working days (Monday-Friday) for each month of a specified year. Use this skill whenever the user asks to visualize working days, see workday counts by month, create a workday calendar chart, show business days distribution, or analyze how many workdays are in each month for any year. Trigger on phrases like "show me workdays for [year]", "chart of working days", "how many business days per month", "visualize work calendar", or similar requests about workday frequency or distribution.
---

# Workdays Chart Generator

Generate a horizontal bar chart showing the count of working days (Monday-Friday) for each month of a specified year.

## What this skill does

Creates a PNG image with a clean bar chart visualization where:
- **Y-axis**: 12 months (January through December)
- **X-axis**: Number of working days (weekdays only)
- **Data**: Count of Monday-Friday days in each month, excluding weekends

## How to use this skill

1. **Extract the year** from the user's request. If no year is specified, ask which year they want to visualize.

2. **Use the bundled script** at `scripts/generate_workdays_chart.py` to create the chart:
   ```bash
   python workdays-chart/scripts/generate_workdays_chart.py --year 2026 --output workdays_2026.png
   ```

3. **Tell the user** where the chart was saved and offer to show it if they want to see it.

## Script parameters

- `--year` (required): The year to analyze (e.g., 2026)
- `--output` (optional): Output filename (defaults to `workdays_[year].png`)

## What the chart shows

The script counts only Monday through Friday as working days. It does **not** account for public holidays - just simple weekday counting. Each bar shows the total number of weekdays in that month.

## Expected output

A clean, professional-looking horizontal bar chart with:
- Clear month labels on the Y-axis
- Working day counts on the X-axis
- Numbers displayed on each bar for easy reading
- A descriptive title showing the year
- Appropriate sizing for readability

The chart is saved as a PNG file ready for viewing or sharing.

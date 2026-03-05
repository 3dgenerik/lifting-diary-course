#!/usr/bin/env python3
"""
Generate a bar chart showing working days per month for a given year.
Working days = Monday through Friday (excludes weekends only).
"""

import argparse
import calendar
from datetime import date, timedelta
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server environments


def count_workdays(year, month):
    """
    Count the number of weekdays (Mon-Fri) in a given month.

    Args:
        year: The year (e.g., 2026)
        month: The month (1-12)

    Returns:
        Number of working days in that month
    """
    # Get the number of days in the month
    _, num_days = calendar.monthrange(year, month)

    workday_count = 0
    for day in range(1, num_days + 1):
        # weekday() returns 0=Monday through 6=Sunday
        if date(year, month, day).weekday() < 5:  # 0-4 are Mon-Fri
            workday_count += 1

    return workday_count


def generate_chart(year, output_filename=None):
    """
    Generate a horizontal bar chart of working days by month.

    Args:
        year: The year to analyze
        output_filename: Path where to save the PNG (optional)

    Returns:
        The filename where the chart was saved
    """
    if output_filename is None:
        output_filename = f"workdays_{year}.png"

    # Calculate workdays for each month
    months = [calendar.month_name[i] for i in range(1, 13)]
    workdays = [count_workdays(year, month) for month in range(1, 13)]

    # Create the chart
    fig, ax = plt.subplots(figsize=(10, 8))

    # Horizontal bar chart
    bars = ax.barh(months, workdays, color='#4A90E2', edgecolor='#2E5C8A', linewidth=1.2)

    # Add value labels on the bars
    for i, (bar, value) in enumerate(zip(bars, workdays)):
        ax.text(value + 0.3, i, str(value), va='center', fontsize=10, fontweight='bold')

    # Styling
    ax.set_xlabel('Number of Working Days', fontsize=12, fontweight='bold')
    ax.set_ylabel('Month', fontsize=12, fontweight='bold')
    ax.set_title(f'Working Days per Month in {year}', fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(0, max(workdays) + 3)

    # Grid for readability
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)

    # Tight layout to avoid label cutoff
    plt.tight_layout()

    # Save the figure
    plt.savefig(output_filename, dpi=150, bbox_inches='tight')
    plt.close()

    return output_filename


def main():
    parser = argparse.ArgumentParser(
        description='Generate a chart showing working days per month for a given year.'
    )
    parser.add_argument(
        '--year',
        type=int,
        required=True,
        help='The year to analyze (e.g., 2026)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output filename (default: workdays_[year].png)'
    )

    args = parser.parse_args()

    # Validate year
    if args.year < 1900 or args.year > 2100:
        print(f"Error: Year {args.year} is out of reasonable range (1900-2100)")
        return 1

    # Generate the chart
    filename = generate_chart(args.year, args.output)
    print(f"Chart saved to: {filename}")

    return 0


if __name__ == '__main__':
    exit(main())

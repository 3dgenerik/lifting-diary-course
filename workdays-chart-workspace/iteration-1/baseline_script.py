#!/usr/bin/env python3
"""Simple script to generate workdays chart without using the skill."""
import sys
import calendar
from datetime import date
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

def count_workdays(year, month):
    _, num_days = calendar.monthrange(year, month)
    workday_count = 0
    for day in range(1, num_days + 1):
        if date(year, month, day).weekday() < 5:
            workday_count += 1
    return workday_count

def generate_chart(year, output_file):
    months = [calendar.month_name[i] for i in range(1, 13)]
    workdays = [count_workdays(year, month) for month in range(1, 13)]

    fig, ax = plt.subplots(figsize=(10, 8))
    bars = ax.barh(months, workdays, color='#4A90E2')

    for i, (bar, value) in enumerate(zip(bars, workdays)):
        ax.text(value + 0.3, i, str(value), va='center')

    ax.set_xlabel('Working Days')
    ax.set_ylabel('Month')
    ax.set_title(f'Working Days per Month in {year}')
    ax.grid(axis='x', alpha=0.3)

    plt.tight_layout()
    plt.savefig(output_file, dpi=150)
    plt.close()
    print(f"Chart saved to: {output_file}")

if __name__ == '__main__':
    year = int(sys.argv[1])
    output = sys.argv[2]
    generate_chart(year, output)

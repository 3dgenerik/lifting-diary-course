import calendar
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from datetime import datetime, timedelta
import numpy as np
import os

# Calculate working days for each month in 2027
year = 2027
months = []
working_days = []
weekend_days = []
total_days = []

for month in range(1, 13):
    month_name = calendar.month_name[month]
    months.append(month_name[:3])  # Short month names

    # Get the number of days in the month
    num_days = calendar.monthrange(year, month)[1]
    total_days.append(num_days)

    # Count working days (excluding weekends)
    workdays = 0
    weekends = 0
    for day in range(1, num_days + 1):
        date = datetime(year, month, day)
        if date.weekday() < 5:  # Monday = 0, Sunday = 6
            workdays += 1
        else:
            weekends += 1

    working_days.append(workdays)
    weekend_days.append(weekends)

# Create the visualization
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), gridspec_kw={'height_ratios': [2, 1]})
fig.suptitle('2027 Work Calendar Analysis', fontsize=18, fontweight='bold', y=0.98)

# Color scheme
colors = ['#3b82f6' if wd >= 22 else '#60a5fa' if wd >= 21 else '#93c5fd' for wd in working_days]
max_workdays = max(working_days)
min_workdays = min(working_days)

# Top chart: Bar chart of working days per month
bars = ax1.bar(months, working_days, color=colors, edgecolor='black', linewidth=1.5, alpha=0.85)
ax1.set_ylabel('Number of Working Days', fontsize=12, fontweight='bold')
ax1.set_title('Working Days per Month (Excluding Weekends)', fontsize=14, pad=15)
ax1.grid(axis='y', alpha=0.3, linestyle='--')
ax1.set_ylim(0, max(working_days) + 2)

# Add value labels on bars
for i, (bar, wd, wd_count) in enumerate(zip(bars, weekend_days, working_days)):
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height + 0.3,
             f'{int(wd_count)}',
             ha='center', va='bottom', fontsize=10, fontweight='bold')

    # Highlight months with most and least working days
    if wd_count == max_workdays:
        ax1.text(bar.get_x() + bar.get_width()/2., -1.5,
                 '★ MAX ★', ha='center', va='top', fontsize=9,
                 fontweight='bold', color='green')
    elif wd_count == min_workdays:
        ax1.text(bar.get_x() + bar.get_width()/2., -1.5,
                 '★ MIN ★', ha='center', va='top', fontsize=9,
                 fontweight='bold', color='red')

# Bottom chart: Stacked bar showing working days vs weekends
width = 0.6
x = np.arange(len(months))
p1 = ax2.bar(x, working_days, width, label='Working Days', color='#10b981', alpha=0.8)
p2 = ax2.bar(x, weekend_days, width, bottom=working_days, label='Weekend Days', color='#ef4444', alpha=0.8)

ax2.set_ylabel('Days', fontsize=12, fontweight='bold')
ax2.set_title('Total Days Breakdown (Working Days + Weekends)', fontsize=14, pad=15)
ax2.set_xticks(x)
ax2.set_xticklabels(months)
ax2.legend(loc='upper right', fontsize=10)
ax2.grid(axis='y', alpha=0.3, linestyle='--')

# Add total days labels
for i, (wd, we) in enumerate(zip(working_days, weekend_days)):
    total = wd + we
    ax2.text(i, total + 0.5, str(total), ha='center', va='bottom', fontsize=9)

# Add summary statistics
summary_text = f"""
2027 SUMMARY:
• Total Working Days: {sum(working_days)} days
• Total Weekend Days: {sum(weekend_days)} days
• Average Working Days/Month: {sum(working_days)/12:.1f} days
• Month with Most Working Days: {months[working_days.index(max_workdays)]} ({max_workdays} days)
• Month with Least Working Days: {months[working_days.index(min_workdays)]} ({min_workdays} days)
"""

fig.text(0.02, 0.02, summary_text, fontsize=10, verticalalignment='bottom',
         bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.3), family='monospace')

plt.tight_layout(rect=[0, 0.08, 1, 0.96])

# Save the chart
output_path = os.path.join(os.path.dirname(__file__), 'work_calendar_2027.png')
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
print(f"Chart saved to: {output_path}")

# Print detailed breakdown
print("\n2027 WORKING DAYS BREAKDOWN:")
print("=" * 50)
for month, wd, we, total in zip(months, working_days, weekend_days, total_days):
    print(f"{month:>3}: {wd:>2} working days | {we:>2} weekend days | {total:>2} total")
print("=" * 50)
print(f"TOTAL: {sum(working_days)} working days in 2027")

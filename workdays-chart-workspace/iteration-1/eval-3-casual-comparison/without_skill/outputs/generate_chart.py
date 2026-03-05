import calendar
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import numpy as np

def count_working_days(year, month):
    """Count working days (Monday-Friday) in a given month"""
    # Get the number of days in the month
    _, num_days = calendar.monthrange(year, month)

    working_days = 0
    for day in range(1, num_days + 1):
        date = datetime(year, month, day)
        # Monday is 0, Sunday is 6
        if date.weekday() < 5:  # Monday to Friday
            working_days += 1

    return working_days

# Calculate working days for each month in 2027
year = 2027
months = []
working_days_list = []

for month in range(1, 13):
    month_name = calendar.month_name[month]
    months.append(month_name[:3])  # Use 3-letter abbreviation
    working_days = count_working_days(year, month)
    working_days_list.append(working_days)
    print(f"{month_name}: {working_days} working days")

# Create the visualization
fig, ax = plt.subplots(figsize=(14, 8))

# Create bar chart with gradient colors based on value
colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(working_days_list)))
bars = ax.bar(months, working_days_list, color=colors, edgecolor='black', linewidth=1.5)

# Add value labels on top of each bar
for bar, days in zip(bars, working_days_list):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'{int(days)}',
            ha='center', va='bottom', fontsize=12, fontweight='bold')

# Customize the chart
ax.set_xlabel('Month', fontsize=14, fontweight='bold')
ax.set_ylabel('Working Days', fontsize=14, fontweight='bold')
ax.set_title('2027 Work Calendar - Working Days by Month', fontsize=16, fontweight='bold', pad=20)
ax.set_ylim(0, max(working_days_list) + 2)
ax.grid(axis='y', alpha=0.3, linestyle='--')
ax.set_axisbelow(True)

# Add a horizontal line showing the average
avg_working_days = np.mean(working_days_list)
ax.axhline(y=avg_working_days, color='red', linestyle='--', linewidth=2, alpha=0.7, label=f'Average: {avg_working_days:.1f}')
ax.legend(fontsize=11)

# Highlight months with most and least working days
max_days = max(working_days_list)
min_days = min(working_days_list)
for i, (bar, days) in enumerate(zip(bars, working_days_list)):
    if days == max_days:
        bar.set_edgecolor('green')
        bar.set_linewidth(3)
    elif days == min_days:
        bar.set_edgecolor('red')
        bar.set_linewidth(3)

plt.tight_layout()
plt.savefig('2027_working_days_calendar.png', dpi=300, bbox_inches='tight')
print("\n✓ Chart saved as '2027_working_days_calendar.png'")

# Print summary statistics
print(f"\nSummary Statistics for 2027:")
print(f"- Total working days: {sum(working_days_list)}")
print(f"- Average per month: {avg_working_days:.1f}")
print(f"- Highest: {max_days} days ({', '.join([months[i] for i, d in enumerate(working_days_list) if d == max_days])})")
print(f"- Lowest: {min_days} days ({', '.join([months[i] for i, d in enumerate(working_days_list) if d == min_days])})")

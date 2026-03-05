import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta
import calendar

def count_workdays(year, month):
    """Count workdays (Monday-Friday) in a given month"""
    # Get the number of days in the month
    num_days = calendar.monthrange(year, month)[1]

    workdays = 0
    for day in range(1, num_days + 1):
        date = datetime(year, month, day)
        # Monday = 0, Sunday = 6
        if date.weekday() < 5:  # Monday to Friday
            workdays += 1

    return workdays

# Generate data for 2026
year = 2026
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
workdays = [count_workdays(year, month) for month in range(1, 13)]

# Create the chart
fig, ax = plt.subplots(figsize=(12, 6))

# Create bar chart
bars = ax.bar(months, workdays, color='#3b82f6', edgecolor='#1e40af', linewidth=1.5)

# Add value labels on top of each bar
for bar in bars:
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'{int(height)}',
            ha='center', va='bottom', fontsize=10, fontweight='bold')

# Customize the chart
ax.set_xlabel('Month', fontsize=12, fontweight='bold')
ax.set_ylabel('Number of Workdays', fontsize=12, fontweight='bold')
ax.set_title('Workdays per Month in 2026', fontsize=16, fontweight='bold', pad=20)
ax.set_ylim(0, max(workdays) + 2)
ax.grid(axis='y', alpha=0.3, linestyle='--')

# Add a subtle background
ax.set_facecolor('#f8f9fa')
fig.patch.set_facecolor('white')

# Add summary statistics
total_workdays = sum(workdays)
avg_workdays = total_workdays / 12
fig.text(0.99, 0.02, f'Total Workdays: {total_workdays} | Average per Month: {avg_workdays:.1f}',
         ha='right', va='bottom', fontsize=10, style='italic', color='#6b7280')

plt.tight_layout()

# Save the chart
output_path = 'workdays_2026.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"Chart saved to: {output_path}")

# Also save as high-quality version
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

print(f"\nWorkdays breakdown for 2026:")
for month, days in zip(months, workdays):
    print(f"{month}: {days} workdays")
print(f"\nTotal: {total_workdays} workdays")
print(f"Average: {avg_workdays:.1f} workdays per month")

import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta
import calendar

def count_business_days(year, month):
    """Count the number of business days (Mon-Fri) in a given month."""
    # Get the number of days in the month
    num_days = calendar.monthrange(year, month)[1]

    business_days = 0
    for day in range(1, num_days + 1):
        date = datetime(year, month, day)
        # Monday = 0, Sunday = 6
        if date.weekday() < 5:  # Monday to Friday
            business_days += 1

    return business_days

# Calculate business days for each month in 2025
year = 2025
months = []
business_days_count = []

for month in range(1, 13):
    month_name = calendar.month_name[month]
    months.append(month_name)
    bd_count = count_business_days(year, month)
    business_days_count.append(bd_count)
    print(f"{month_name} 2025: {bd_count} business days")

# Create the chart
fig, ax = plt.subplots(figsize=(12, 7))

# Create bar chart
bars = ax.bar(months, business_days_count, color='steelblue', edgecolor='navy', linewidth=1.5)

# Customize the chart
ax.set_xlabel('Month', fontsize=12, fontweight='bold')
ax.set_ylabel('Number of Business Days', fontsize=12, fontweight='bold')
ax.set_title('Business Days per Month in 2025', fontsize=16, fontweight='bold', pad=20)
ax.set_ylim(0, max(business_days_count) + 2)

# Add value labels on top of each bar
for bar, count in zip(bars, business_days_count):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'{int(count)}',
            ha='center', va='bottom', fontsize=11, fontweight='bold')

# Add grid for better readability
ax.grid(axis='y', alpha=0.3, linestyle='--')
ax.set_axisbelow(True)

# Rotate x-axis labels for better readability
plt.xticks(rotation=45, ha='right')

# Adjust layout to prevent label cutoff
plt.tight_layout()

# Save the chart
output_path = 'business_days_2025.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"\nChart saved to: {output_path}")

plt.close()

import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta
import calendar

def count_business_days(year, month):
    """Count business days (Monday-Friday) in a given month"""
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
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
business_days = [count_business_days(year, month) for month in range(1, 13)]

# Create the chart
fig, ax = plt.subplots(figsize=(12, 6))

# Create bar chart
bars = ax.bar(months, business_days, color='#3b82f6', alpha=0.8, edgecolor='#1e40af', linewidth=1.5)

# Customize the chart
ax.set_xlabel('Month', fontsize=12, fontweight='bold')
ax.set_ylabel('Number of Business Days', fontsize=12, fontweight='bold')
ax.set_title('Business Days per Month in 2025', fontsize=16, fontweight='bold', pad=20)

# Add value labels on top of each bar
for i, (bar, value) in enumerate(zip(bars, business_days)):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height,
            f'{value}',
            ha='center', va='bottom', fontsize=10, fontweight='bold')

# Add grid for better readability
ax.grid(axis='y', alpha=0.3, linestyle='--')
ax.set_axisbelow(True)

# Set y-axis limits for better visualization
ax.set_ylim(0, max(business_days) + 2)

# Improve layout
plt.tight_layout()

# Save the chart
output_path = 'workdays-chart-workspace/iteration-1/eval-2-business-days/with_skill/outputs/business_days_2025.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"Chart saved to: {output_path}")

# Print summary statistics
print(f"\nBusiness Days Summary for 2025:")
print(f"Total business days: {sum(business_days)}")
print(f"Average per month: {sum(business_days)/12:.1f}")
print(f"Minimum: {min(business_days)} days ({months[business_days.index(min(business_days))]})")
print(f"Maximum: {max(business_days)} days ({months[business_days.index(max(business_days))]})")

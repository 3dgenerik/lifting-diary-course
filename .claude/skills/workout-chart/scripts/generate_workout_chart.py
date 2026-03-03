#!/usr/bin/env python3
"""
Workout Chart Generator

This script queries the PostgreSQL database for workout data from the past year
and generates a bar chart showing workout frequency by month.
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import DictCursor
except ImportError:
    print("Error: psycopg2-binary is not installed.")
    print("Install it with: pip install psycopg2-binary")
    sys.exit(1)

try:
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
except ImportError:
    print("Error: matplotlib is not installed.")
    print("Install it with: pip install matplotlib")
    sys.exit(1)

try:
    import pandas as pd
except ImportError:
    print("Error: pandas is not installed.")
    print("Install it with: pip install pandas")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    print("Error: python-dotenv is not installed.")
    print("Install it with: pip install python-dotenv")
    sys.exit(1)


def load_database_url():
    """Load DATABASE_URL from .env file."""
    # Find the project root (where .env file is located)
    current_dir = Path(__file__).resolve().parent
    project_root = current_dir.parent.parent.parent.parent
    env_file = project_root / '.env'

    if not env_file.exists():
        print(f"Error: .env file not found at {env_file}")
        sys.exit(1)

    # Load environment variables
    load_dotenv(env_file)

    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL not found in .env file")
        sys.exit(1)

    return database_url, project_root


def fetch_workout_data(database_url):
    """
    Query the database for workouts from the past year.

    Returns:
        List of tuples: (month_start_date, workout_count)
    """
    # Calculate the date one year ago
    one_year_ago = datetime.now() - timedelta(days=365)

    query = """
        SELECT
            DATE_TRUNC('month', created_at) as month,
            COUNT(*) as workout_count
        FROM workouts
        WHERE created_at >= %s
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
    """

    try:
        # Connect to the database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=DictCursor)

        # Execute query
        cursor.execute(query, (one_year_ago,))
        results = cursor.fetchall()

        # Close connection
        cursor.close()
        conn.close()

        return results

    except psycopg2.Error as e:
        print(f"Database error: {e}")
        sys.exit(1)


def create_chart(data, output_path):
    """
    Create a bar chart from workout data and save it as an image.

    Args:
        data: List of tuples (month_date, workout_count)
        output_path: Path where the chart image should be saved
    """
    if not data:
        print("No workout data found for the past year.")
        # Create an empty chart with a message
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.text(0.5, 0.5, 'No workout data available for the past 12 months',
                horizontalalignment='center',
                verticalalignment='center',
                transform=ax.transAxes,
                fontsize=14)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"Chart saved to: {output_path}")
        return

    # Convert to pandas DataFrame for easier manipulation
    df = pd.DataFrame(data, columns=['month', 'workout_count'])
    df['month'] = pd.to_datetime(df['month'])

    # Create figure and axis
    fig, ax = plt.subplots(figsize=(14, 7))

    # Create bar chart
    bars = ax.bar(df['month'], df['workout_count'],
                   width=20,  # Width in days
                   color='#4F46E5',  # Indigo color
                   edgecolor='#312E81',
                   linewidth=1.5,
                   alpha=0.8)

    # Customize the chart
    ax.set_xlabel('Month', fontsize=12, fontweight='bold')
    ax.set_ylabel('Number of Workouts', fontsize=12, fontweight='bold')
    ax.set_title('Workout Frequency - Past 12 Months',
                 fontsize=16, fontweight='bold', pad=20)

    # Format x-axis to show month names
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    ax.xaxis.set_major_locator(mdates.MonthLocator())

    # Rotate date labels for better readability
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')

    # Add grid for easier reading
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)

    # Add value labels on top of bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom',
                fontsize=10, fontweight='bold')

    # Set y-axis to start at 0
    ax.set_ylim(bottom=0)

    # Adjust layout to prevent label cutoff
    plt.tight_layout()

    # Save the chart
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Chart saved to: {output_path}")

    # Display statistics
    total_workouts = df['workout_count'].sum()
    avg_workouts = df['workout_count'].mean()
    print(f"\nStatistics:")
    print(f"  Total workouts: {total_workouts}")
    print(f"  Average per month: {avg_workouts:.1f}")
    print(f"  Months with data: {len(df)}")


def main():
    """Main execution function."""
    print("Generating workout frequency chart...")
    print("-" * 50)

    # Load database URL and get project root
    database_url, project_root = load_database_url()
    print(f"[OK] Loaded database configuration")

    # Fetch workout data
    print(f"[OK] Querying workouts from the past 12 months...")
    workout_data = fetch_workout_data(database_url)

    if workout_data:
        print(f"[OK] Found {len(workout_data)} months with workout data")
    else:
        print("[!] No workout data found")

    # Create output path
    output_path = project_root / 'workout_frequency_chart.png'

    # Generate chart
    print(f"[OK] Creating chart...")
    create_chart(workout_data, output_path)

    print("-" * 50)
    print("[OK] Chart generation complete!")


if __name__ == '__main__':
    main()

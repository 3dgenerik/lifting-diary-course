const fs = require('fs');

// Function to count working days in a month
function countWorkingDays(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays++;
        }
    }

    return workingDays;
}

// Calculate working days for each month in 2027
const year = 2027;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const workingDaysData = [];

console.log('Working Days in 2027:\n');
for (let month = 0; month < 12; month++) {
    const workingDays = countWorkingDays(year, month);
    workingDaysData.push(workingDays);
    console.log(`${monthsFull[month].padEnd(12)}: ${workingDays} working days`);
}

// Calculate statistics
const totalWorkingDays = workingDaysData.reduce((a, b) => a + b, 0);
const avgWorkingDays = totalWorkingDays / 12;
const maxDays = Math.max(...workingDaysData);
const minDays = Math.min(...workingDaysData);

const maxMonths = months.filter((_, i) => workingDaysData[i] === maxDays);
const minMonths = months.filter((_, i) => workingDaysData[i] === minDays);

console.log(`\nSummary Statistics for 2027:`);
console.log(`- Total working days: ${totalWorkingDays}`);
console.log(`- Average per month: ${avgWorkingDays.toFixed(1)}`);
console.log(`- Highest: ${maxDays} days (${maxMonths.join(', ')})`);
console.log(`- Lowest: ${minDays} days (${minMonths.join(', ')})`);

// Generate HTML with Chart.js visualization
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2027 Work Calendar</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 18px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-card p {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .chart-container {
            position: relative;
            height: 400px;
            margin-top: 20px;
        }
        .legend {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
        }
        .legend span {
            display: inline-block;
            margin: 0 15px;
        }
        .legend .green {
            color: #10b981;
            font-weight: bold;
        }
        .legend .red {
            color: #ef4444;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>2027 Work Calendar</h1>
        <p class="subtitle">Working Days by Month (Monday-Friday)</p>

        <div class="stats">
            <div class="stat-card">
                <h3>Total Working Days</h3>
                <p>${totalWorkingDays}</p>
            </div>
            <div class="stat-card">
                <h3>Average per Month</h3>
                <p>${avgWorkingDays.toFixed(1)}</p>
            </div>
            <div class="stat-card">
                <h3>Highest Month</h3>
                <p>${maxDays} days</p>
                <small>${maxMonths.join(', ')}</small>
            </div>
            <div class="stat-card">
                <h3>Lowest Month</h3>
                <p>${minDays} days</p>
                <small>${minMonths.join(', ')}</small>
            </div>
        </div>

        <div class="chart-container">
            <canvas id="workdaysChart"></canvas>
        </div>

        <div class="legend">
            <span><span class="green">■</span> Highest working days</span>
            <span><span class="red">■</span> Lowest working days</span>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('workdaysChart').getContext('2d');
        const workingDaysData = ${JSON.stringify(workingDaysData)};
        const maxDays = ${maxDays};
        const minDays = ${minDays};
        const avgDays = ${avgWorkingDays.toFixed(1)};

        // Create gradient colors based on values
        const backgroundColors = workingDaysData.map(days => {
            if (days === maxDays) return 'rgba(16, 185, 129, 0.8)';
            if (days === minDays) return 'rgba(239, 68, 68, 0.8)';
            return 'rgba(102, 126, 234, 0.8)';
        });

        const borderColors = workingDaysData.map(days => {
            if (days === maxDays) return 'rgb(16, 185, 129)';
            if (days === minDays) return 'rgb(239, 68, 68)';
            return 'rgb(102, 126, 234)';
        });

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(months)},
                datasets: [{
                    label: 'Working Days',
                    data: workingDaysData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' working days';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxDays + 2,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            },
            plugins: [{
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach(function(dataset, i) {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach(function(bar, index) {
                            const data = dataset.data[index];
                            ctx.fillStyle = 'rgb(0, 0, 0)';
                            ctx.font = 'bold 14px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(data, bar.x, bar.y - 5);
                        });
                    });

                    // Draw average line
                    const yAxis = chart.scales.y;
                    const xAxis = chart.scales.x;
                    const avgY = yAxis.getPixelForValue(avgDays);

                    ctx.save();
                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(xAxis.left, avgY);
                    ctx.lineTo(xAxis.right, avgY);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'right';
                    ctx.fillText('Average: ' + avgDays, xAxis.right - 10, avgY - 8);
                    ctx.restore();
                }
            }]
        });
    </script>
</body>
</html>`;

fs.writeFileSync('2027_working_days_calendar.html', htmlContent);
console.log('\n✓ Interactive chart saved as "2027_working_days_calendar.html"');
console.log('  Open this file in a web browser to view the visualization.');

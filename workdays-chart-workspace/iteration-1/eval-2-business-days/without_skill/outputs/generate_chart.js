const fs = require('fs');
const { createCanvas } = require('canvas');

function countBusinessDays(year, month) {
    // Get the number of days in the month
    const lastDay = new Date(year, month, 0).getDate();

    let businessDays = 0;
    for (let day = 1; day <= lastDay; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDays++;
        }
    }

    return businessDays;
}

// Calculate business days for each month in 2025
const year = 2025;
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const businessDaysCount = [];
for (let month = 1; month <= 12; month++) {
    const count = countBusinessDays(year, month);
    businessDaysCount.push(count);
    console.log(`${months[month - 1]} 2025: ${count} business days`);
}

// Create canvas
const width = 1200;
const height = 700;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// White background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);

// Chart dimensions
const margin = { top: 80, right: 50, bottom: 100, left: 80 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

// Calculate bar dimensions
const barWidth = chartWidth / months.length - 10;
const maxBusinessDays = Math.max(...businessDaysCount);
const yScale = chartHeight / (maxBusinessDays + 2);

// Draw title
ctx.fillStyle = 'black';
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';
ctx.fillText('Business Days per Month in 2025', width / 2, 40);

// Draw y-axis grid lines
ctx.strokeStyle = '#e0e0e0';
ctx.lineWidth = 1;
for (let i = 0; i <= maxBusinessDays + 2; i += 2) {
    const y = margin.top + chartHeight - (i * yScale);
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + chartWidth, y);
    ctx.stroke();
}

// Draw bars and labels
months.forEach((month, index) => {
    const x = margin.left + (index * (chartWidth / months.length)) + 5;
    const barHeight = businessDaysCount[index] * yScale;
    const y = margin.top + chartHeight - barHeight;

    // Draw bar
    ctx.fillStyle = 'steelblue';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw bar border
    ctx.strokeStyle = 'navy';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Draw value on top of bar
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(businessDaysCount[index].toString(), x + barWidth / 2, y - 5);

    // Draw month label
    ctx.save();
    ctx.translate(x + barWidth / 2, margin.top + chartHeight + 20);
    ctx.rotate(-Math.PI / 4);
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(month, 0, 0);
    ctx.restore();
});

// Draw axes
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;

// Y-axis
ctx.beginPath();
ctx.moveTo(margin.left, margin.top);
ctx.lineTo(margin.left, margin.top + chartHeight);
ctx.stroke();

// X-axis
ctx.beginPath();
ctx.moveTo(margin.left, margin.top + chartHeight);
ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
ctx.stroke();

// Y-axis label
ctx.save();
ctx.translate(20, height / 2);
ctx.rotate(-Math.PI / 2);
ctx.font = 'bold 14px Arial';
ctx.textAlign = 'center';
ctx.fillStyle = 'black';
ctx.fillText('Number of Business Days', 0, 0);
ctx.restore();

// X-axis label
ctx.font = 'bold 14px Arial';
ctx.textAlign = 'center';
ctx.fillText('Month', width / 2, height - 20);

// Y-axis tick labels
ctx.font = '12px Arial';
ctx.textAlign = 'right';
for (let i = 0; i <= maxBusinessDays + 2; i += 2) {
    const y = margin.top + chartHeight - (i * yScale);
    ctx.fillText(i.toString(), margin.left - 10, y + 4);
}

// Save to file
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('business_days_2025.png', buffer);
console.log('\nChart saved to: business_days_2025.png');

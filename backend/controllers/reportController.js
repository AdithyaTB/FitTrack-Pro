const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const path = require('path');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Workout = require('../models/Workout');
const Progress = require('../models/Progress');

// @desc    Generate Premium PDF report
// @route   GET /api/reports/pdf
// @access  Private
const generatePDFReport = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id });

    // Date Filtering & Data Fetching
    let startDate = new Date(0);
    const today = new Date();
    if (type === 'weekly') startDate = new Date(today.setDate(today.getDate() - 7));
    if (type === 'monthly') startDate = new Date(today.setMonth(today.getMonth() - 1));

    const workouts = await Workout.find({ user: req.user.id, date: { $gte: startDate } }).sort({ date: 1 });
    const progress = await Progress.find({ user: req.user.id }).sort({ date: 1 });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const doc = new PDFDocument({ margin: 0, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=FitTrack_Premium_${type || 'Full'}_Report.pdf`);
    doc.pipe(res);

    // --- UTILS ---
    const width = 595;
    const height = 841;
    const padding = 50;

    const colors = {
        primary: '#6366f1', // Indigo
        secondary: '#0f172a', // Slate 900
        accent: '#22c55e', // Green
        text: '#334155',
        lightText: '#94a3b8',
        bg: '#f8fafc' // Slate 50
    };

    // --- HEADER COMPONENT (Repeated on pages if needed, usually just logo) ---
    const drawHeader = (title) => {
        doc.fillColor(colors.secondary).fontSize(10).font('Helvetica-Bold').text('FITTRACK PRO', padding, 40);
        doc.fillColor(colors.lightText).fontSize(8).font('Helvetica').text('INTELLIGENT ANALYTICS', padding, 52);

        doc.fillColor(colors.lightText).text(new Date().toLocaleDateString(), width - 100, 40, { align: 'right' });

        if (title) {
            doc.fillColor(colors.secondary).fontSize(20).text(title, padding, 80);
            doc.lineWidth(2).strokeColor(colors.primary).moveTo(padding, 110).lineTo(padding + 50, 110).stroke();
        }
    };

    const drawFooter = (page) => {
        doc.fontSize(8).fillColor(colors.lightText)
            .text(`Page ${page} | Generated for ${user.name}`, padding, height - 30, { align: 'center' });
    };

    // --- PAGE 1: COVER (Magazine Style) ---
    // Background Image effect using Gradients/Shapes
    const drawCover = () => {
        // Geometric Overlay
        doc.save();
        doc.rect(0, 0, width, height).fill(colors.secondary);

        // Dynamic circles
        doc.fillColor(colors.primary).fillOpacity(0.1).circle(width, 0, 300).fill();
        doc.fillColor(colors.accent).fillOpacity(0.05).circle(0, height, 400).fill();

        // Central Card
        doc.fillOpacity(1);
        doc.roundedRect(padding, 200, width - (padding * 2), 400, 20).fill('white'); // Inner card

        // Content
        doc.fillColor(colors.secondary).fontSize(50).font('Helvetica-Bold').text('FITNESS', 0, 260, { align: 'center', letterSpacing: 5 });
        doc.fillColor(colors.primary).text('REPORT', 0, 315, { align: 'center', letterSpacing: 5 });

        doc.fontSize(14).font('Helvetica').fillColor(colors.text).text('ADVANCED PERFORMANCE METRICS', 0, 380, { align: 'center', letterSpacing: 2 });

        // User Info Strip
        doc.rect(padding, 450, width - (padding * 2), 60).fill('#f1f5f9');
        doc.fillColor(colors.secondary).fontSize(16).text(user.name.toUpperCase(), 0, 465, { align: 'center' });

        const fitnessLevel = profile ? profile.fitnessLevel : 'Beginner';
        const goal = profile ? profile.goal : 'maintain';
        doc.fontSize(10).fillColor(colors.lightText).text(`${fitnessLevel} • ${goal.toUpperCase()}`, 0, 490, { align: 'center' });

        doc.fillColor('white').text('CONFIDENTIAL ANALYTICS', 0, 750, { align: 'center', opacity: 0.5 });
        doc.restore();
    };

    drawCover();

    // --- PAGE 2: DASHBOARD SNAPSHOT ---
    doc.addPage();
    drawHeader('EXECUTIVE SUMMARY');

    // Stats Grid
    const statsY = 150;
    const boxW = 110;
    const boxH = 80;
    const gap = 15;

    // Helper to draw stat box
    const drawStatBox = (x, label, value, unit) => {
        doc.roundedRect(x, statsY, boxW, boxH, 10).fill('#f8fafc'); // bg-slate-50
        doc.rect(x, statsY, 5, boxH).fill(colors.primary); // accent bar

        doc.fillColor(colors.lightText).fontSize(9).text(label, x + 15, statsY + 15);
        doc.fillColor(colors.secondary).fontSize(20).font('Helvetica-Bold').text(value, x + 15, statsY + 35);
        doc.fontSize(10).font('Helvetica').text(unit, x + 15, statsY + 58);
    };

    const totalCals = workouts.reduce((a, b) => a + b.caloriesBurned, 0);
    const activeMins = workouts.reduce((a, b) => a + b.duration, 0);

    drawStatBox(padding, 'WORKOUTS', workouts.length, 'SESSIONS');
    drawStatBox(padding + boxW + gap, 'CALORIES', totalCals, 'KCAL');
    drawStatBox(padding + (boxW + gap) * 2, 'ACTIVE TIME', activeMins, 'MINS');
    drawStatBox(padding + (boxW + gap) * 3, 'STREAK', (profile ? profile.streak : 0), 'DAYS');

    // Recent Activity List
    doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.secondary).text('RECENT LOGS', padding, 280);

    let logsY = 310;
    workouts.slice(-5).reverse().forEach((w, i) => {
        const rowColor = i % 2 === 0 ? '#f8fafc' : 'white';
        doc.rect(padding, logsY, width - (padding * 2), 30).fill(rowColor);

        doc.fillColor(colors.text).fontSize(10).font('Helvetica')
            .text(new Date(w.date).toLocaleDateString(), padding + 10, logsY + 8)
            .text(w.type.toUpperCase(), padding + 100, logsY + 8)
            .text(`${w.caloriesBurned} kcal`, padding + 300, logsY + 8)
            .text(`${w.duration} min`, padding + 400, logsY + 8);
        // .text(w.mood, width - padding - 50, logsY + 8, { align: 'right' });

        logsY += 35;
    });

    // DNA / Habit Visualization (Mock)
    doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.secondary).text('Progress Calendar', padding, logsY + 30);
    doc.fontSize(10).font('Helvetica').fillColor(colors.lightText).text('Last 30 days intensity tracking', padding, logsY + 50);

    const dnaY = logsY + 70;
    const dotSize = 12;
    const dotGap = 4;

    // Simulate last 30 entries (or pads with empty)
    for (let i = 0; i < 30; i++) {
        const hasWorkout = i < workouts.length;
        const opacity = hasWorkout ? Math.random() * 0.5 + 0.5 : 0.1;
        const col = hasWorkout ? colors.primary : '#cbd5e1';

        doc.circle(padding + i * (dotSize + dotGap) + dotSize / 2, dnaY, dotSize / 2).fillColor(col).fillOpacity(opacity).fill();
    }
    doc.fillOpacity(1); // Reset

    drawFooter(2);

    // --- PAGE 3: DEEP DIVE ANALYTICS ---
    doc.addPage();
    drawHeader('PERFORMANCE BREAKDOWN');

    // Bar Chart Logic (Simulated with Rects)
    doc.text('Calorie Burn Distribution', padding, 150);
    doc.fontSize(9).fillColor(colors.lightText).text('Calories By Workout Type', padding, 165);

    const calsByType = {};
    workouts.forEach(w => calsByType[w.type] = (calsByType[w.type] || 0) + w.caloriesBurned);
    const maxVal = Math.max(...Object.values(calsByType), 1);

    let barY = 200;
    Object.entries(calsByType).forEach(([k, v]) => {
        const barW = (v / maxVal) * 350;

        doc.font('Helvetica-Bold').fillColor(colors.text).text(k, padding, barY);

        // Track
        doc.roundedRect(padding + 80, barY - 2, 350, 12, 6).fill('#f1f5f9');
        // Value
        doc.roundedRect(padding + 80, barY - 2, barW, 12, 6).fill(colors.accent);

        doc.font('Helvetica').fillColor(colors.text).text(`${v} kcal`, padding + 440, barY);

        barY += 30;
    });

    // Insights Box
    const insightY = 500;
    doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.secondary).text('AI INSIGHTS', padding, insightY);

    doc.roundedRect(padding, insightY + 20, width - (padding * 2), 150, 10).strokeColor(colors.primary).stroke();
    doc.rect(padding, insightY + 20, 5, 150).fill(colors.primary); // Side bar

    doc.fontSize(11).font('Helvetica').fillColor(colors.text);
    const insights = [];
    if (totalCals > 5000) insights.push('• Exceptional calorie output. You are performing at an athlete level.');
    else if (totalCals > 2000) insights.push('• Good maintenance levels. Try to spike intensity next week.');

    if (activeMins > 300) insights.push('• High endurance detected based on duration stats.');

    const streak = profile ? profile.streak : 0;
    insights.push(`• Consistency Score: ${Math.min((streak / 30) * 100, 100).toFixed(0)}% based on monthly targets.`);

    doc.text(insights.join('\n\n'), padding + 20, insightY + 40, { width: 450, lineGap: 10 });

    drawFooter(3);

    // --- PAGE 4: CERTIFICATE ---
    doc.addPage();

    // Border
    doc.rect(20, 20, width - 40, height - 40).strokeColor(colors.secondary).lineWidth(2).stroke();
    doc.rect(25, 25, width - 50, height - 50).strokeColor(colors.primary).lineWidth(1).stroke();

    // Mock Medal Icon (Vector)
    doc.save();
    doc.translate(width / 2, 100);
    doc.circle(0, 0, 30).fillColor('#fbbf24').fill(); // Gold
    doc.circle(0, 0, 25).lineWidth(2).strokeColor('#b45309').stroke();
    // Simple Star path
    doc.path('M 0 -15 L 4 -5 L 14 -5 L 6 2 L 9 12 L 0 7 L -9 12 L -6 2 L -14 -5 L -4 -5 Z').fillColor('#fff').fill();
    doc.restore();

    doc.moveDown(5);
    doc.fillColor(colors.secondary).fontSize(30).font('Helvetica-Bold').text('CERTIFICATE', 0, 150, { align: 'center', letterSpacing: 5 });
    doc.fontSize(10).fillColor(colors.accent).text('OF ACHIEVEMENT', { align: 'center', letterSpacing: 3 });

    doc.moveDown(4);
    doc.fontSize(16).fillColor(colors.text).font('Helvetica').text('This report certifies that', { align: 'center' });
    doc.moveDown();
    doc.fontSize(24).font('Helvetica-Bold').fillColor(colors.primary).text(user.name, { align: 'center' });

    doc.moveDown();
    doc.fontSize(14).font('Helvetica').fillColor(colors.text).text('has successfully tracked their fitness journey.', { align: 'center' });

    doc.moveDown(4);
    doc.fontSize(12).text(`Total Calories Burned: ${totalCals}`, { align: 'center' });
    doc.text(`Total Active Hours: ${(activeMins / 60).toFixed(1)}`, { align: 'center' });

    doc.moveDown(5);
    doc.fontSize(10).fillColor(colors.lightText).text(new Date().toDateString(), { align: 'center' });

    doc.end();
});

module.exports = {
    generatePDFReport,
};

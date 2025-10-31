const fs = require('fs');
const { createCanvas } = require('canvas');

// Create color icon (192x192)
const colorCanvas = createCanvas(192, 192);
const colorCtx = colorCanvas.getContext('2d');
colorCtx.fillStyle = '#4F46E5';
colorCtx.fillRect(0, 0, 192, 192);
colorCtx.fillStyle = 'white';
colorCtx.font = 'bold 100px Arial';
colorCtx.textAlign = 'center';
colorCtx.textBaseline = 'middle';
colorCtx.fillText('✨', 96, 96);

// Save color icon
const colorBuffer = colorCanvas.toBuffer('image/png');
fs.writeFileSync('spark-color-192.png', colorBuffer);

// Create outline icon (32x32)
const outlineCanvas = createCanvas(32, 32);
const outlineCtx = outlineCanvas.getContext('2d');
outlineCtx.fillStyle = 'transparent';
outlineCtx.fillRect(0, 0, 32, 32);
outlineCtx.strokeStyle = '#4F46E5';
outlineCtx.lineWidth = 2;
outlineCtx.strokeRect(1, 1, 30, 30);
outlineCtx.fillStyle = '#4F46E5';
outlineCtx.font = 'bold 18px Arial';
outlineCtx.textAlign = 'center';
outlineCtx.textBaseline = 'middle';
outlineCtx.fillText('S', 16, 16);

// Save outline icon
const outlineBuffer = outlineCanvas.toBuffer('image/png');
fs.writeFileSync('spark-outline-32.png', outlineBuffer);

console.log('Icons generated successfully!');

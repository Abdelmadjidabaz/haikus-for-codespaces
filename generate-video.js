const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const WIDTH = 800;
const HEIGHT = 600;
const FPS = 30;
const DURATION = 3; // seconds
const TOTAL_FRAMES = FPS * DURATION;

// Create temp directory for frames
const framesDir = path.join(__dirname, 'temp_frames');
if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir);
}

console.log('Generating frames...');

// Generate frames
for (let frameNum = 0; frameNum < TOTAL_FRAMES; frameNum++) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw old man's head (circle)
    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.arc(400, 250, 120, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw wrinkles (lines on forehead)
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(320, 160 + i * 15);
        ctx.lineTo(480, 160 + i * 15);
        ctx.stroke();
    }
    
    // Draw gray hair on sides
    ctx.fillStyle = '#B0B0B0';
    ctx.beginPath();
    ctx.arc(300, 220, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(500, 220, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bald top
    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.arc(400, 180, 80, 0, Math.PI);
    ctx.fill();
    
    // Draw eyes (sad, droopy)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(360, 240, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(440, 240, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils
    ctx.fillStyle = '#4A4A4A';
    ctx.beginPath();
    ctx.arc(360, 245, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(440, 245, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyebrows (sad, droopy)
    ctx.strokeStyle = '#8B8B8B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(335, 210);
    ctx.quadraticCurveTo(360, 215, 385, 210);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(415, 210);
    ctx.quadraticCurveTo(440, 215, 465, 210);
    ctx.stroke();
    
    // Draw nose
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(400, 260);
    ctx.lineTo(390, 290);
    ctx.stroke();
    
    // Draw mouth (sad, frowning)
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(400, 330, 40, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // Draw tears (animated falling)
    const progress = frameNum / TOTAL_FRAMES;
    
    // Multiple tears at different stages
    for (let tearSet = 0; tearSet < 3; tearSet++) {
        const tearProgress = (progress + tearSet * 0.33) % 1;
        const tearY = 255 + tearProgress * 150;
        
        // Left eye tear
        ctx.fillStyle = `rgba(135, 206, 235, ${1 - tearProgress})`;
        ctx.beginPath();
        ctx.ellipse(365, tearY, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye tear
        ctx.beginPath();
        ctx.ellipse(435, tearY, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add tear drops at eyes
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(365, 255, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(435, 255, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Add text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Old Man Crying', 400, 550);
    
    // Save frame
    const buffer = canvas.toBuffer('image/png');
    const framePath = path.join(framesDir, `frame_${String(frameNum).padStart(4, '0')}.png`);
    fs.writeFileSync(framePath, buffer);
    
    if ((frameNum + 1) % 10 === 0) {
        console.log(`Generated ${frameNum + 1}/${TOTAL_FRAMES} frames`);
    }
}

console.log('All frames generated. Creating video...');

// Create video from frames
const outputPath = path.join(__dirname, 'public', 'old-man-crying.mp4');

ffmpeg()
    .input(path.join(framesDir, 'frame_%04d.png'))
    .inputFPS(FPS)
    .videoCodec('libx264')
    .outputOptions([
        '-pix_fmt yuv420p',
        '-crf 23'
    ])
    .output(outputPath)
    .on('end', () => {
        console.log('Video created successfully!');
        console.log(`Output: ${outputPath}`);
        
        // Clean up frames
        console.log('Cleaning up temporary frames...');
        fs.readdirSync(framesDir).forEach(file => {
            fs.unlinkSync(path.join(framesDir, file));
        });
        fs.rmdirSync(framesDir);
        console.log('Done!');
    })
    .on('error', (err) => {
        console.error('Error creating video:', err);
    })
    .run();

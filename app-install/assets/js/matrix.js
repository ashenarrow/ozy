// Matrix rain effect
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixRain');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Matrix characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>/?~`';
    
    // Matrix columns
    const columns = [];
    const columnCount = Math.floor(canvas.width / 20);
    
    // Initialize columns
    for (let i = 0; i < columnCount; i++) {
        columns[i] = {
            x: i * 20,
            y: Math.random() * canvas.height,
            speed: Math.random() * 5 + 1,
            chars: []
        };
        
        // Initialize characters for this column
        const charCount = Math.floor(Math.random() * 20) + 5;
        for (let j = 0; j < charCount; j++) {
            columns[i].chars.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
    }
    
    // Animation variables
    let animationId = null;
    let isRunning = false;
    
    // Draw matrix rain
    function drawMatrixRain() {
        // Semi-transparent black to create trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Green text
        ctx.fillStyle = '#00ff41';
        ctx.font = '15px monospace';
        
        // Draw each column
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            
            // Draw characters in this column
            for (let j = 0; j < column.chars.length; j++) {
                const y = column.y - j * 20;
                
                // Only draw if in view
                if (y > -20 && y < canvas.height) {
                    // First character is brighter
                    if (j === 0) {
                        ctx.fillStyle = '#ffffff';
                    } else {
                        // Fade out as we go up
                        const alpha = 1 - j / column.chars.length;
                        ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
                    }
                    
                    ctx.fillText(column.chars[j], column.x, y);
                }
            }
            
            // Move column down
            column.y += column.speed;
            
            // If column is off screen, reset it
            if (column.y - column.chars.length * 20 > canvas.height) {
                column.y = 0;
                column.speed = Math.random() * 5 + 1;
                
                // Randomize characters
                for (let j = 0; j < column.chars.length; j++) {
                    column.chars[j] = chars.charAt(Math.floor(Math.random() * chars.length));
                }
            }
            
            // Occasionally change a character
            if (Math.random() < 0.02) {
                const charIndex = Math.floor(Math.random() * column.chars.length);
                column.chars[charIndex] = chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }
        
        // Continue animation
        if (isRunning) {
            animationId = requestAnimationFrame(drawMatrixRain);
        }
    }
    
    // Start matrix rain
    window.startMatrixRain = function() {
        if (!isRunning) {
            isRunning = true;
            animationId = requestAnimationFrame(drawMatrixRain);
        }
    };
    
    // Stop matrix rain
    window.stopMatrixRain = function() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    };
});
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const playerScoreElem = document.getElementById('playerScore');
const aiScoreElem = document.getElementById('aiScore');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const paddleWidth = 10;
const paddleHeight = 80;
const paddleMargin = 20;

// Ball settings
const ballRadius = 10;

// Initial positions
let playerY = (HEIGHT - paddleHeight) / 2;
let aiY = (HEIGHT - paddleHeight) / 2;

// Ball state
let ballX = WIDTH / 2;
let ballY = HEIGHT / 2;
let ballSpeed = 5;
let ballAngle = Math.random() * Math.PI * 2;
let ballVX = ballSpeed * Math.cos(ballAngle);
let ballVY = ballSpeed * Math.sin(ballAngle);

// Game speed (affects ball and AI speed)
let gameSpeed = parseInt(speedRange.value);

// Scores
let playerScore = 0;
let aiScore = 0;

// Mouse control
canvas.addEventListener("mousemove", function(e) {
    // Calculate mouse Y relative to canvas
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - paddleHeight / 2;
    playerY = Math.max(0, Math.min(HEIGHT - paddleHeight, playerY));
});

// Speed control
speedRange.addEventListener("input", function() {
    gameSpeed = parseInt(speedRange.value);
    speedValue.textContent = gameSpeed;
});

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw net
    ctx.strokeStyle = "#444";
    ctx.beginPath();
    for (let i = 0; i < HEIGHT; i += 15) {
        ctx.moveTo(WIDTH / 2, i);
        ctx.lineTo(WIDTH / 2, i + 10);
    }
    ctx.stroke();

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(paddleMargin, playerY, paddleWidth, paddleHeight);
    ctx.fillRect(WIDTH - paddleMargin - paddleWidth, aiY, paddleWidth, paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#4caf50";
    ctx.fill();
}

// Ball and game logic
function update() {
    // Ball movement
    ballX += ballVX * gameSpeed / 3;
    ballY += ballVY * gameSpeed / 3;

    // Wall collision
    if (ballY - ballRadius < 0) {
        ballY = ballRadius;
        ballVY *= -1;
    }
    if (ballY + ballRadius > HEIGHT) {
        ballY = HEIGHT - ballRadius;
        ballVY *= -1;
    }

    // Paddle collision (player)
    if (ballX - ballRadius < paddleMargin + paddleWidth) {
        if (ballY > playerY && ballY < playerY + paddleHeight) {
            ballX = paddleMargin + paddleWidth + ballRadius;
            ballVX *= -1;
            // Add some "spin"
            let hitPos = (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
            ballVY += hitPos * 2;
        } else if (ballX - ballRadius < 0) {
            // AI scores
            aiScore++;
            resetBall();
        }
    }

    // Paddle collision (AI)
    if (ballX + ballRadius > WIDTH - paddleMargin - paddleWidth) {
        if (ballY > aiY && ballY < aiY + paddleHeight) {
            ballX = WIDTH - paddleMargin - paddleWidth - ballRadius;
            ballVX *= -1;
            // Add some "spin"
            let hitPos = (ballY - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
            ballVY += hitPos * 2;
        } else if (ballX + ballRadius > WIDTH) {
            // Player scores
            playerScore++;
            resetBall();
        }
    }

    // AI movement (simple tracking)
    let aiCenter = aiY + paddleHeight / 2;
    if (aiCenter < ballY - 10) {
        aiY += (2 + gameSpeed) * 0.7;
    } else if (aiCenter > ballY + 10) {
        aiY -= (2 + gameSpeed) * 0.7;
    }
    aiY = Math.max(0, Math.min(HEIGHT - paddleHeight, aiY));

    // Update scores
    playerScoreElem.textContent = "Player: " + playerScore;
    aiScoreElem.textContent = "AI: " + aiScore;
}

function resetBall() {
    ballX = WIDTH / 2;
    ballY = HEIGHT / 2;
    // Randomize direction, but always towards loser
    let direction = (ballVX > 0) ? -1 : 1;
    let angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30 to +30 degrees
    ballSpeed = 5 + gameSpeed;
    ballVX = direction * ballSpeed * Math.cos(angle);
    ballVY = ballSpeed * Math.sin(angle);
}

// Main game loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Initial speed display
speedValue.textContent = gameSpeed;

// Start game
loop();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function adjustCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        // Portrait mode
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        // Landscape mode
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

function enterFullscreen() {
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) { // Firefox
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari and Opera
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { // IE/Edge
        canvas.msRequestFullscreen();
    }
}

window.addEventListener('orientationchange', () => {
    adjustCanvasSize();
});
window.addEventListener('resize', () => {
    adjustCanvasSize();
});

// Set canvas size
if(isMobileDevice()) {
    adjustCanvasSize();
}else {
    canvas.width = 1200;
    canvas.height = 700;
}

// Bird object
const bird = {
    x: 100,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    gravity: 0.6,
    lift: -8,
    velocity: 0
};

// Variables for pipe
let pipes = [];
// Adjust pipe properties for mobile
const pipeWidth = isMobileDevice() ? 60 : 80;
const pipeGap = isMobileDevice() ? 150 : 220;
let pipeSpeed = 5;
let pipeInterval = 1800;  // Time in milliseconds between pipe generation
let pipeTimer = 0;
// Variables for pipe movement
let pipeVerticalSpeed = 2;  // Speed at which the pipes move vertically
let pipeDirection = 1;      // 1 means down, -1 means up
const verticalMovementThreshold = 10; // Start moving pipes at score 10
const bufferZone = 10;  // Buffer to prevent stuttering

let gameStarted = false;
let gameOver = false;
let newGame = true;

let score = 0;
let scoreIncreaseThreshold = 5; // Increase difficulty every 50 points

let animationId;

const pipeImageTop = new Image();
pipeImageTop.src = 'images/gailsnailtop.png';  // Path to your top pipe image

const pipeImageBottom = new Image();
pipeImageBottom.src = 'images/gailsnailbot.png';  // Path to your top pipe image

const birdImage = new Image();
birdImage.src = 'images/flappybird.jpg';

// Generate new pipes
function createPipe() {
    const pipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    const pipe = {
        x: canvas.width,
        topHeight: pipeHeight,
        bottomHeight: canvas.height - pipeHeight - pipeGap,
        direction: Math.random() > 0.5 ? 1 : -1  // Randomize starting direction (1 = down, -1 = up)
    };
    pipes.push(pipe);
}

function drawPipes() {
    pipes.forEach(pipe => {
        if (score >= verticalMovementThreshold) {
            pipe.topHeight += pipeVerticalSpeed * pipeDirection;
            pipe.bottomHeight = canvas.height - pipe.topHeight - pipeGap;

            // Change direction if pipes reach the top or bottom limits with a buffer
            if (pipe.topHeight <= 0) {
                pipeDirection = 1;  // Start expanding the top pipe and shrinking the bottom pipe
            } else if (pipe.bottomHeight <= 0) {
                pipeDirection = -1;  // Start shrinking the top pipe and expanding the bottom pipe
            }
        }
        // Top pipe
        ctx.fillStyle = "green";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Bottom pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        // Check if the bird has successfully passed the pipe
        if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
            score++;
            pipe.passed = true;

            // Increase difficulty based on score
            if (score % scoreIncreaseThreshold === 0) {
                if(score > verticalMovementThreshold) {
                    pipeVerticalSpeed += 0.5;
                }
                pipeSpeed += 0.5; // Gradually increase the speed
                if(pipeInterval>800) {
                    pipeInterval -= 100;
                }
                
            }
        }
    });

    // Remove pipes that are off the screen
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function checkCollision() {
    pipes.forEach(pipe => {
        // Check collision with the top pipe
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + pipeWidth &&
            bird.y < pipe.topHeight
        ) {
            endGame();
        }

        // Check collision with the bottom pipe
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + pipeWidth &&
            bird.y + bird.height > canvas.height - pipe.bottomHeight
        ) {
            endGame();
        }
    });

    // Check if the bird hits the ground or goes off the top
    if (bird.y + bird.height >= canvas.height || bird.y < 0) {
        endGame();
    }
}

function endGame() {
    gameOver = true;
    ctx.font = '48px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);

    cancelAnimationFrame(animationId);

    // Display the restart button
    const restartBtn = document.createElement('button');
    restartBtn.innerText = 'Restart';
    restartBtn.style.position = 'absolute';
    restartBtn.style.left = `47.7%`;
    restartBtn.style.top = `55%`;
    restartBtn.style.padding = '15px 40px';
    restartBtn.style.fontSize = '20px';
    document.body.appendChild(restartBtn);

    restartBtn.addEventListener('click', () => {
        // Reset game state
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        pipes.length = 0;
        score = 0;
        pipeSpeed = 5;
        pipeInterval = 1800;
        pipeTimer = 0;
        bird.gravity = 0.6;
        gameStarted = false;
        gameOver = false;
        newGame = true;
        lastTime = performance.now();
 
        restartBtn.remove(); // Remove the button after restart
        gameLoop(); // Restart the game loop
    });
}

// Display score on screen
function drawScore() {
    ctx.font = '24px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`Score: ${score}`, 20, 40);
}

function flapBird() {
   // Remove any existing event listeners before adding a new one
   document.removeEventListener('keydown', handleFlap); 
   document.addEventListener('keydown', handleFlap);

   // Add touch event for mobile (tapping the screen)
   canvas.removeEventListener('touchstart', handleTap);
   canvas.addEventListener('touchstart', handleTap);
}

function handleFlap(event) {
    if (event.code === 'Space' && !gameOver) {
        if (!gameStarted) {
            gameStarted = true;
	    enterFullscreen();
        }
        bird.velocity = bird.lift;  // Move the bird upwards when space is pressed
        
    }
}

function handleTap() {
    // Handle the touch event, same as spacebar
    if (!gameOver) {
        if (!gameStarted) {
            gameStarted = true;
	    enterFullscreen();
        }
        bird.velocity = bird.lift;  // Move the bird upwards when the screen is tapped
        
    }
}

function applyGravity() {
    bird.velocity += bird.gravity;  // Apply gravity
    bird.y += bird.velocity;  // Update bird's position based on velocity
}

// Draw the bird
function drawBird() {
    // Draw the bird as a rectangle for now
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// Main game loop
let lastTime = performance.now();
function gameLoop() {
    let currentTime = performance.now();
    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // If the game hasn't started, show a "Press Space to Start" message
        if (!gameStarted) {
            ctx.font = '24px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText('Press Space to Start', canvas.width / 2 - 100, canvas.height / 2);
        } else {
            drawBird();
            applyGravity();
            drawPipes();
            updatePipes();
            checkCollision();
            drawScore();

            // Handle pipe generation
            pipeTimer += deltaTime;
            if (pipeTimer >= pipeInterval) {
                createPipe();
                pipeTimer = 0;
            }
        }

        animationId = requestAnimationFrame(gameLoop);
    }
}

flapBird();
gameLoop();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 1000;
canvas.height = 500;

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
const pipeWidth = 80; 
const pipeGap = 180;
let pipeSpeed = 5;
let pipeInterval = 1800;  // Time in milliseconds between pipe generation
let pipeTimer = 0;

let gameStarted = false;
let gameOver = false;

let score = 0;
let scoreIncreaseThreshold = 5; // Increase difficulty every 50 points

let newGame = true;

// Generate new pipes
function createPipe() {
    const pipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    const pipe = {
        x: canvas.width,
        topHeight: pipeHeight,
        bottomHeight: canvas.height - pipeHeight - pipeGap
    };
    pipes.push(pipe);
}

function drawPipes() {
    pipes.forEach(pipe => {
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
                pipeSpeed += 1; // Gradually increase the speed
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
        bird.gravity = 0.6;
        gameStarted = false;
        gameOver = false;
        newGame = true;
 
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
    // Handle user input (spacebar to flap)
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && !gameOver) {
            if (!gameStarted) {
                gameStarted = true;
            }
            bird.velocity = bird.lift;  // Move the bird upwards when space is pressed
        }
    });
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
function gameLoop() {
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
            if(newGame) {
                pipeTimer += 100; // Approximate frame time in milliseconds
                if (pipeTimer >= pipeInterval) {
                    createPipe();
                    pipeTimer = 0;
                    newGame = false;
                }
            } else {
                pipeTimer += 16; // Approximate frame time in milliseconds
                if (pipeTimer >= pipeInterval) {
                    createPipe();
                    pipeTimer = 0;
                }
            }
            
        }

        requestAnimationFrame(gameLoop);
    }
}

flapBird();
gameLoop();

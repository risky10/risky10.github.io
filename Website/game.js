document.addEventListener('DOMContentLoaded', function () {
    const colorButtons = document.querySelectorAll('.color-button');
    const startButton = document.getElementById('start-game');
    const statusDisplay = document.getElementById('status');
    const gameOverMessage = document.getElementById('game-over-message');
    const clickSound = new Audio('sounds/buzzer.wav');
    const wrongSound = new Audio('sounds/wrong.wav');

    let gameSequence = [];
    let playerSequence = [];
    let level = 0;
    let isPlayerTurn = false;

    // Define sound files for each color
    const sounds = {
        green: new Audio('sounds/green.wav'),
        red: new Audio('sounds/red.wav'),
        yellow: new Audio('sounds/yellow.wav'),
        blue: new Audio('sounds/blue.wav')
    };
    

    // Function to play sound based on color
    function playSound(color) {
        sounds[color].currentTime = 0; // Rewind to the start
        sounds[color].play();
    }

    // Flash the button to show sequence
    function flashButton(color) {
        const button = document.getElementById(color);
         // Change the image to the active (larger) version
         button.style.transform = 'scale(1.15)';

        setTimeout(() => {
            button.style.transform = '';
        }, 500);
    }

    // Generate a new color in the sequence
    function generateColor() {
        const colors = ['green', 'red', 'yellow', 'blue'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Play the full sequence to the player
    function playSequence() {
        let delay = 0;
        gameSequence.forEach(color => {
            setTimeout(() => {
                flashButton(color);
                playSound(color); // Play the corresponding sound
            }, delay);
            delay += 1000; // 1 second delay between each flash
        });

        setTimeout(() => {
            isPlayerTurn = true;
            //statusDisplay.textContent = 'Your turn!';
        }, delay);
    }

    // Start a new level
    function nextLevel() {
        playerSequence = [];
        level++;
        statusDisplay.textContent = `Level: ${level}`;
        gameOverMessage.classList.remove('show');
        colorButtons.forEach(button => button.classList.remove('disabled')); // Enable buttons
        const nextColor = generateColor();
        gameSequence.push(nextColor);
        playSequence();
    }

    // Start the game
    startButton.addEventListener('click', () => {
        gameSequence = [];
        level = 0;
        //statusDisplay.textContent = 'Starting...';
        gameOverMessage.classList.remove('show');
        colorButtons.forEach(button => button.classList.remove('disabled')); // Re-enable hover and active effects
        setTimeout(nextLevel, 1000);
    });

    // Handle player clicks
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!isPlayerTurn) return;

            const selectedColor = button.id;
            playerSequence.push(selectedColor);
            //flashButton(selectedColor);
            clickSound.play();

            // Check the player's input
            const currentMoveIndex = playerSequence.length - 1;
            if (playerSequence[currentMoveIndex] !== gameSequence[currentMoveIndex]) {
                gameOverMessage.classList.add('show'); // Show "Game Over"
                wrongSound.play();
                isPlayerTurn = false;
                colorButtons.forEach(button => button.classList.add('disabled')); // Disable hover and active effects
                return;
            }

            // Check if the player completed the sequence
            if (playerSequence.length === gameSequence.length) {
                isPlayerTurn = false;
                setTimeout(nextLevel, 1000);
            }
        });
    });
});

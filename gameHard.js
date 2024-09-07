document.addEventListener('DOMContentLoaded', function () {
    const colorButtons = document.querySelectorAll('.color-button');
    const startButton = document.getElementById('start-game');
    const statusDisplay = document.getElementById('status');
    const gameOverMessage = document.getElementById('game-over-message');
    const clickSound = new Audio('sounds/buzzer.wav');
    const gameoverSound = new Audio('sounds/wrong.wav');

    let gameSequence = [];
    let playerSequence = [];
    let level = 0;
    let isPlayerTurn = false;
    const originalOrder = [
        document.getElementById('mac'),
        document.getElementById('dennis'),
        document.getElementById('frank'),
        document.getElementById('charlie')
    ];
   
    colorButtons.forEach(button => button.classList.add('disabled'));

    // Define sound files for each color
    const sounds = {
        mac: new Audio('sounds/mac-chip.wav'),
        dennis: new Audio('sounds/dennis-bitch.wav'),
        frank: new Audio('sounds/frank-toe.wav'),
        charlie: new Audio('sounds/charlie-beak.wav')
    };
    

    // Function to play sound based on color
    function playSound(color) {
        sounds[color].currentTime = 0; // Rewind to the start
        sounds[color].play();
    }

    function resetImages() {
        const container = document.querySelector('.color-buttons-container');
        container.innerHTML = ''; // Clear the container
        originalOrder.forEach(button => container.appendChild(button)); // Restore original order
    }

    function shuffleImages() {
        const container = document.querySelector('.color-buttons-container');
        const buttons = Array.from(originalOrder);
    
        // Shuffle the array of buttons
        for (let i = buttons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
        }
    
        // Clear the container and append the buttons in the new order
        container.innerHTML = '';
        buttons.forEach(button => container.appendChild(button));
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
        const colors = ['dennis', 'mac', 'frank', 'charlie'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Play the full sequence to the player
    function playSequence() {
        let delay = 0;
        const colors = ['dennis', 'mac', 'frank', 'charlie'];
        colorButtons.forEach(button => button.classList.add('disabled'));
        gameSequence.forEach(color => {
            setTimeout(() => {
                flashButton(colors[Math.floor(Math.random() * colors.length)]);
                playSound(color); // Play the corresponding sound
            }, delay);
            delay += 1000; // 1 second delay between each flash
        });

        setTimeout(() => {
            isPlayerTurn = true;
            colorButtons.forEach(button => button.classList.remove('disabled'));
            shuffleImages();
            //statusDisplay.textContent = 'Your turn!';
        }, delay);
        
    }

    // Start a new level
    function nextLevel() {
        playerSequence = [];
        level++;
        statusDisplay.textContent = `Score: ${level}`;
        gameOverMessage.classList.remove('show');
        colorButtons.forEach(button => button.classList.remove('disabled')); // Enable buttons
        const nextColor = generateColor();
        gameSequence.push(nextColor);
        playSequence();
    }

    // Start the game
    startButton.addEventListener('click', () => {
        startButton.classList.add('hidden'); // Hide the Start Button
        document.getElementById('start-button-placeholder').style.display = 'block';
        gameSequence = [];
        level = 0;
        gameOverMessage.classList.remove('show');
        colorButtons.forEach(button => button.classList.remove('disabled')); // Re-enable hover and active effects
        statusDisplay.style.top = '10px';
        statusDisplay.style.left = '20px';

        resetImages();
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
                document.getElementById('start-button-placeholder').style.display = 'none';
                startButton.classList.remove('hidden');
                statusDisplay.style.top = '65%';
                statusDisplay.style.left = '45%';
                gameoverSound.play();
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

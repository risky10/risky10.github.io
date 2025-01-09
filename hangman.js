const canvas = document.getElementById('hangmanCanvas');
const ctx = canvas.getContext('2d');
let word = '';
let guessedLetters = [];
let incorrectGuesses = 0;
let maxIncorrectGuesses = 4;
let wrongGuesses = [];
let gameOver = false;

function initializeGame() {
    word = 'example'.toUpperCase();  // Replace with API call for a random word
    guessedLetters = Array(word.length).fill('_');
    incorrectGuesses = 0;
    wrongGuesses = [];
    gameOver = false;

    // Reset the UI elements
    document.getElementById('wordDisplay').innerText = guessedLetters.join(' ');
    document.getElementById('wrongGuesses').innerText = `Wrong guesses: ${wrongGuesses.join(', ')}`;
    document.getElementById('message').innerText = '';  // Clear message

    // Ensure buttons are hidden on game start
    document.getElementById('restartButton').style.display = 'none';  
    document.getElementById('nextWordButton').style.display = 'none';
    
    // Clear the canvas for a fresh game
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    generateLetterButtons();
}

function generateLetterButtons() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letterContainer = document.getElementById('letterButtons');
    letterContainer.innerHTML = '';  // Clear the previous buttons

    letters.split('').forEach(letter => {
        const button = document.createElement('button');
        button.innerText = letter;
        button.id = `letter-${letter}`;
        button.onclick = () => makeGuess(letter);
        letterContainer.appendChild(button);
    });
}

function makeGuess(letter) {
    if (gameOver) return;

    letter = letter.toUpperCase();
    const button = document.getElementById(`letter-${letter}`);

    if (word.includes(letter)) {
        updateGuessedLetters(letter);
        if (button) button.disabled = true;  // Disable the button if correct
    } else if (!wrongGuesses.includes(letter) && incorrectGuesses < maxIncorrectGuesses) {
        wrongGuesses.push(letter);  // Track wrong guesses
        incorrectGuesses++;
        drawHangman();
        document.getElementById('wrongGuesses').innerText = `Wrong guesses: ${wrongGuesses.join(', ')}`;
        if (button) button.disabled = true;  // Disable the button if wrong
    }

    checkGameOver();
}

function updateGuessedLetters(guess) {
    word.split('').forEach((letter, index) => {
        if (letter === guess) {
            guessedLetters[index] = guess;
        }
    });
    document.getElementById('wordDisplay').innerText = guessedLetters.join(' ');
}

function drawHangman() {
    if (incorrectGuesses === 1) {
        ctx.beginPath();
        ctx.moveTo(100, 350);
        ctx.lineTo(200, 350);
        ctx.stroke();
    }
    if (incorrectGuesses === 2) {
        ctx.beginPath();
        ctx.moveTo(150, 350);
        ctx.lineTo(150, 100);
        ctx.stroke();
    }
    if (incorrectGuesses === 3) {
        ctx.beginPath();
        ctx.moveTo(150, 100);
        ctx.lineTo(250, 100);
        ctx.stroke();
    }
    if (incorrectGuesses === 4) {
        ctx.beginPath();
        ctx.moveTo(250, 150);
        ctx.lineTo(250, 100);
        ctx.stroke();
    }
}

function checkGameOver() {
    if (!guessedLetters.includes('_')) {
        document.getElementById('message').innerText = 'You win!';
        gameOver = true;
        disableAllButtons();
        document.getElementById('nextWordButton').style.display = 'block';
    } else if (incorrectGuesses >= maxIncorrectGuesses) {
        document.getElementById('message').innerText = `You lose! The word was: ${word}`;
        gameOver = true;
        disableAllButtons();
        document.getElementById('restartButton').style.display = 'block';
    }
}

function disableAllButtons() {
    document.querySelectorAll('#letterButtons button').forEach(button => {
        button.disabled = true;
    });
}

document.addEventListener('keydown', (event) => {
    const letter = event.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
        makeGuess(letter);
    }
});

function restartGame() {
    initializeGame();
}

function nextWord() {
    initializeGame();
}

// Start the game
initializeGame();
// Import necessary Firestore functions from the modular SDK
import { collection, query, orderBy, limit, getDocs, addDoc, deleteDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
export function initializeGame(db) {
    document.addEventListener('DOMContentLoaded', function () {
        displayHighscores('hard');
        const colorButtons = document.querySelectorAll('.color-button');
        const startButton = document.getElementById('start-game');
        const statusDisplay = document.getElementById('status');
        const gameOverMessage = document.getElementById('game-over-message');
        const clickSound = new Audio('sounds/buzzer.wav');
        const gameoverSound = new Audio('sounds/wrong.wav');

        let gameSequence = [];
        let playerSequence = [];
        let level = -1;
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

        async function submitScore(username, score, mode) {
            const collectionName = mode === 'hard' ? 'highscores_hard' : 'highscores_normal';
            const scoresRef = collection(db, collectionName);

            // Get the current top 10 scores
            const q = query(scoresRef, orderBy('score', 'desc'), orderBy('timestamp', 'asc'), limit(10));
            const querySnapshot = await getDocs(q);

            const scores = [];
            querySnapshot.forEach(doc => {
                scores.push({ id: doc.id, ...doc.data() });
            });

            // Check if the score qualifies to be in the top 10
            if (scores.length < 10 || score > scores[scores.length - 1].score) {
                if (scores.length === 10) {
                    // Remove the lowest score if top 10 is full
                    const lowestScoreDoc = doc(db, collectionName, scores[scores.length - 1].id);
                    await deleteDoc(lowestScoreDoc);
                }

                // Add the new score
                await addDoc(scoresRef, {
                    username: username,
                    score: score,
                    timestamp: Timestamp.now() // Add timestamp for sorting
                });
            }
        }

        async function displayHighscores(mode) {
            const collectionName = mode === 'hard' ? 'highscores_hard' : 'highscores_normal';
            const scoresRef = collection(db, collectionName);

            const q = query(scoresRef, orderBy('score', 'desc'), orderBy('timestamp', 'asc'), limit(10));
            const querySnapshot = await getDocs(q);

            const highscoreList = document.getElementById(`highscore-list-${mode}`);
            highscoreList.innerHTML = ''; // Clear existing scores

            querySnapshot.forEach((doc) => {
                const { username, score } = doc.data();
                const listItem = document.createElement('li');
                listItem.textContent = `${username}: ${score}`;
                highscoreList.appendChild(listItem);
            });
        }

        async function checkForHighscore(score, mode) {
            const collectionName = mode === 'hard' ? 'highscores_hard' : 'highscores_normal';
            const scoresRef = collection(db, collectionName);

            const q = query(scoresRef, orderBy('score', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);

            const scores = [];
            querySnapshot.forEach((doc) => {
                scores.push(doc.data().score);
            });

            // If the top 10 list is not full, or the player's score is higher than the lowest score
            return (scores.length < 10 || score > scores[scores.length - 1]);
        }

        function showHighscoreModal() {
            const modal = document.getElementById('highscore-modal');
            modal.style.display = 'block';
        }
        document.getElementById('submit-highscore').addEventListener('click', async function () {
            const username = document.getElementById('username-input').value;
            await submitScore(username, level, 'hard');
            const modal = document.getElementById('highscore-modal');
            modal.style.display = 'none';
            displayHighscores('hard');
        });

        function resetImages() {
            const container = document.querySelector('.color-buttons-container');
            container.innerHTML = ''; // Clear the container
            originalOrder.forEach(button => container.appendChild(button)); // Restore original order
        }

        function newSequence() {
            const colors = ['dennis', 'mac', 'frank', 'charlie'];
            for (let index = 0; index < level+1; index++) {
                gameSequence.push(colors[Math.floor(Math.random() * colors.length)]);
            }
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
            gameSequence = [];
            level++;
            statusDisplay.textContent = `Score: ${level}`;
            gameOverMessage.classList.remove('show');
            colorButtons.forEach(button => button.classList.remove('disabled')); // Enable buttons
            newSequence();
            playSequence();
        }

        // Start the game
        startButton.addEventListener('click', () => {
            startButton.classList.add('hidden'); // Hide the Start Button
            document.getElementById('start-button-placeholder').style.display = 'block';
            gameSequence = [];
            level = -1;
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
                    if(level !== 0) {
                        checkForHighscore(level, 'hard').then((isHighscore) => {
                            if (isHighscore) {
                                showHighscoreModal(); // Show custom highscore modal
                            }
                        });
                    }
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
}
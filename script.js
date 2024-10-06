const ROWS = 10; // Number of rows
const COLS = 10; // Number of columns
const BOMB_COUNT = 15; // Number of bombs
let board = [];
let gameOver = false;
let timer; // Variable to hold the timer interval
let timeElapsed = 0; // Time in seconds
let flagsPlaced = 0; // Counter for flags placed by the user

// Initialize the game
function initGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    placeBombs();
    calculateNumbers();
    renderBoard();
    resetTimer(); // Reset the timer when starting a new game
    gameOver = false; // Reset game over status
    flagsPlaced = 0; // Reset flags counter
    document.getElementById("congratulations").classList.add("hidden"); // Hide congratulations message
    document.body.classList.remove('winner'); // Reset background effect
    document.getElementById("leaderboard-form").classList.add("hidden"); // Hide leaderboard form
}

// Place bombs randomly on the board
function placeBombs() {
    let bombsPlaced = 0;

    while (bombsPlaced < BOMB_COUNT) {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);

        if (board[row][col] !== "💣") {
            board[row][col] = "💣";
            bombsPlaced++;
        }
    }
}

// Calculate numbers for each cell based on surrounding bombs
function calculateNumbers() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === "💣") {
                continue; // Skip bombs
            }
            let bombCount = 0;

            // Check surrounding cells
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = r + i;
                    const newCol = c + j;

                    // Ensure we stay within bounds
                    if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                        if (board[newRow][newCol] === "💣") {
                            bombCount++;
                        }
                    }
                }
            }
            board[r][c] = bombCount;
        }
    }
}

// Render the game board
function renderBoard() {
    const gameContainer = document.getElementById("game-container");
    gameContainer.innerHTML = ''; // Clear the board

    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.dataset.row = r;
            cellElement.dataset.col = c;

            cellElement.addEventListener("click", () => {
                if (!gameOver) {
                    handleCellClick(r, c);
                }
            });

            cellElement.addEventListener("contextmenu", (e) => {
                e.preventDefault(); // Prevent the default context menu
                if (!gameOver) {
                    toggleFlag(r, c);
                }
            });

            gameContainer.appendChild(cellElement);
        });
    });
}

// Handle cell click (left-click)
function handleCellClick(row, col) {
    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cellElement.classList.contains("flag")) {
        // If flagged, remove the flag and reveal it like a normal left-click
        cellElement.classList.remove("flag");
        cellElement.innerText = '';
        cellElement.style.backgroundColor = "#e0e0e0"; // Reset background before revealing
    }

    // Continue with revealing the cell
    if (!timer) {
        startTimer(); // Start the timer on the first click
    }

    if (board[row][col] === "💣") {
        gameOver = true;
        revealBombs();
        alert("Game Over! You clicked a bomb.");
        clearInterval(timer); // Stop the timer
    } else {
        revealCell(row, col);
        checkWinCondition(); // Check if the player has won after each click
    }
}

// Reveal the clicked cell and its number
function revealCell(row, col) {
    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cellElement.classList.add("revealed");
    cellElement.style.backgroundColor = "#fff"; // Set revealed cell background to white
    cellElement.innerText = board[row][col] > 0 ? board[row][col] : '';

    // If the cell has no surrounding bombs, reveal adjacent cells (recursive)
    if (board[row][col] === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                    const adjacentCell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                    if (!adjacentCell.classList.contains("revealed")) {
                        revealCell(newRow, newCol);
                    }
                }
            }
        }
    }
}

// Reveal all bombs when game is over
function revealBombs() {
    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell === "💣") {
                const bombCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                bombCell.classList.add("bomb");
                bombCell.innerText = "💣";
            }
        });
    });
}

// Check win condition
function checkWinCondition() {
    let correctlyFlaggedBombs = 0;
    let totalCellsRevealed = 0;

    // Loop through the board to count correctly flagged bombs and revealed cells
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cellElement = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);

            if (board[r][c] === "💣" && cellElement.classList.contains("flag")) {
                correctlyFlaggedBombs++;
            }
            if (cellElement.classList.contains("revealed")) {
                totalCellsRevealed++;
            }
        }
    }

    const totalCells = ROWS * COLS;
    const nonBombCells = totalCells - BOMB_COUNT;

    // Check if all bombs are correctly flagged and all other cells are revealed
    if (correctlyFlaggedBombs === BOMB_COUNT && totalCellsRevealed === nonBombCells) {
        gameOver = true;
        clearInterval(timer); // Stop the timer
        document.getElementById("congratulations").classList.remove("hidden"); // Show congratulations message
        document.body.classList.add('winner'); // Add background effect
        alert("Congratulations! You've successfully cleared the minefield!"); // Display alert

        // Show the leaderboard form after winning
        document.getElementById("leaderboard-form").classList.remove("hidden");
    }
}

// Toggle flag on right-click
function toggleFlag(row, col) {
    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cellElement.classList.contains("flag")) {
        // Remove flag and reset to initial state
        cellElement.classList.remove("flag");
        cellElement.innerText = '';
        cellElement.style.backgroundColor = "#e0e0e0"; // Reset to unexplored state color
        flagsPlaced--;
    } else if (!cellElement.classList.contains("revealed")) {
        // Add a flag
        cellElement.classList.add("flag");
        cellElement.innerText = '🚩';
        flagsPlaced++;
    }
}

// Start the timer
function startTimer() {
    timer = setInterval(() => {
        timeElapsed++;
        document.getElementById("timer").innerText = `Time: ${timeElapsed} seconds`;
    }, 1000);
}

// Reset the timer
function resetTimer() {
    clearInterval(timer); // Stop any existing timer
    timer = null; // Reset timer variable
    timeElapsed = 0; // Reset elapsed time
    document.getElementById("timer").innerText = "Time: 0 seconds"; // Reset timer display
}

// Reset the game
document.getElementById("reset-button").addEventListener("click", initGame);

// Add this new function
function updateLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = ''; // Clear the current leaderboard
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Sort leaderboard by time
    leaderboard.sort((a, b) => a.time - b.time);

    // Display the top 5 scores
    leaderboard.slice(0, 5).forEach(entry => {
        const listItem = document.createElement("li");
        listItem.textContent = `${entry.name}: ${entry.time} seconds`;
        leaderboardList.appendChild(listItem);
    });
}

// Add this function to handle submission
function handleLeaderboardSubmission() {
    const playerName = document.getElementById("player-name").value;
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    leaderboard.push({ name: playerName, time: timeElapsed });
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    document.getElementById("leaderboard-form").reset(); // Reset the form
    updateLeaderboard(); // Update the displayed leaderboard
}

// Load the leaderboard on page load
window.onload = function () {
    updateLeaderboard();
};

// Add this event listener at the bottom of your script
document.getElementById("leaderboard-form").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload
    handleLeaderboardSubmission(); // Handle leaderboard submission
});

// Initialize the game on load
initGame();

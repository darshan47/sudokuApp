export const GRID_SIZE = 9;
export const BOX_SIZE = 3;

// Function to generate a valid Sudoku board
export function generateSudoku() {
  const board = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
  fillGrid(board);
  const puzzle = makePuzzle(board, 40); // Remove 40 cells for a medium difficulty puzzle
  return { puzzle, solution: board };
}

// Recursive function to fill the Sudoku grid
function fillGrid(board: number[][]): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        const numbers = shuffleArray(Array.from({ length: 9 }, (_, i) => i + 1));
        for (const num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillGrid(board)) {
              return true;
            }
            board[row][col] = 0; // Backtrack
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Function to remove numbers to create a puzzle
function makePuzzle(board: number[][], attempts: number): number[][] {
  const puzzle = board.map(row => [...row]); // Deep copy
  let count = attempts;
  while (count > 0) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (puzzle[row][col] !== 0) {
      const backup = puzzle[row][col];
      puzzle[row][col] = 0;

      const tempBoard = puzzle.map(r => [...r]);
      const numberOfSolutions = countSolutions(tempBoard);

      if (numberOfSolutions !== 1) {
        puzzle[row][col] = backup; // Restore if multiple solutions
      } else {
        count--;
      }
    }
  }
  return puzzle;
}

// Function to count the number of solutions for a given Sudoku board
function countSolutions(board: number[][]): number {
  let solutions = 0;
  function solveAndCount(currentBoard: number[][]) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentBoard[row][col] === 0) {
          for (let num = 1; num <= GRID_SIZE; num++) {
            if (isValid(currentBoard, row, col, num)) {
              currentBoard[row][col] = num;
              solveAndCount(currentBoard);
              currentBoard[row][col] = 0; // Backtrack
            }
          }
          return;
        }
      }
    }
    solutions++;
  }
  solveAndCount(board);
  return solutions;
}

// Function to check if a number can be placed at a given position
export function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < GRID_SIZE; x++) {
    if (x !== col && board[row][x] === num) {
      return false;
    }
  }

  // Check column
  for (let x = 0; x < GRID_SIZE; x++) {
    if (x !== row && board[x][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if ((startRow + i !== row || startCol + j !== col) && board[startRow + i][startCol + j] === num) {
        return false;
      }
    }
  }

  return true;
}

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to solve a Sudoku board (using backtracking)
export function solveSudoku(board: number[][]): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= GRID_SIZE; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = 0; // Backtrack
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Function to check if the Sudoku board is completely filled and valid
export function checkBoard(board: number[][]): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        return false; // Not all cells are filled
      }
      const num = board[row][col];
      board[row][col] = 0; // Temporarily remove to check validity of this number
      if (!isValid(board, row, col, num)) {
        board[row][col] = num; // Put it back
        return false; // Invalid number
      }
      board[row][col] = num; // Put it back
    }
  }
  return true; // All cells filled and valid
} 
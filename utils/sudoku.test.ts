import { generateSudoku, isValid, solveSudoku, checkBoard, GRID_SIZE } from './sudoku';

describe('Sudoku Logic', () => {
  let emptyBoard: number[][];
  let solvedBoard: number[][];
  let validPuzzle: number[][];
  let unsolvableBoard: number[][];

  beforeEach(() => {
    emptyBoard = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    solvedBoard = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];
    validPuzzle = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];
    unsolvableBoard = [
      [1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
  });

  it('isValid should correctly validate number placement', () => {
    // Test valid placement
    expect(isValid(emptyBoard, 0, 0, 1)).toBe(true);

    // Test invalid placement in row
    const boardWithRowConflict = emptyBoard.map(row => [...row]);
    boardWithRowConflict[0][0] = 1;
    expect(isValid(boardWithRowConflict, 0, 1, 1)).toBe(false);

    // Test invalid placement in column
    const boardWithColConflict = emptyBoard.map(row => [...row]);
    boardWithColConflict[0][0] = 1;
    expect(isValid(boardWithColConflict, 1, 0, 1)).toBe(false);

    // Test invalid placement in 3x3 box
    const boardWithBoxConflict = emptyBoard.map(row => [...row]);
    boardWithBoxConflict[0][0] = 1;
    expect(isValid(boardWithBoxConflict, 1, 1, 1)).toBe(false);

    // Test valid placement in a partially filled board
    const partiallyFilledBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    expect(isValid(partiallyFilledBoard, 0, 0, 1)).toBe(true); // Should be true, row 0 is empty
    expect(isValid(partiallyFilledBoard, 3, 0, 1)).toBe(false); // Should be false, 1 is in row 3
  });

  it('solveSudoku should correctly solve a valid puzzle', () => {
    const puzzleToSolve = validPuzzle.map(row => [...row]);
    expect(solveSudoku(puzzleToSolve)).toBe(true);
    expect(puzzleToSolve).toEqual(solvedBoard);
  });

  it('solveSudoku should return false for an unsolvable puzzle', () => {
    const puzzleToSolve = unsolvableBoard.map(row => [...row]);
    expect(solveSudoku(puzzleToSolve)).toBe(false);
  });

  it('generateSudoku should create a valid and solvable puzzle', () => {
    const { puzzle, solution } = generateSudoku();

    // Check if puzzle and solution are 9x9
    expect(puzzle.length).toBe(GRID_SIZE);
    expect(puzzle.every(row => row.length === GRID_SIZE)).toBe(true);
    expect(solution.length).toBe(GRID_SIZE);
    expect(solution.every(row => row.length === GRID_SIZE)).toBe(true);

    // Check if the solution is valid
    const tempSolutionBoard = solution.map(row => [...row]);
    expect(checkBoard(tempSolutionBoard)).toBe(true);

    // Check if the puzzle has a unique solution (by trying to solve it)
    const puzzleCopy = puzzle.map(row => [...row]);
    expect(solveSudoku(puzzleCopy)).toBe(true);
    expect(checkBoard(puzzleCopy)).toBe(true);
  });

  it('checkBoard should return true for a correctly filled board', () => {
    expect(checkBoard(solvedBoard.map(row => [...row]))).toBe(true);
  });

  it('checkBoard should return false for an incomplete board', () => {
    expect(checkBoard(validPuzzle.map(row => [...row]))).toBe(false);
  });

  it('checkBoard should return false for an incorrect board', () => {
    const incorrectBoard = solvedBoard.map(row => [...row]);
    incorrectBoard[0][0] = 1; // Change a valid number to make it incorrect
    expect(checkBoard(incorrectBoard)).toBe(false);
  });
}); 
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme, FAB, Snackbar } from 'react-native-paper';
import { generateSudoku, isValid, solveSudoku, checkBoard, GRID_SIZE } from '@/utils/sudoku';
import MaterialSudokuBoard from '@/components/MaterialSudokuBoard';
import MaterialNumberPicker from '@/components/MaterialNumberPicker';

const { height } = Dimensions.get('window');

export default function SudokuGame() {
  const theme = useTheme();
  const [board, setBoard] = useState<number[][] | null>(null);
  const [initialBoard, setInitialBoard] = useState<number[][] | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const startNewGame = useCallback(() => {
    const { puzzle } = generateSudoku();
    setBoard(puzzle.map(row => [...row]));
    setInitialBoard(puzzle.map(row => [...row]));
    setSelectedCell(null);
    setHighlightedCells(new Set());
    setInvalidCells(new Set());
    setIsComplete(false);
    setShowHint(false);
    setShowPicker(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const clearSelection = () => {
    setSelectedCell(null);
    setShowPicker(false);
    setHighlightedCells(new Set());
  };

  const handleCellPress = (row: number, col: number) => {
    if (!board || !initialBoard || isComplete) return;

    // If clicking on the same cell, toggle the picker
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setShowPicker(!showPicker);
      return;
    }

    // If clicking on a different cell, change selection
    setSelectedCell({ row, col });
    setShowPicker(true);
    setShowHint(false);

    // Highlight related cells
    const newHighlightedCells = new Set<string>();
    
    // Highlight row and column
    for (let i = 0; i < GRID_SIZE; i++) {
      newHighlightedCells.add(`${row}-${i}`);
      newHighlightedCells.add(`${i}-${col}`);
    }

    // Highlight 3x3 box
    const startBoxRow = Math.floor(row / 3) * 3;
    const startBoxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        newHighlightedCells.add(`${startBoxRow + i}-${startBoxCol + j}`);
      }
    }

    setHighlightedCells(newHighlightedCells);
  };

  const handleNumberSelect = (num: number) => {
    if (!selectedCell || !board || !initialBoard) return;

    const { row, col } = selectedCell;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;

    // Check if the move is valid
    const isValidMove = num === 0 || isValid(newBoard, row, col, num);
    
    if (isValidMove) {
      setBoard(newBoard);
      setInvalidCells(new Set());
      
      // Check if puzzle is complete
      if (checkBoard(newBoard)) {
        setIsComplete(true);
        setSnackbarMessage('Congratulations! Puzzle completed!');
        setSnackbarVisible(true);
      }
    } else {
      // Show invalid move
      setInvalidCells(new Set([`${row}-${col}`]));
      setSnackbarMessage('Invalid move!');
      setSnackbarVisible(true);
    }

    setShowPicker(false);
    // Keep selectedCell so user can continue selecting numbers for the same cell
    setHighlightedCells(new Set());
  };

  const handleSolve = () => {
    if (!board || !initialBoard) return;

    Alert.alert(
      'Solve Puzzle',
      'This will automatically solve the puzzle. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Solve',
          onPress: () => {
            const solvedBoard = board.map(row => [...row]); // Create a copy
            const isSolved = solveSudoku(solvedBoard);
            if (isSolved) {
              setBoard(solvedBoard);
              setIsComplete(true);
              setSnackbarMessage('Puzzle solved!');
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const handleHint = () => {
    if (!board || !initialBoard || isComplete) return;

    // Find an empty cell and fill it with the correct number
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === 0) {
          const solvedBoard = board.map(r => [...r]); // Create a copy
          const isSolved = solveSudoku(solvedBoard);
          if (isSolved) {
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = solvedBoard[row][col];
            setBoard(newBoard);
            setSnackbarMessage('Hint applied!');
            setSnackbarVisible(true);
            return;
          }
        }
      }
    }
  };

  if (!board || !initialBoard) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium">Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="headlineLarge" style={{ color: theme.colors.onBackground }}>
            Sudoku
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Fill in the numbers 1-9
          </Text>
        </View>

        <MaterialSudokuBoard
          board={board}
          initialBoard={initialBoard}
          selectedCell={selectedCell}
          highlightedCells={highlightedCells}
          onCellPress={handleCellPress}
          invalidCells={invalidCells}
        />

        <View style={styles.controls}>
          <Button
            mode="outlined"
            onPress={handleHint}
            disabled={isComplete}
            icon="lightbulb-outline"
            style={styles.controlButton}
          >
            Hint
          </Button>
          <Button
            mode="outlined"
            onPress={handleSolve}
            disabled={isComplete}
            icon="auto-fix"
            style={styles.controlButton}
          >
            Solve
          </Button>
          <Button
            mode="outlined"
            onPress={clearSelection}
            disabled={!selectedCell}
            icon="close-circle-outline"
            style={styles.controlButton}
          >
            Clear
          </Button>
          <Button
            mode="contained"
            onPress={startNewGame}
            icon="refresh"
            style={styles.controlButton}
          >
            New Game
          </Button>
        </View>
      </ScrollView>

      <MaterialNumberPicker
        visible={showPicker}
        onSelectNumber={handleNumberSelect}
        onClose={() => {
          setShowPicker(false);
          // Don't clear selectedCell here - let user click on another cell to change selection
          setHighlightedCells(new Set());
        }}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ backgroundColor: theme.colors.inverseSurface }}
      >
        <Text style={{ color: theme.colors.inverseOnSurface }}>
          {snackbarMessage}
        </Text>
      </Snackbar>

      {isComplete && (
        <FAB
          icon="trophy"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={startNewGame}
          label="New Game"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 2,
    marginVertical: 4,
    minWidth: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

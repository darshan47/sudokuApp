import React from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { GRID_SIZE, BOX_SIZE } from '../utils/sudoku';

const { width, height } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 48, 360); // Smaller board to prevent overlap
const CELL_SIZE = Math.floor(BOARD_SIZE / GRID_SIZE);

interface MaterialSudokuBoardProps {
  board: number[][];
  initialBoard: number[][];
  selectedCell: { row: number; col: number } | null;
  highlightedCells: Set<string>;
  onCellPress: (row: number, col: number) => void;
  invalidCells?: Set<string>;
}

export default function MaterialSudokuBoard({
  board,
  initialBoard,
  selectedCell,
  highlightedCells,
  onCellPress,
  invalidCells = new Set(),
}: MaterialSudokuBoardProps) {
  const theme = useTheme();

  const getCellStyle = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isHighlighted = highlightedCells.has(cellKey);
    const isInitial = initialBoard[row][col] !== 0;
    const isInvalid = invalidCells.has(cellKey);

    let backgroundColor = theme.colors.surface;
    let borderColor = theme.colors.outline;
    let borderWidth = 1;

    // Major borders for 3x3 boxes
    if (row % BOX_SIZE === 0) borderWidth = 2;
    if (col % BOX_SIZE === 0) borderWidth = 2;
    if (row % BOX_SIZE === 0 && col % BOX_SIZE === 0) borderWidth = 3;

    if (isSelected) {
      backgroundColor = theme.colors.primaryContainer;
      borderColor = theme.colors.primary;
      borderWidth = 3;
    } else if (isHighlighted) {
      backgroundColor = theme.colors.secondaryContainer;
    } else if (isInvalid) {
      backgroundColor = theme.colors.errorContainer;
      borderColor = theme.colors.error;
    } else if (isInitial) {
      backgroundColor = theme.colors.surfaceVariant;
    }

    return {
      backgroundColor,
      borderColor,
      borderWidth,
    };
  };

  const getTextStyle = (row: number, col: number) => {
    const isInitial = initialBoard[row][col] !== 0;
    const isInvalid = invalidCells.has(`${row}-${col}`);

    let color = theme.colors.onSurface;
    let fontWeight: 'normal' | 'bold' = 'normal';

    if (isInitial) {
      color = theme.colors.onSurfaceVariant;
      fontWeight = 'bold';
    } else if (isInvalid) {
      color = theme.colors.onErrorContainer;
      fontWeight = 'bold';
    }

    return {
      color,
      fontWeight,
    };
  };

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <Pressable
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  getCellStyle(rowIndex, colIndex),
                ]}
                onPress={() => onCellPress(rowIndex, colIndex)}
              >
                <Text
                  variant="titleLarge"
                  style={[
                    styles.cellText,
                    getTextStyle(rowIndex, colIndex),
                  ]}
                >
                  {cell !== 0 ? cell.toString() : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 12,
    borderRadius: 16,
    alignSelf: 'center',
  },
  board: {
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#6750A4',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  cellText: {
    textAlign: 'center',
    fontSize: 20,
  },
});

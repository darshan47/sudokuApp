import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated, Pressable } from 'react-native';
import { generateSudoku, isValid, solveSudoku, checkBoard, GRID_SIZE, BOX_SIZE } from '@/utils/sudoku';
import NumberPicker from '../components/NumberPicker';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 40) / GRID_SIZE);
const BORDER_WIDTH = 1;
const MAJOR_BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Dimensions.get('window').height * 0.1,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  boardContainer: {
    borderWidth: MAJOR_BORDER_WIDTH,
    borderColor: '#2C3E50',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 40,
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cellText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333333',
  },
  initialCell: {
    backgroundColor: '#ECEFF1',
    elevation: 1,
    shadowOpacity: 0.05,
  },
  initialText: {
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  selectedCell: {
    backgroundColor: '#C3E6F3',
    borderColor: '#3498DB',
    borderWidth: 2,
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  highlightedCell: {
    backgroundColor: '#EAF6FA',
    elevation: 1,
    shadowOpacity: 0.05,
  },
  invalidCell: {
    backgroundColor: '#FFEBEE',
    elevation: 3,
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  invalidText: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999,
  },
  hintContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
    zIndex: 1000,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  dismissHintButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  dismissHintText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  invalidMoveHintContainer: {
    position: 'absolute',
    top: '50%',
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    zIndex: 1001,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  invalidMoveHintText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default function Index() {
  const router = useRouter();
  const [sudokuBoard, setSudokuBoard] = useState<number[][] | null>(null);
  const [initialBoard, setInitialBoard] = useState<number[][] | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const [pickerDimensions, setPickerDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLongPressHint, setShowLongPressHint] = useState(true);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [showInvalidMoveHint, setShowInvalidMoveHint] = useState(false);
  const [boardLayout, setBoardLayout] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const invalidMoveFadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const { puzzle } = generateSudoku();
      setSudokuBoard(puzzle);
      setInitialBoard(puzzle.map(row => [...row]));
      setSelectedCell(null);
      setPickerPosition(null);
      setIsLoading(false);
      setShowLongPressHint(true);
      fadeAnim.setValue(1);
      setHighlightedCells(new Set());
      setShowInvalidMoveHint(false);
      requestAnimationFrame(() => {
        invalidMoveFadeAnim.setValue(0);
        slideAnim.setValue(300);
      });
    }, 50);
  }, [fadeAnim, invalidMoveFadeAnim, slideAnim]);

  useEffect(() => {
    if (showLongPressHint) {
      const timer = setTimeout(() => {
        Animated.timing(
          fadeAnim,
          {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }
        ).start(() => setShowLongPressHint(false));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showLongPressHint, fadeAnim]);

  const handleCellPress = (row: number, col: number) => {
    setPickerPosition(null);
    setSelectedCell(null);
    setHighlightedCells(new Set());

    if (!(selectedCell?.row === row && selectedCell?.col === col)) {
      setSelectedCell({ row, col });
      setShowLongPressHint(false);

      const newHighlightedCells = new Set<string>();
      for (let i = 0; i < GRID_SIZE; i++) {
        newHighlightedCells.add(`${row}-${i}`);
        newHighlightedCells.add(`${i}-${col}`);
      }

      const startBoxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
      const startBoxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
      for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
          newHighlightedCells.add(`${startBoxRow + i}-${startBoxCol + j}`);
        }
      }
      setHighlightedCells(newHighlightedCells);

      if (initialBoard && initialBoard[row][col] === 0) {
        setPickerPosition({ x: 0, y: 0 });
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        setPickerPosition(null);
      }
    } else {
      if (pickerPosition) {
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setPickerPosition(null);
          setSelectedCell(null);
          setHighlightedCells(new Set());
        });
      }
    }
  };

  const handleNumberSelect = (num: number) => {
    if (selectedCell && sudokuBoard && initialBoard) {
      const { row, col } = selectedCell;

      const tempBoard = sudokuBoard.map(r => [...r]);
      tempBoard[row][col] = num;

      if (initialBoard[row][col] === 0) {
        if (num === 0 || isValid(tempBoard, row, col, num)) {
          const newBoard = sudokuBoard.map(r => [...r]);
          newBoard[row][col] = num;

          requestAnimationFrame(() => {
            setSudokuBoard(newBoard);

            Animated.timing(slideAnim, {
              toValue: 300,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setSelectedCell(null);
              setPickerPosition(null);
              setHighlightedCells(new Set());
            });

            setShowInvalidMoveHint(false);
            Animated.timing(invalidMoveFadeAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }).start(() => setShowInvalidMoveHint(false));
          });
        } else {
          setShowInvalidMoveHint(true);
          invalidMoveFadeAnim.setValue(1);
          requestAnimationFrame(() => {
            setTimeout(() => {
              Animated.timing(
                invalidMoveFadeAnim,
                {
                  toValue: 0,
                  duration: 1500,
                  delay: 1000,
                  useNativeDriver: true,
                }
              ).start(() => setShowInvalidMoveHint(false));
            }, 0);
          });
        }
      }
    }
  };

  const handlePickerClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setPickerPosition(null);
      setSelectedCell(null);
      setHighlightedCells(new Set());
    });
  }, [slideAnim]);

  const onLongPress = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert(
        'Game Options',
        'What would you like to do?',
        [
          { text: 'New Game', onPress: startNewGame },
          { text: 'Solve Puzzle', onPress: handleSolve },
          { text: 'Check Board', onPress: handleCheck },
          { text: 'Reset Board', onPress: handleClear },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleSolve = () => {
    if (sudokuBoard) {
      const boardToSolve = sudokuBoard.map(row => [...row]);
      if (solveSudoku(boardToSolve)) {
        setSudokuBoard(boardToSolve);
        Alert.alert('Sudoku Solved!', 'The puzzle has been successfully solved.', [{ text: 'OK', style: 'cancel' }]);
      } else {
        Alert.alert('No Solution', 'This Sudoku board currently has no valid solution.', [{ text: 'OK', style: 'cancel' }]);
      }
    }
    setSelectedCell(null);
    setPickerPosition(null);
    setHighlightedCells(new Set());
  };

  const handleCheck = () => {
    if (sudokuBoard) {
      if (checkBoard(sudokuBoard.map(row => [...row]))) {
        Alert.alert('Board is Correct!', 'Congratulations, your Sudoku board is correct!', [{ text: 'OK', style: 'cancel' }]);
      } else {
        Alert.alert('Board is Incorrect', 'Some numbers are placed incorrectly or the board is not complete.', [{ text: 'OK', style: 'cancel' }]);
      }
    }
    setSelectedCell(null);
    setPickerPosition(null);
    setHighlightedCells(new Set());
  };

  const handleClear = () => {
    if (initialBoard) {
      setSudokuBoard(initialBoard.map(row => [...row]));
      setSelectedCell(null);
      setPickerPosition(null);
      setHighlightedCells(new Set());
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text>Play</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/versus')}>
        <Text>Versus Mode</Text>
      </TouchableOpacity>
      <Text style={{
        fontFamily: 'sans-serif',
        fontSize: 84,
        fontWeight: '800',
        marginBottom: 10,
        color: '#2C3E50',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
      }}>सुडोकू</Text>
      {showLongPressHint && (
        <Animated.View style={[styles.hintContainer, { opacity: fadeAnim }]}>
          <Text style={styles.hintText}>Long press the board for game options!</Text>
          <TouchableOpacity onPress={() => setShowLongPressHint(false)}>
            <Text style={styles.dismissHintText}>Got It!</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {showInvalidMoveHint && (
        <Animated.View style={[styles.invalidMoveHintContainer, { opacity: invalidMoveFadeAnim }]}>
          <Text style={styles.invalidMoveHintText}>Invalid Move!</Text>
        </Animated.View>
      )}
      <LongPressGestureHandler
        onHandlerStateChange={onLongPress}
        minDurationMs={500}>
        <Animated.View
          style={[
            styles.boardContainer,
            { opacity: isLoading ? 0.5 : 1 }
          ]}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setBoardLayout({ x, y, width, height });
          }}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : sudokuBoard ? (
            sudokuBoard.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => {
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isInitial = initialBoard && initialBoard[rowIndex][colIndex] !== 0;
                  const isInvalid = !isInitial && sudokuBoard && sudokuBoard[rowIndex][colIndex] !== 0 && !isValid(sudokuBoard.map(r => [...r]), rowIndex, colIndex, sudokuBoard[rowIndex][colIndex]);
                  const isHighlighted = highlightedCells.has(`${rowIndex}-${colIndex}`);

                  return (
                    <TouchableOpacity
                      key={colIndex}
                      style={[
                        styles.cell,
                        {
                          borderLeftWidth: colIndex % BOX_SIZE === 0 ? MAJOR_BORDER_WIDTH : BORDER_WIDTH,
                          borderTopWidth: rowIndex % BOX_SIZE === 0 ? MAJOR_BORDER_WIDTH : BORDER_WIDTH,
                          borderRightWidth: (colIndex + 1) % BOX_SIZE === 0 && colIndex !== GRID_SIZE - 1 ? MAJOR_BORDER_WIDTH : BORDER_WIDTH,
                          borderBottomWidth: (rowIndex + 1) % BOX_SIZE === 0 && rowIndex !== GRID_SIZE - 1 ? MAJOR_BORDER_WIDTH : BORDER_WIDTH,
                          borderColor: (colIndex % BOX_SIZE === 0 || rowIndex % BOX_SIZE === 0 || (colIndex + 1) % BOX_SIZE === 0 || (rowIndex + 1) % BOX_SIZE === 0) ? '#2C3E50' : '#BBBBBB',
                        },
                        isSelected && styles.selectedCell,
                        isInitial && styles.initialCell,
                        isInvalid && styles.invalidCell,
                        isHighlighted && !isSelected && styles.highlightedCell,
                      ]}
                      onPress={() => handleCellPress(rowIndex, colIndex)}>
                      <Text style={[styles.cellText, isInitial && styles.initialText, isInvalid && styles.invalidText]}>
                        {cell !== 0 ? cell : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          ) : (
            <Text>Failed to load Sudoku board.</Text>
          )}
        </Animated.View>
      </LongPressGestureHandler>
      {pickerPosition && (
        <View style={styles.pickerOverlay}>
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <NumberPicker
              onSelectNumber={handleNumberSelect}
              onClose={handlePickerClose}
              boardLayout={boardLayout}
              selectedCell={selectedCell}
              setPickerDimensions={setPickerDimensions}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

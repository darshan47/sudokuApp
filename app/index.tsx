import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated, Pressable } from 'react-native';
import { generateSudoku, isValid, solveSudoku, checkBoard, GRID_SIZE, BOX_SIZE } from '@/utils/sudoku';
import NumberPicker from '@/components/NumberPicker';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
// import { Audio } from 'expo-av'; // Commented out Audio import
// import { LinearGradient } from 'expo-linear-gradient'; // Comment out or remove if not used elsewhere
// import { BlurView } from 'expo-blur'; // Remove BlurView import for glass effect

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 40) / GRID_SIZE); // Revert to original cell size calculation
const BORDER_WIDTH = 1;
const MAJOR_BORDER_WIDTH = 2; // Revert to original major border thickness

export default function Index() {
  const [sudokuBoard, setSudokuBoard] = useState<number[][] | null>(null);
  const [initialBoard, setInitialBoard] = useState<number[][] | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const [pickerDimensions, setPickerDimensions] = useState<{ width: number; height: number } | null>(null); // Re-introduce pickerDimensions state
  const [isLoading, setIsLoading] = useState(true);
  const [showLongPressHint, setShowLongPressHint] = useState(true);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set()); // Corrected state for highlighted cells
  const [showInvalidMoveHint, setShowInvalidMoveHint] = useState(false); // Re-introduce state for invalid move hint
  const [boardLayout, setBoardLayout] = useState<{ x: number, y: number, width: number, height: number } | null>(null); // To store board layout

  // const soundObject = useRef<Audio.Sound | null>(null); // Commented out soundObject ref
  const fadeAnim = useRef(new Animated.Value(1)).current; // For hint fading
  const invalidMoveFadeAnim = useRef(new Animated.Value(0)).current; // For invalid move hint fading
  const slideAnim = useRef(new Animated.Value(300)).current; // Initial position off-screen below

  useEffect(() => {
    // Commented out sound loading logic
    // const loadSound = async () => {
    //   try {
    //     const { sound } = await Audio.Sound.createAsync(
    //       require('../assets/sounds/error.mp3')
    //     );
    //     soundObject.current = sound;
    //   } catch (error) {
    //     console.error('Error loading sound', error);
    //   }
    // };
    // loadSound();
    // return () => {
    //   soundObject.current?.unloadAsync();
    // };
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
      setShowLongPressHint(true); // Show hint again on new game
      fadeAnim.setValue(1); // Reset fade animation on new game
      setHighlightedCells(new Set()); // Clear highlights on new game
      setShowInvalidMoveHint(false); // Clear invalid move hint on new game
      requestAnimationFrame(() => {
        invalidMoveFadeAnim.setValue(0); // Reset invalid move fade animation on new game
        slideAnim.setValue(300); // Reset slide animation for picker
      });
    }, 50);
  }, [fadeAnim, invalidMoveFadeAnim, slideAnim]); // Add slideAnim to dependencies

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    if (showLongPressHint) {
      const timer = setTimeout(() => {
        Animated.timing(
          fadeAnim, // The animated value to drive
          {
            toValue: 0, // Animate to opacity 0
            duration: 1000, // Fade out over 1 second
            useNativeDriver: true, // Use native driver for performance
          }
        ).start(() => setShowLongPressHint(false)); // Hide completely after fade
      }, 5000); // Start fading after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showLongPressHint, fadeAnim]);

  const handleCellPress = (row: number, col: number) => {
    // Always dismiss the picker and clear selection first, regardless of which cell is pressed.
    setPickerPosition(null);
    setSelectedCell(null);
    setHighlightedCells(new Set());

    // If the newly pressed cell is different from the previously selected one, select it.
    // Or if there was no previously selected cell, select the current one.
    if (!(selectedCell?.row === row && selectedCell?.col === col)) {
      setSelectedCell({ row, col });
      setShowLongPressHint(false);

      const newHighlightedCells = new Set<string>();
      for (let i = 0; i < GRID_SIZE; i++) {
        newHighlightedCells.add(`${row}-${i}`); // Highlight row
        newHighlightedCells.add(`${i}-${col}`); // Highlight column
      }

      const startBoxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
      const startBoxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
      for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
          newHighlightedCells.add(`${startBoxRow + i}-${startBoxCol + j}`); // Highlight 3x3 box
        }
      }
      setHighlightedCells(newHighlightedCells);

      if (initialBoard && initialBoard[row][col] === 0) {
        setPickerPosition({ x: 0, y: 0 }); // Just a non-null value to trigger visibility
        Animated.timing(slideAnim, {
          toValue: 0, // Slide up to visible position
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        setPickerPosition(null);
      }
    } else { // If same cell is pressed again, or uneditable cell is pressed when picker is open
      if (pickerPosition) { // Only animate out if picker is currently visible
        Animated.timing(slideAnim, {
          toValue: 300, // Slide down off-screen
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

            // Animate picker out after correct selection
            Animated.timing(slideAnim, {
              toValue: 300, // Slide down off-screen
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setSelectedCell(null); // Clear selected cell after animation
              setPickerPosition(null); // Clear picker position after animation
              setHighlightedCells(new Set()); // Clear highlights after animation
            });

            // Hide invalid move hint after a valid move
            setShowInvalidMoveHint(false); // Always hide the hint state
            // Animate invalidMoveFadeAnim to 0 gracefully
            Animated.timing(invalidMoveFadeAnim, {
              toValue: 0,
              duration: 100, // Short duration for quick fade out
              useNativeDriver: true,
            }).start(() => setShowInvalidMoveHint(false)); // Ensure state is reset after animation
          });
        } else {
          // Invalid number, show aesthetic hint (sound commented out for now)
          // playErrorSound(); 
          setShowInvalidMoveHint(true);
          invalidMoveFadeAnim.setValue(1); // Ensure it starts fully visible
          // Use requestAnimationFrame to defer animation start
          requestAnimationFrame(() => {
            // Add a micro-task delay to further defer animation start
            setTimeout(() => {
              Animated.timing(
                invalidMoveFadeAnim,
                {
                  toValue: 0, // Fade out
                  duration: 1500, // Fade out over 1.5 seconds
                  delay: 1000, // Start fading after 1 second
                  useNativeDriver: true,
                }
              ).start(() => setShowInvalidMoveHint(false)); // Set state back to false after animation
            }, 0); // 0ms delay as a micro-task
          });
        }
      }
    }
    // setPickerPosition(null); // This is now handled by animation completion
    // setHighlightedCells(new Set()); // This is now handled by animation completion
  };

  // Custom onClose function for NumberPicker to handle animation
  const handlePickerClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 300, // Slide down off-screen
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
    setHighlightedCells(new Set()); // Clear highlights after solving
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
    setHighlightedCells(new Set()); // Clear highlights after checking
  };

  const handleClear = () => {
    if (initialBoard) {
      setSudokuBoard(initialBoard.map(row => [...row]));
      setSelectedCell(null);
      setPickerPosition(null);
      setHighlightedCells(new Set()); // Clear highlights after clearing
    }
  };

  if (isLoading || !sudokuBoard) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Sudoku...</Text>
      </View>
    );
  }

  return (
    <LongPressGestureHandler onHandlerStateChange={onLongPress} minDurationMs={800}>
      <View style={styles.container}>
        <Text style={styles.title}>Sudoku Master</Text>
        {showLongPressHint && (
          <Animated.View style={[styles.hintContainer, { opacity: fadeAnim }]}>
            <Text style={styles.hintText}>Long press the board for game options!</Text>
            <TouchableOpacity onPress={() => setShowLongPressHint(false)} style={styles.dismissHintButton}>
              <Text style={styles.dismissHintText}>Got It!</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        {showInvalidMoveHint && (
          <Animated.View style={[styles.invalidMoveHintContainer, { opacity: invalidMoveFadeAnim }]}> 
            <Text style={styles.invalidMoveHintText}>Invalid Move!</Text>
          </Animated.View>
        )}
        <View
          style={styles.boardContainer}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setBoardLayout({ x, y, width, height });
          }}>
          {sudokuBoard.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isInitial = initialBoard && initialBoard[rowIndex][colIndex] !== 0;
                const isInvalid = !isInitial && sudokuBoard[rowIndex][colIndex] !== 0 && !isValid(sudokuBoard.map(r => [...r]), rowIndex, colIndex, sudokuBoard[rowIndex][colIndex]);
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
                        // Set border color based on whether it's a major or minor border
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
          ))}
        </View>
        {pickerPosition && selectedCell && (initialBoard && initialBoard[selectedCell.row][selectedCell.col] === 0) && (
          <Animated.View style={[
            {
              position: 'absolute',
              left: (width - (pickerDimensions?.width || 228)) / 2, 
              bottom: 40,
              zIndex: 1000,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
            <NumberPicker
              onSelectNumber={handleNumberSelect}
              onClose={handlePickerClose}
              onLayout={(measuredWidth, measuredHeight) => {
                setPickerDimensions({ width: measuredWidth, height: measuredHeight });
              }} // Capture dimensions dynamically
            />
          </Animated.View>
        )}
      </View>
    </LongPressGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Align content to the top
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Changed to white background
    paddingTop: Dimensions.get('window').height * 0.1, // 10% from the top
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 10,
    color: '#2C3E50',
    fontFamily: 'Pacifico_400Regular', // Apply fancy font
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
    // letterSpacing: 1.5, // REMOVED to prevent potential font conflicts
    // console.log('Applied font family:', 'Pacifico_400Regular'), // Removed debugging log
  },
  boardContainer: {
    borderWidth: MAJOR_BORDER_WIDTH,
    borderColor: '#2C3E50',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 40,
    backgroundColor: '#FFFFFF', // White background for the board
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  // boardInnerContainer: { // Removed this style
  //   backgroundColor: 'transparent',
  // },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9', // Light gray background for cells
    elevation: 2, // Reverted elevation
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cellText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333333', // Dark text for numbers
  },
  initialCell: {
    backgroundColor: '#ECEFF1', // Slightly darker light gray for initial cells
    elevation: 1, // Reverted elevation
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
    elevation: 4, // Reverted elevation
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  highlightedCell: {
    backgroundColor: '#EAF6FA', // Reverted background color for highlighted cells
    elevation: 1, // Reverted elevation
    shadowOpacity: 0.05,
  },
  invalidCell: {
    backgroundColor: '#FFEBEE', // Reverted background for invalid cells
    elevation: 3, // Reverted elevation
    shadowOpacity: 0.15,
  },
  invalidText: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  controlButtonContainer: {
    display: 'none',
  },
  controlButton: {},
  controlButtonText: {},
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Changed to transparent to prevent darkening
    justifyContent: 'flex-end', // Push content to the bottom
    alignItems: 'center',
    zIndex: 999, // Ensure it's above the board but below hints
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
  // Remove boardGradientWrapper styles
}); 
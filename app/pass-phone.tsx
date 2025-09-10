import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { generateSudoku, isValid, solveSudoku, checkBoard, GRID_SIZE, BOX_SIZE } from '@/utils/sudoku';
import NumberPicker from '../components/NumberPicker';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
// Dynamic cell sizing based on screen dimensions - ensure everything fits
const getCellSize = (isCurrentPlayer: boolean) => {
  // Calculate available space - more conservative allocation
  const headerHeight = height * 0.05; // 5% for minimal header space
  const pickerHeight = height * 0.22; // 22% for number picker (2 rows) - increased
  const spacing = height * 0.10; // 10% for margins/padding/separator - increased
  const availableHeight = height - headerHeight - pickerHeight - spacing;
  
  // Each player gets half the available height
  const playerHeight = availableHeight / 2;
  const baseCellSize = Math.floor(playerHeight / GRID_SIZE);
  
  // More conservative sizes to ensure everything fits
  const minSize = Math.floor(width * 0.06); // 6% of screen width (reduced)
  const maxSize = Math.floor(width * 0.10); // 10% of screen width (reduced)
  
  return Math.max(minSize, Math.min(maxSize, baseCellSize));
};
const BORDER_WIDTH = 1;
const MAJOR_BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.02, // 2% of screen width
    minHeight: height,
  },
  playerSection: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: height * 0.003, // 0.3% of screen height - reduced
    marginVertical: height * 0.003, // 0.3% of screen height - reduced
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.003, // 0.3% of screen height - reduced
    width: '100%',
    justifyContent: 'space-between',
  },
  playerTitle: {
    fontSize: Math.floor(width * 0.045), // 4.5% of screen width
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  playerTurn: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
  },
  boardContainer: {
    borderWidth: MAJOR_BORDER_WIDTH,
    borderColor: '#2C3E50',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
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
  rowHighlight: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  columnHighlight: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
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
  numberPickerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: height * 0.003, // 0.3% of screen height - further reduced
    paddingHorizontal: width * 0.015, // 1.5% of screen width - further reduced
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: height * 0.002, // 0.2% of screen height - further reduced
    marginBottom: height * 0.002, // 0.2% of screen height - further reduced
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 6,
  },
  pickerAbovePlayer1: {
    // Picker appears above Player 1's board
    marginBottom: height * 0.01,
  },
  pickerBottom: {
    // Picker appears at bottom for Player 2
    marginTop: height * 0.01,
  },
  winnerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  winnerText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  winnerButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 5,
  },
  winnerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  invalidMoveHintContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  invalidMoveHintText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  boardsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  versusIndicator: {
    fontSize: Math.floor(width * 0.04), // 4% of screen width
    fontWeight: 'bold',
    color: '#E74C3C',
    marginVertical: height * 0.005, // 0.5% of screen height
    textAlign: 'center',
  },
  invertedBoard: {
    transform: [{ rotate: '180deg' }],
  },
  boardSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.01, // 1% of screen height
    marginVertical: height * 0.005, // 0.5% of screen height
  },
  separatorLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: width * 0.02, // 2% of screen width
  },
  separatorDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8E24AA',
    marginHorizontal: 4,
  },
});

export default function VersusMode() {
  const router = useRouter();
  const [player1Board, setPlayer1Board] = useState<number[][] | null>(null);
  const [player2Board, setPlayer2Board] = useState<number[][] | null>(null);
  const [player1Initial, setPlayer1Initial] = useState<number[][] | null>(null);
  const [player2Initial, setPlayer2Initial] = useState<number[][] | null>(null);
  const [selectedCell1, setSelectedCell1] = useState<{ row: number; col: number } | null>(null);
  const [selectedCell2, setSelectedCell2] = useState<{ row: number; col: number } | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const [pickerDimensions, setPickerDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Removed currentPlayer state - both players can play simultaneously
  const [winner, setWinner] = useState<number | null>(null);
  const [showInvalidMoveHint, setShowInvalidMoveHint] = useState(false);
  const [boardLayout, setBoardLayout] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const invalidMoveFadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      startNewGame();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const startNewGame = useCallback(() => {
    // Generate same Sudoku puzzle for both players
    const { puzzle } = generateSudoku();
    
    const puzzleCopy = puzzle.map(row => [...row]);
    
    // Batch all state updates
    setPlayer1Board(puzzleCopy);
    setPlayer2Board(puzzleCopy);
    setPlayer1Initial(puzzle);
    setPlayer2Initial(puzzle);
    setSelectedCell1(null);
    setSelectedCell2(null);
    setPickerPosition(null);
    // No currentPlayer state needed for simultaneous play
    setWinner(null);
    setShowInvalidMoveHint(false);
    
    // Set animation values directly
    invalidMoveFadeAnim.setValue(0);
    slideAnim.setValue(300);
  }, [invalidMoveFadeAnim, slideAnim]);

  const handleCellPress = (row: number, col: number, player: number) => {
    if (winner) return; // Don't allow moves after game is won
    // Both players can now play simultaneously - no turn restrictions

    const currentSelectedCell = player === 1 ? selectedCell1 : selectedCell2;
    const setCurrentSelectedCell = player === 1 ? setSelectedCell1 : setSelectedCell2;

    // If clicking the same cell, deselect it
    if (currentSelectedCell?.row === row && currentSelectedCell?.col === col) {
      setCurrentSelectedCell(null);
      return;
    }

    // If clicking a different cell, switch to that cell
    setCurrentSelectedCell({ row, col });
    setShowInvalidMoveHint(false);
  };

  const handleNumberSelect = (num: number, player: number) => {
    const currentSelectedCell = player === 1 ? selectedCell1 : selectedCell2;
    if (!currentSelectedCell || winner) return;
    
    const { row, col } = currentSelectedCell;
    
    // Each player has their own board and initial state
    const currentBoard = player === 1 ? player1Board : player2Board;
    const currentInitial = player === 1 ? player1Initial : player2Initial;

    if (currentBoard && currentInitial) {
      const tempBoard = currentBoard.map(r => [...r]);
      tempBoard[row][col] = num;

      if (currentInitial[row][col] === 0) {
        if (num === 0 || isValid(tempBoard, row, col, num)) {
          // Update only the current player's board
          if (player === 1) {
            const newBoard1 = player1Board ? player1Board.map(r => [...r]) : null;
            if (newBoard1) newBoard1[row][col] = num;
            setPlayer1Board(newBoard1);
          } else {
            const newBoard2 = player2Board ? player2Board.map(r => [...r]) : null;
            if (newBoard2) newBoard2[row][col] = num;
            setPlayer2Board(newBoard2);
          }
          setShowInvalidMoveHint(false);

          // Use setTimeout to defer state updates in animation callbacks
          Animated.timing(slideAnim, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(() => {
              setSelectedCell1(null);
              setSelectedCell2(null);
              setPickerPosition(null);
            }, 0);
          });

          Animated.timing(invalidMoveFadeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(() => setShowInvalidMoveHint(false), 0);
          });

          // Check if current player's puzzle is solved
          const currentNewBoard = player === 1 ? 
            (player1Board ? player1Board.map(r => [...r]) : null) : 
            (player2Board ? player2Board.map(r => [...r]) : null);
          
          if (currentNewBoard) {
            currentNewBoard[row][col] = num;
            if (checkBoard(currentNewBoard)) {
              setTimeout(() => setWinner(player), 0);
            }
          }
        } else {
          setShowInvalidMoveHint(true);
          invalidMoveFadeAnim.setValue(1);
          Animated.timing(
            invalidMoveFadeAnim,
            {
              toValue: 0,
              duration: 1500,
              delay: 1000,
              useNativeDriver: true,
            }
          ).start(() => {
            setTimeout(() => setShowInvalidMoveHint(false), 0);
          });
        }
      }
    }
  };

  const handlePickerClose = useCallback((player: number) => {
    const setCurrentSelectedCell = player === 1 ? setSelectedCell1 : setSelectedCell2;
    setCurrentSelectedCell(null);
  }, []);

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
    if (player1Board) {
      const boardToSolve = player1Board.map(row => [...row]);
      if (solveSudoku(boardToSolve)) {
        setPlayer1Board(boardToSolve);
        setPlayer2Board(boardToSolve);
        Alert.alert('Puzzle Solved!', 'The puzzle has been successfully solved.', [{ text: 'OK', style: 'cancel' }]);
      } else {
        Alert.alert('No Solution', 'This Sudoku board currently has no valid solution.', [{ text: 'OK', style: 'cancel' }]);
      }
    }
    setSelectedCell1(null);
    setSelectedCell2(null);
    setPickerPosition(null);
  };

  const handleCheck = () => {
    if (player1Board) {
      if (checkBoard(player1Board.map(row => [...row]))) {
        Alert.alert('Board is Correct!', 'Congratulations, your Sudoku board is correct!', [{ text: 'OK', style: 'cancel' }]);
      } else {
        Alert.alert('Board is Incorrect', 'Some numbers are placed incorrectly or the board is not complete.', [{ text: 'OK', style: 'cancel' }]);
      }
    }
    setSelectedCell1(null);
    setSelectedCell2(null);
    setPickerPosition(null);
  };

  const handleClear = () => {
    if (player1Initial) {
      setPlayer1Board(player1Initial.map(row => [...row]));
      setPlayer2Board(player1Initial.map(row => [...row]));
    }
    setSelectedCell1(null);
    setSelectedCell2(null);
    setPickerPosition(null);
  };

  const renderBoard = (board: number[] | null, player: number) => {
    if (!board) return null;

    const currentInitial = player === 1 ? player1Initial : player2Initial;
    // Both players get same size boards for simultaneous play
    const cellSize = getCellSize(true);

    return (
      <View 
        style={styles.boardContainer}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          setBoardLayout({ x, y, width, height });
        }}
      >
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {(row as unknown as number[]).map((cell: number, colIndex: number) => {
              const isInitial = currentInitial && currentInitial[rowIndex][colIndex] !== 0;
              const isInvalid = !isInitial && (board as unknown as number[][])[rowIndex][colIndex] !== 0 && !isValid((board as unknown as number[][]).map(r => [...r]), rowIndex, colIndex, (board as unknown as number[][])[rowIndex][colIndex]);
              const currentSelectedCell = player === 1 ? selectedCell1 : selectedCell2;
              const isSelected = currentSelectedCell?.row === rowIndex && currentSelectedCell?.col === colIndex;
              
              // Check if this cell is in the same row or column as the selected cell (works on both boards)
              const isInSelectedRow = currentSelectedCell && currentSelectedCell.row === rowIndex;
              const isInSelectedCol = currentSelectedCell && currentSelectedCell.col === colIndex;

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      borderLeftWidth: colIndex % BOX_SIZE === 0 ? MAJOR_BORDER_WIDTH : BORDER_WIDTH,
                      borderTopWidth: rowIndex % BOX_SIZE === 0 ? MAJOR_BORDER_WIDTH : BORDER_WIDTH,
                      borderRightWidth: (colIndex + 1) % BOX_SIZE === 0 && colIndex !== GRID_SIZE - 1 ? MAJOR_BORDER_WIDTH : BORDER_WIDTH,
                      borderBottomWidth: (rowIndex + 1) % BOX_SIZE === 0 && rowIndex !== GRID_SIZE - 1 ? MAJOR_BORDER_WIDTH : BORDER_WIDTH,
                      borderColor: (colIndex % BOX_SIZE === 0 || rowIndex % BOX_SIZE === 0 || (colIndex + 1) % BOX_SIZE === 0 || (rowIndex + 1) % BOX_SIZE === 0) ? '#2C3E50' : '#BBBBBB',
                    },
                    isSelected && styles.selectedCell,
                    isInitial && styles.initialCell,
                    isInvalid && styles.invalidCell,
                    // Highlight row and column lines
                    isInSelectedRow && !isSelected && styles.rowHighlight,
                    isInSelectedCol && !isSelected && styles.columnHighlight,
                  ]}
                  onPress={() => handleCellPress(rowIndex, colIndex, player)}
                  disabled={winner !== null}>
                  <Text style={[
                    styles.cellText, 
                    isInitial && styles.initialText, 
                    isInvalid && styles.invalidText,
                    { fontSize: Math.max(16, cellSize * 0.5) }
                  ]}>
                    {cell !== 0 ? cell : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.boardsContainer}>
          {/* Player 1 Board (inverted for opposite viewing) */}
          <View style={styles.playerSection}>
            {/* Number picker for Player 1 (above their board) - always visible */}
            <View style={[styles.numberPickerContainer, styles.pickerAbovePlayer1]}>
              <View style={styles.invertedBoard}>
                <NumberPicker
                  onSelectNumber={(num) => handleNumberSelect(num, 1)}
                  onClose={() => handlePickerClose(1)}
                  boardLayout={boardLayout}
                  selectedCell={selectedCell1 ? { row: selectedCell1.row, col: selectedCell1.col } : null}
                  setPickerDimensions={setPickerDimensions}
                />
              </View>
            </View>
            
            <View style={[styles.playerHeader, styles.invertedBoard]}>
              <Text style={styles.playerTitle}>Player 1</Text>
            </View>
            {isLoading ? (
              <Text>Loading...</Text>
            ) : (
              <View style={styles.invertedBoard}>
                {renderBoard(player1Board as unknown as number[], 1)}
              </View>
            )}
          </View>

          {/* Visual Separator between Player 1 and Player 2 */}
          <View style={styles.boardSeparator}>
            <View style={styles.separatorLine} />
            <View style={styles.separatorDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <View style={styles.separatorLine} />
          </View>

          {/* Player 2 Board (normal orientation) */}
          <View style={styles.playerSection}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle}>Player 2</Text>
            </View>
            {isLoading ? (
              <Text>Loading...</Text>
            ) : (
              renderBoard(player2Board as unknown as number[], 2)
            )}
            
            {/* Number picker for Player 2 (below their board) - always visible */}
            <View style={[styles.numberPickerContainer, styles.pickerBottom]}>
              <NumberPicker
                onSelectNumber={(num) => handleNumberSelect(num, 2)}
                onClose={() => handlePickerClose(2)}
                boardLayout={boardLayout}
                selectedCell={selectedCell2 ? { row: selectedCell2.row, col: selectedCell2.col } : null}
                setPickerDimensions={setPickerDimensions}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {showInvalidMoveHint && (
        <Animated.View style={[styles.invalidMoveHintContainer, { opacity: invalidMoveFadeAnim }]}>
          <Text style={styles.invalidMoveHintText}>Invalid Move!</Text>
        </Animated.View>
      )}

      {winner && (
        <View style={styles.winnerOverlay}>
          <Text style={styles.winnerText}>🎉 Player {winner} Wins! 🎉</Text>
          <TouchableOpacity onPress={startNewGame} style={styles.winnerButton}>
            <Text style={styles.winnerButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

    </KeyboardAvoidingView>
  );
}
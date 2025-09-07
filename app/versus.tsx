import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated, Pressable, ScrollView } from 'react-native';
import { generateSudoku, isValid, solveSudoku, checkBoard, GRID_SIZE, BOX_SIZE } from '@/utils/sudoku';
import NumberPicker from '../components/NumberPicker';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 60) / GRID_SIZE); // Larger cells for vertical layout
const BORDER_WIDTH = 1;
const MAJOR_BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  playerSection: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginVertical: 10,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  playerTitle: {
    fontSize: 18,
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
    fontSize: 18,
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  gameControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    margin: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  controlButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  versusIndicator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginVertical: 15,
    textAlign: 'center',
  },
});

export default function VersusMode() {
  const router = useRouter();
  const [player1Board, setPlayer1Board] = useState<number[][] | null>(null);
  const [player2Board, setPlayer2Board] = useState<number[][] | null>(null);
  const [player1Initial, setPlayer1Initial] = useState<number[][] | null>(null);
  const [player2Initial, setPlayer2Initial] = useState<number[][] | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; player: number } | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const [pickerDimensions, setPickerDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [showInvalidMoveHint, setShowInvalidMoveHint] = useState(false);
  const [boardLayout, setBoardLayout] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const invalidMoveFadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      startNewGame();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const startNewGame = useCallback(() => {
    const { puzzle } = generateSudoku();
    const puzzleCopy = puzzle.map(row => [...row]);
    
    // Batch all state updates
    setPlayer1Board(puzzleCopy);
    setPlayer2Board(puzzle.map(row => [...row]));
    setPlayer1Initial(puzzleCopy);
    setPlayer2Initial(puzzle.map(row => [...row]));
    setSelectedCell(null);
    setPickerPosition(null);
    setCurrentPlayer(1);
    setWinner(null);
    setShowInvalidMoveHint(false);
    
    // Set animation values directly
    invalidMoveFadeAnim.setValue(0);
    slideAnim.setValue(300);
  }, [invalidMoveFadeAnim, slideAnim]);

  const handleCellPress = (row: number, col: number, player: number) => {
    if (winner) return; // Don't allow moves after game is won
    if (player !== currentPlayer) return; // Only allow current player to make moves

    // If clicking the same cell, close the picker
    if (selectedCell?.row === row && selectedCell?.col === col && selectedCell?.player === player) {
      if (pickerPosition) {
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            setPickerPosition(null);
            setSelectedCell(null);
            // Scroll back to top when picker is closed
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }, 0);
        });
      } else {
        setPickerPosition(null);
        setSelectedCell(null);
      }
      return;
    }

    // If clicking a different cell, switch to that cell
    setSelectedCell({ row, col, player });
    setShowInvalidMoveHint(false);

    // Close picker if it's open
    if (pickerPosition) {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          setPickerPosition(null);
        }, 0);
      });
    }


    // Show picker for empty cells
    const currentBoard = player === 1 ? player1Board : player2Board;
    const currentInitial = player === 1 ? player1Initial : player2Initial;
    
    if (currentBoard && currentInitial && currentInitial[row][col] === 0) {
      setPickerPosition({ x: 0, y: 0 });
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-scroll to bottom to show number picker
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      setPickerPosition(null);
    }
  };

  const handleNumberSelect = (num: number) => {
    if (!selectedCell || winner) return;
    
    const { row, col, player } = selectedCell;
    const currentBoard = player === 1 ? player1Board : player2Board;
    const currentInitial = player === 1 ? player1Initial : player2Initial;
    const setBoard = player === 1 ? setPlayer1Board : setPlayer2Board;

    if (currentBoard && currentInitial) {
      const tempBoard = currentBoard.map(r => [...r]);
      tempBoard[row][col] = num;

      if (currentInitial[row][col] === 0) {
        if (num === 0 || isValid(tempBoard, row, col, num)) {
          const newBoard = currentBoard.map(r => [...r]);
          newBoard[row][col] = num;

          // Batch state updates to prevent useInsertionEffect warning
          setBoard(newBoard);
          setShowInvalidMoveHint(false);

          // Use setTimeout to defer state updates in animation callbacks
          Animated.timing(slideAnim, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(() => {
              setSelectedCell(null);
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

          // Check if current player won
          if (checkBoard(newBoard)) {
            setTimeout(() => setWinner(player), 0);
          } else {
            // Switch to other player
            setTimeout(() => setCurrentPlayer(player === 1 ? 2 : 1), 0);
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

  const handlePickerClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setPickerPosition(null);
        setSelectedCell(null);
      }, 0);
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
    if (currentPlayer === 1 && player1Board) {
      const boardToSolve = player1Board.map(row => [...row]);
      if (solveSudoku(boardToSolve)) {
        setPlayer1Board(boardToSolve);
        Alert.alert('Player 1 Puzzle Solved!', 'The puzzle has been successfully solved.', [{ text: 'OK', style: 'cancel' }]);
      } else {
        Alert.alert('No Solution', 'This Sudoku board currently has no valid solution.', [{ text: 'OK', style: 'cancel' }]);
      }
    } else if (currentPlayer === 2 && player2Board) {
      const boardToSolve = player2Board.map(row => [...row]);
      if (solveSudoku(boardToSolve)) {
        setPlayer2Board(boardToSolve);
        Alert.alert('Player 2 Puzzle Solved!', 'The puzzle has been successfully solved.', [{ text: 'OK', style: 'cancel' }]);
      } else {
        Alert.alert('No Solution', 'This Sudoku board currently has no valid solution.', [{ text: 'OK', style: 'cancel' }]);
      }
    }
    setSelectedCell(null);
    setPickerPosition(null);
  };

  const handleCheck = () => {
    if (currentPlayer === 1 && player1Board) {
      if (checkBoard(player1Board.map(row => [...row]))) {
        Alert.alert('Player 1 Board is Correct!', 'Congratulations, your Sudoku board is correct!', [{ text: 'OK', style: 'cancel' }]);
      } else {
        Alert.alert('Player 1 Board is Incorrect', 'Some numbers are placed incorrectly or the board is not complete.', [{ text: 'OK', style: 'cancel' }]);
      }
    } else if (currentPlayer === 2 && player2Board) {
      if (checkBoard(player2Board.map(row => [...row]))) {
        Alert.alert('Player 2 Board is Correct!', 'Congratulations, your Sudoku board is correct!', [{ text: 'OK', style: 'cancel' }]);
      } else {
        Alert.alert('Player 2 Board is Incorrect', 'Some numbers are placed incorrectly or the board is not complete.', [{ text: 'OK', style: 'cancel' }]);
      }
    }
    setSelectedCell(null);
    setPickerPosition(null);
  };

  const handleClear = () => {
    if (currentPlayer === 1 && player1Initial) {
      setPlayer1Board(player1Initial.map(row => [...row]));
    } else if (currentPlayer === 2 && player2Initial) {
      setPlayer2Board(player2Initial.map(row => [...row]));
    }
    setSelectedCell(null);
    setPickerPosition(null);
  };

  const renderBoard = (board: number[] | null, player: number) => {
    if (!board) return null;

    const currentInitial = player === 1 ? player1Initial : player2Initial;

    return (
      <View style={styles.boardContainer}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {(row as unknown as number[]).map((cell: number, colIndex: number) => {
              const isInitial = currentInitial && currentInitial[rowIndex][colIndex] !== 0;
              const isInvalid = !isInitial && (board as unknown as number[][])[rowIndex][colIndex] !== 0 && !isValid((board as unknown as number[][]).map(r => [...r]), rowIndex, colIndex, (board as unknown as number[][])[rowIndex][colIndex]);
              const isSelected = selectedCell?.player === player && selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
              
              // Check if this cell is in the same row or column as the selected cell
              const isInSelectedRow = selectedCell?.player === player && selectedCell?.row === rowIndex;
              const isInSelectedCol = selectedCell?.player === player && selectedCell?.col === colIndex;

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
                    // Highlight row and column lines
                    isInSelectedRow && !isSelected && styles.rowHighlight,
                    isInSelectedCol && !isSelected && styles.columnHighlight,
                  ]}
                  onPress={() => handleCellPress(rowIndex, colIndex, player)}
                  disabled={winner !== null || currentPlayer !== player}>
                  <Text style={[styles.cellText, isInitial && styles.initialText, isInvalid && styles.invalidText]}>
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
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/')} style={styles.gameControls}>
        <Text style={styles.controlButtonText}>← Back to Menu</Text>
      </TouchableOpacity>

      <View style={styles.gameControls}>
        <TouchableOpacity onPress={startNewGame} style={styles.controlButton}>
          <Text style={styles.controlButtonText}>New Game</Text>
        </TouchableOpacity>
        <Text style={styles.playerTurn}>
          {winner ? `Player ${winner} Wins!` : `Current Turn: Player ${currentPlayer}`}
        </Text>
        <TouchableOpacity onPress={handleSolve} style={styles.controlButton}>
          <Text style={styles.controlButtonText}>Solve</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.boardsContainer}>
          {/* Non-current player board at top */}
          {currentPlayer === 2 ? (
            <View style={styles.playerSection}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerTitle}>Player 1</Text>
              </View>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                renderBoard(player1Board as unknown as number[], 1)
              )}
            </View>
          ) : (
            <View style={styles.playerSection}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerTitle}>Player 2</Text>
              </View>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                renderBoard(player2Board as unknown as number[], 2)
              )}
            </View>
          )}

          {/* VS indicator */}
          <Text style={styles.versusIndicator}>VS</Text>

          {/* Current player board at bottom */}
          {currentPlayer === 1 ? (
            <View style={styles.playerSection}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerTitle}>Player 1</Text>
                {!winner && (
                  <Text style={styles.playerTurn}>Your Turn</Text>
                )}
              </View>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                renderBoard(player1Board as unknown as number[], 1)
              )}
            </View>
          ) : (
            <View style={styles.playerSection}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerTitle}>Player 2</Text>
                {!winner && (
                  <Text style={styles.playerTurn}>Your Turn</Text>
                )}
              </View>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                renderBoard(player2Board as unknown as number[], 2)
              )}
            </View>
          )}
        </View>

        {/* Number picker at bottom of scroll view */}
        {pickerPosition && (
          <View style={styles.numberPickerContainer}>
            <NumberPicker
              onSelectNumber={handleNumberSelect}
              onClose={handlePickerClose}
              boardLayout={boardLayout}
              selectedCell={selectedCell}
              setPickerDimensions={setPickerDimensions}
            />
          </View>
        )}
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

    </View>
  );
}
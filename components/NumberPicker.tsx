import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Dimensions } from 'react-native';

import { Dispatch } from 'react';
interface NumberPickerProps {
  onSelectNumber: (num: number) => void;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
  onLayout?: (width: number, height: number) => void;
  boardLayout: { x: number, y: number, width: number, height: number } | null;
  selectedCell: { row: number; col: number } | null;
  setPickerDimensions: Dispatch<{ width: number, height: number } | null>;
}

const { width, height } = Dimensions.get('window');
const CELL_SIZE = Math.floor(width * 0.04); // 4% of screen width - even smaller for better fit 

export default function NumberPicker({ onSelectNumber, onClose, style, onLayout, boardLayout, selectedCell, setPickerDimensions }: NumberPickerProps) {
  const handleLayout = (event: any) => {
    if (onLayout) {
      onLayout(event.nativeEvent.layout.width, event.nativeEvent.layout.height);
    }
  };

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <View style={styles.numberGrid}>
        {/* First row: 1, 2, 3, 4, 5 */}
        <View style={styles.numberRow}>
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => {
                onSelectNumber(num);
                onClose();
              }}>
              <Text style={styles.numberButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Second row: 6, 7, 8, 9 */}
        <View style={styles.numberRow}>
          {[6, 7, 8, 9].map(num => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => {
                onSelectNumber(num);
                onClose();
              }}>
              <Text style={styles.numberButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', // Changed to transparent
    borderRadius: 20,
    padding: height * 0.01, // 1% of screen height
    elevation: 0, // Removed elevation
    shadowColor: 'transparent', // Removed shadow
    shadowOffset: { width: 0, height: 0 }, // Removed shadow
    shadowOpacity: 0, // Removed shadow
    shadowRadius: 0, // Removed shadow
    zIndex: 100,
    // overflow: 'hidden', // Remove overflow
    borderWidth: 0, // Removed border
    borderColor: 'transparent', // Removed border
  },
  numberGrid: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.003, // 0.3% of screen height - further reduced
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: height * 0.002, // 0.2% of screen height - further reduced
    width: '100%',
  },
  numberButton: {
    width: CELL_SIZE * 1.2,
    height: CELL_SIZE * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: width * 0.008, // 0.8% of screen width
    borderRadius: 8,
    backgroundColor: '#8E24AA', // A lighter shade of purple for buttons
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  numberButtonText: {
    fontSize: Math.floor(width * 0.035), // 3.5% of screen width - even smaller font
    color: '#FFF', // White text on purple background
    fontWeight: 'bold',
  },
}); 
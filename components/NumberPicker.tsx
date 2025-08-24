import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
// import { BlurView } from 'expo-blur'; // Remove BlurView import

interface NumberPickerProps {
  onSelectNumber: (num: number) => void;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
  onLayout?: (width: number, height: number) => void; 
}

const CELL_SIZE = 35; 

export default function NumberPicker({ onSelectNumber, onClose, style, onLayout }: NumberPickerProps) {
  const handleLayout = (event: any) => {
    if (onLayout) {
      onLayout(event.nativeEvent.layout.width, event.nativeEvent.layout.height);
    }
  };

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}> 
      <View style={styles.numberGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', // Changed to transparent
    borderRadius: 20,
    padding: 20,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  numberButton: {
    width: CELL_SIZE * 1.5,
    height: CELL_SIZE * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 12,
    backgroundColor: '#8E24AA', // A lighter shade of purple for buttons
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  numberButtonText: {
    fontSize: 39, // Increased by 50% from 26 (26 * 1.5 = 39)
    color: '#FFF', // White text on purple background
    fontWeight: 'bold',
  },
}); 
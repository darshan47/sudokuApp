import React from 'react';
import { View, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import { Text, Card, IconButton, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface MaterialNumberPickerProps {
  visible: boolean;
  onSelectNumber: (num: number) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function MaterialNumberPicker({
  visible,
  onSelectNumber,
  onClose,
  position,
}: MaterialNumberPickerProps) {
  const theme = useTheme();

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Card
            style={[
              styles.picker,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.shadow,
              },
            ]}
            elevation={5}
          >
            <View style={styles.header}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                Select Number
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={onClose}
                iconColor={theme.colors.onSurface}
              />
            </View>
            
            <View style={styles.grid}>
              {numbers.map((num) => (
                <IconButton
                  key={num}
                  mode="contained"
                  size={32}
                  onPress={() => onSelectNumber(num)}
                  icon={() => (
                    <Text
                      variant="titleLarge"
                      style={{
                        color: theme.colors.onPrimary,
                        fontWeight: 'bold',
                      }}
                    >
                      {num}
                    </Text>
                  )}
                  style={[
                    styles.numberButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              ))}
            </View>
            
            <View style={styles.footer}>
              <IconButton
                mode="outlined"
                size={32}
                onPress={() => onSelectNumber(0)}
                icon={() => (
                  <MaterialIcons
                    name="clear"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
                style={[
                  styles.clearButton,
                  { borderColor: theme.colors.primary },
                ]}
              />
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  picker: {
    width: Math.min(width - 32, 320),
    maxHeight: height * 0.6,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 12,
  },
  numberButton: {
    width: 50,
    height: 50,
    margin: 3,
    borderRadius: 25,
  },
  footer: {
    alignItems: 'center',
  },
  clearButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
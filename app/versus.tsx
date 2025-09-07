import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9B59B6',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default function VersusMode() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Versus 2P Mode</Text>
      <Text style={styles.subtitle}>Competitive Sudoku for two players</Text>
      
      <Text style={styles.comingSoon}>Coming Soon!</Text>
      
      <Text style={styles.description}>
        This mode will feature competitive Sudoku gameplay where both players work on the same puzzle and compete to solve it first.
      </Text>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/home')}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
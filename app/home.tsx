import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontFamily: 'Amita',
    fontWeight: '700',
    fontSize: 40,
    lineHeight: 44,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 6,
    color: '#2e2e2e',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4a4a4a',
    marginBottom: 24,
  },
  gameModeContainer: {
    width: '100%',
    maxWidth: 720,
  },
  gameModeButton: {
    width: '100%',
    height: 96,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
  },
});

// SVG Button Components
const SoloButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="96" viewBox="0 0 360 96">
  <defs><clipPath id="round"><rect x="0" y="0" width="360" height="96" rx="24" ry="24"/></clipPath></defs>
  <g clip-path="url(#round)"><rect x="0" y="0" width="360" height="96" fill="#2E7D32"/></g>
  <g transform="translate(24,32)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
  <circle cx="12" cy="8" r="4" fill="#FFFFFF"/>
  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#FFFFFF"/>
</svg></g>
  <g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial" fill="#FFFFFF">
    <text x="72" y="46" font-size="22" font-weight="700">Solo</text>
    <text x="72" y="68" font-size="14" opacity="0.95">Solve Sudoku puzzles on your own</text>
  </g>
  <g transform="translate(308,34)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 10v4h4l5 4V6l-5 4H5z"/>
    <path d="M16.5 8.5a4 4 0 0 1 0 7"/>
    <path d="M19 6a7 7 0 0 1 0 12"/>
  </g>
</svg></g>
</svg>`;

const PassPhoneButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="96" viewBox="0 0 360 96">
  <defs><clipPath id="round"><rect x="0" y="0" width="360" height="96" rx="24" ry="24"/></clipPath></defs>
  <g clip-path="url(#round)"><rect x="0" y="0" width="360" height="96" fill="#D84315"/></g>
  <g transform="translate(24,32)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
  <rect x="6" y="2" width="12" height="20" rx="2" ry="2" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="12" cy="18.5" r="1" fill="#FFFFFF"/>
</svg></g>
  <g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial" fill="#FFFFFF">
    <text x="72" y="46" font-size="22" font-weight="700">Pass Phone 2P</text>
    <text x="72" y="68" font-size="14" opacity="0.95">Face-to-face with different puzzles</text>
  </g>
  <g transform="translate(308,34)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 10v4h4l5 4V6l-5 4H5z"/>
    <path d="M16.5 8.5a4 4 0 0 1 0 7"/>
    <path d="M19 6a7 7 0 0 1 0 12"/>
  </g>
</svg></g>
</svg>`;

const VersusButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="96" viewBox="0 0 360 96">
  <defs><clipPath id="round"><rect x="0" y="0" width="360" height="96" rx="24" ry="24"/></clipPath></defs>
  <g clip-path="url(#round)"><rect x="0" y="0" width="360" height="96" fill="#6A1B9A"/></g>
  <g transform="translate(24,32)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
  <g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 7l7-4-4 7L7 20l-3-3L14 7z"/>
    <path d="M10 7L3 3l4 7 10 10 3-3L10 7z"/>
  </g>
</svg></g>
  <g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial" fill="#FFFFFF">
    <text x="72" y="46" font-size="22" font-weight="700">Versus 2P</text>
    <text x="72" y="68" font-size="14" opacity="0.95">Coming soon…</text>
  </g>
  <g transform="translate(308,34)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 10v4h4l5 4V6l-5 4H5z"/>
    <path d="M16.5 8.5a4 4 0 0 1 0 7"/>
    <path d="M19 6a7 7 0 0 1 0 12"/>
  </g>
</svg></g>
</svg>`;

export default function HomePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F4E6CC', '#EAD8B1']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <Text style={styles.title}>सुडोकू !</Text>
      <Text style={styles.subtitle}>Choose your game mode</Text>
      
      <View style={styles.gameModeContainer}>
        <TouchableOpacity 
          style={styles.gameModeButton}
          onPress={() => router.push('/solo')}
        >
          <SvgXml xml={SoloButtonSvg} width="100%" height="100%" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gameModeButton}
          onPress={() => router.push('/pass-phone')}
        >
          <SvgXml xml={PassPhoneButtonSvg} width="100%" height="100%" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gameModeButton}
          onPress={() => router.push('/versus')}
        >
          <SvgXml xml={VersusButtonSvg} width="100%" height="100%" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
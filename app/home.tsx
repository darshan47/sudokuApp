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
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
    elevation: 6,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#F0F0F0',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gameModeContainer: {
    width: '100%',
    maxWidth: 720,
  },
  gameModeButton: {
    width: '100%',
    height: 96,
    marginBottom: 16,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    borderRadius: 24,
    overflow: 'hidden',
  },
});

// SVG Button Components
const SoloButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="96" viewBox="0 0 360 96">
  <defs>
    <clipPath id="round"><rect x="0" y="0" width="360" height="96" rx="24" ry="24"/></clipPath>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
  </defs>
  <g clip-path="url(#round)"><rect x="0" y="0" width="360" height="96" fill="#2E7D32" filter="url(#shadow)"/></g>
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
  <defs>
    <clipPath id="round2"><rect x="0" y="0" width="360" height="96" rx="24" ry="24"/></clipPath>
    <filter id="shadow2" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
  </defs>
  <g clip-path="url(#round2)"><rect x="0" y="0" width="360" height="96" fill="#D84315" filter="url(#shadow2)"/></g>
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
  <defs>
    <clipPath id="round3"><rect x="0" y="0" width="360" height="96" rx="24" ry="24"/></clipPath>
    <filter id="shadow3" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
  </defs>
  <g clip-path="url(#round3)"><rect x="0" y="0" width="360" height="96" fill="#6A1B9A" filter="url(#shadow3)"/></g>
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
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
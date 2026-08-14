import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CuadroScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Cuadro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Fondo totalmente blanco
    justifyContent: 'center',  // Centrado vertical
    alignItems: 'center',      // Centrado horizontal
  },
  texto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});
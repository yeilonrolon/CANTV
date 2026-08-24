import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { limpiarFotosNoUsadas } from '../constants/reportes';

export default function LimpiarFotosScreen() {
  const [limpiando, setLimpiando] = useState(false);

  const limpiar = async () => {
    setLimpiando(true);
    try {
      const cantidad = await limpiarFotosNoUsadas();
      Alert.alert('Limpieza completada', cantidad ? `Se eliminaron ${cantidad} imágenes no utilizadas.` : 'No había imágenes antiguas sin referencia.');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron revisar las imágenes privadas.');
    } finally {
      setLimpiando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Limpiar Fotos</Text>
      <Text style={styles.descripcion}>El sistema conservará las imágenes vinculadas a tus reportes. Solo se eliminarán archivos que ya no estén asociados a ningún registro.</Text>
      <TouchableOpacity style={styles.boton} onPress={limpiar} disabled={limpiando}>
        <Text style={styles.botonTexto}>{limpiando ? 'Revisando...' : 'Eliminar fotos no utilizadas'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 24, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#17202a', textAlign: 'center', marginBottom: 16 },
  descripcion: { color: '#5f6b76', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 28 },
  boton: { backgroundColor: '#b52b38', padding: 17, borderRadius: 8, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

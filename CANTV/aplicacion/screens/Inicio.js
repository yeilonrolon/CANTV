import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InicioScreen({ navigation }) {
  const cerrarSesion = () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Reportes SHA</Text>
      <Text style={styles.subtitulo}>Seleccione una acción</Text>
      <TouchableOpacity style={styles.botonPrincipal} onPress={() => navigation.navigate('Usuario')}>
        <Text style={styles.botonTexto}>Crear Reporte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.botonSecundario} onPress={() => navigation.navigate('Historial')}>
        <Text style={styles.botonTextoSecundario}>Historial de Reportes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.botonLimpieza}
        onPress={() => navigation.navigate('LimpiarFotos')}
      >
        <Text style={styles.botonTextoLimpieza}>Limpiar Fotos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.salir} onPress={() => Alert.alert('Cerrar sesión', '¿Desea salir?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: cerrarSesion },
      ])}>
        <Text style={styles.salirTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f4f6f8' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#17202a', textAlign: 'center', marginBottom: 8 },
  subtitulo: { fontSize: 16, color: '#5f6b76', textAlign: 'center', marginBottom: 34 },
  botonPrincipal: { backgroundColor: '#0066cc', padding: 18, borderRadius: 8, alignItems: 'center', marginBottom: 14 },
  botonSecundario: { backgroundColor: '#2e7d32', padding: 18, borderRadius: 8, alignItems: 'center', marginBottom: 14 },
  botonLimpieza: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d9534f', padding: 17, borderRadius: 8, alignItems: 'center' },
  botonTexto: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' },
  botonTextoSecundario: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' },
  botonTextoLimpieza: { color: '#b52b38', fontSize: 17, fontWeight: 'bold' },
  salir: { alignItems: 'center', marginTop: 34, padding: 10 },
  salirTexto: { color: '#5f6b76', fontSize: 15 },
});

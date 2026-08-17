import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function FotoSedeScreen({ route, navigation }) {
  // Recibimos los datos enviados desde la pantalla anterior (FormularioScreen)
  const datosFormulario = route.params || {};

  // Estado para guardar la URI de la foto tomada
  const [fotoUri, setFotoUri] = useState(null);

  // Función para abrir la cámara nativa del teléfono
  const tomarFoto = async () => {
    // Solicitar permisos de cámara
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso Denegado',
        'Se requiere acceso a la cámara para tomar la foto de la sede.'
      );
      return;
    }

    // Abrir cámara
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, // Permite recortar/ajustar la foto si se desea
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotoUri(result.assets[0].uri);
    }
  };

  // Función para avanzar a la siguiente pantalla
  const handleSiguiente = () => {
    if (!fotoUri) {
      Alert.alert('Foto Requerida', 'Por favor tome una foto de la sede antes de continuar.');
      return;
    }

    // Navega a la siguiente pantalla pasando todos los datos recolectados + la foto
    navigation.navigate('Extintores', {
      ...datosFormulario,
      fotoSedeUri: fotoUri,
      fotosSede: [fotoUri], // 💡 Mapeo en arreglo para el PDF final
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Foto de la Sede</Text>
      <Text style={styles.subtitle}>
        Instalación: {datosFormulario.instalacion || 'N/A'}
      </Text>

      {/* VISTA SI NO SE HA TOMADO NINGUNA FOTO */}
      {!fotoUri ? (
        <View style={styles.noFotoContainer}>
          <Text style={styles.noFotoText}>No se ha tomado ninguna foto</Text>
          <TouchableOpacity style={styles.btnCamara} onPress={tomarFoto}>
            <Text style={styles.btnCamaraText}>📷 Abrir Cámara</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* VISTA PREVIA CUANDO YA SE TOMÓ LA FOTO */
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Vista Previa:</Text>
          <Image source={{ uri: fotoUri }} style={styles.imagePreview} />

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnRetake]}
              onPress={tomarFoto}
            >
              <Text style={styles.btnRetakeText}>🔄 Volver a tomar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAction, styles.btnNext]}
              onPress={handleSiguiente}
            >
              <Text style={styles.btnNextText}>Siguiente ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f6f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: '#0066cc',
    fontWeight: '600',
    marginBottom: 25,
  },
  noFotoContainer: {
    width: '100%',
    height: 250,
    borderWidth: 2,
    borderColor: '#cccccc',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noFotoText: {
    color: '#888888',
    fontSize: 16,
    marginBottom: 20,
  },
  btnCamara: {
    backgroundColor: '#0066cc',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  btnCamaraText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btnAction: {
    flex: 0.48,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnRetake: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9534f',
  },
  btnRetakeText: {
    color: '#d9534f',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnNext: {
    backgroundColor: '#2e7d32',
  },
  btnNextText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
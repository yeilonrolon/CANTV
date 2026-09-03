import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { guardarFotoEnGaleria, obtenerRutaFotoHistorial } from '../constants/reportes';

export default function FotoExtintorScreen({ route, navigation }) {
  // Recibimos todos los datos de las pantallas anteriores
  const datosPrevios = route.params || {};

  // Estado para la foto
  const [fotoUri, setFotoUri] = useState(null);

  // Estados para CO2 y PQS
  const [co2, setCo2] = useState('');
  const [pqs, setPqs] = useState('');

  const scrollViewRef = useRef(null);

  // Validación para números enteros únicamente
  const handleCo2Change = (text) => {
    const numLimpio = text.replace(/[^0-9]/g, '');
    setCo2(numLimpio);
  };

  const handlePqsChange = (text) => {
    const numLimpio = text.replace(/[^0-9]/g, '');
    setPqs(numLimpio);
  };

  const elegirFoto = async (origen) => {
    const permiso = origen === 'camara'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status } = permiso;
    if (status !== 'granted') {
      Alert.alert(
        'Permiso Denegado',
        `Se requiere acceso a ${origen === 'camara' ? 'la cámara' : 'la galería'} para seleccionar la foto.`
      );
      return;
    }

    const result = origen === 'camara'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 1 });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = origen === 'camara'
        ? await guardarFotoEnGaleria(result.assets[0].uri)
        : result.assets[0].uri;
      setFotoUri(uri);
    }
  };

  const tomarFoto = () => Alert.alert('Foto de participantes', 'Selecciona el origen de la foto.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Galería', onPress: () => elegirFoto('galeria') },
    { text: 'Cámara', onPress: () => elegirFoto('camara') },
  ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // Función para avanzar a la siguiente pantalla o guardar
  const handleSiguiente = () => {
    if (!fotoUri) {
      Alert.alert('Foto Requerida', 'Por favor tome una foto antes de continuar.');
      return;
    }

    if (!co2 || !pqs) {
      Alert.alert('Campos Incompletos', 'Por favor complete los campos CO2 y PQS.');
      return;
    }

    // Navegar a la siguiente pantalla acumulando todos los datos recopilados
    navigation.navigate('Cuadro', {
      ...datosPrevios,
      fotoParticipantesUri: fotoUri,
      fotosParticipantes: [fotoUri],
      participantes: [
        ...(Array.isArray(datosPrevios.participantes) ? datosPrevios.participantes : []),
        { foto: fotoUri },
      ],
      co2: co2,
      pqs: pqs,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Foto de Participantes</Text>
        <Text style={styles.subtitle}>
          Instalación: {datosPrevios.instalacion || 'N/A'}
        </Text>

        {/* 1. SECCIÓN FOTO (Abrir Cámara / Vista Previa) */}
        {!fotoUri ? (
          <View style={styles.noFotoContainer}>
            <Text style={styles.noFotoText}>No se ha tomado ninguna foto</Text>
            <TouchableOpacity style={styles.btnCamara} onPress={tomarFoto}>
              <Text style={styles.btnCamaraText}>📷 Abrir Cámara</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Vista Previa:</Text>
            <Image
              source={{ uri: obtenerRutaFotoHistorial(fotoUri) }}
              style={styles.imagePreview}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={styles.btnRetake}
              onPress={tomarFoto}
            >
              <Text style={styles.btnRetakeText}>🔄 Volver a tomar foto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. CAMPOS DE ENTRADA (CO2 y PQS) */}
        <View style={styles.inputsSection}>
          <Text style={[styles.label, styles.textoVisible]}>Cantidad CO2:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese solo números..."
            placeholderTextColor="#888888"
            keyboardType="numeric"
            value={co2}
            onChangeText={handleCo2Change}
            onFocus={scrollToBottom}
            maxLength={6}
          />

          <Text style={[styles.label, styles.textoVisible]}>Cantidad PQS:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese solo números..."
            placeholderTextColor="#888888"
            keyboardType="numeric"
            value={pqs}
            onChangeText={handlePqsChange}
            onFocus={scrollToBottom}
            maxLength={6}
          />
        </View>

        {/* 3. BOTÓN SIGUIENTE */}
        <TouchableOpacity style={styles.btnNext} onPress={handleSiguiente}>
          <Text style={styles.btnNextText}>Siguiente ➔</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f6f8',
    paddingBottom: 100,
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
    marginBottom: 20,
  },
  noFotoContainer: {
    width: '100%',
    height: 220,
    borderWidth: 2,
    borderColor: '#cccccc',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  noFotoText: {
    color: '#888888',
    fontSize: 16,
    marginBottom: 15,
  },
  btnCamara: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  btnRetake: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9534f',
    alignItems: 'center',
  },
  btnRetakeText: {
    color: '#d9534f',
    fontSize: 15,
    fontWeight: 'bold',
  },
  inputsSection: {
    width: '100%',
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444444',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000000',
    marginBottom: 10,
  },
  btnNext: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnNextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
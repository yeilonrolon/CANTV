import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// 🔹 Importación con llaves { } para Named Export
import { generarYCompartirPDF } from '../constants/pdf';
import { guardarImagenHistorial, guardarReporte, obtenerRutaFotoHistorial } from '../constants/reportes';

export default function FotoCuadroScreen({ route, navigation }) {
  // Extraemos datos globales de la sede y el cuadro actual
  const {
    datosInspeccion = {}, 
    seccionesAcumuladas = [], 
    ...datosGenerales 
  } = route?.params || {};

  const seccionesValidas = Array.isArray(seccionesAcumuladas)
    ? seccionesAcumuladas
    : [];

  const [fotos, setFotos] = useState([]);
  const [cargandoPdf, setCargandoPdf] = useState(false);

  const tomarFoto = async () => {
    try {
      if (fotos.length >= 5) {
        Alert.alert('Límite alcanzado', 'Solo puedes tomar un máximo de 5 fotos por sección.');
        return;
      }

      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara para tomar fotografías.');
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.7,
      });

      if (!resultado.canceled && resultado.assets?.[0]?.uri) {
        const nombreFoto = await guardarImagenHistorial(resultado.assets[0].uri);
        if (nombreFoto) setFotos((prevFotos) => [...prevFotos, nombreFoto]);
      }
    } catch (error) {
      console.error('Error al tomar fotografía:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara o guardar la fotografía.');
    }
  };

  const eliminarFoto = (index) => {
    Alert.alert(
      'Eliminar Foto',
      '¿Estás seguro de que deseas eliminar esta fotografía?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => setFotos((prevFotos) => prevFotos.filter((_, i) => i !== index)) 
        },
      ]
    );
  };

  const ingresarMasDatos = () => {
    if (fotos.length === 0) {
      Alert.alert('Atención', 'Debes tomar al menos 1 fotografía antes de ingresar más datos.');
      return;
    }

    const nuevaSeccion = {
      ...datosInspeccion,
      fotos,
      id: Date.now().toString(),
    };

    const listaActualizada = [...seccionesValidas, nuevaSeccion];

    Alert.alert(
      'Sección Guardada',
      'Los datos y fotos actuales se han registrado correctamente. Puedes ingresar un nuevo cuadro.',
      [
        {
          text: 'Continuar',
          onPress: () => {
            navigation.replace('Cuadro', {
              ...datosGenerales,
              seccionesAcumuladas: listaActualizada,
            });
          },
        },
      ]
    );
  };

  const crearPDF = async () => {
    if (fotos.length === 0) {
      Alert.alert('Atención', 'Debes tomar al menos 1 fotografía para el cuadro actual.');
      return;
    }

    setCargandoPdf(true);

    try {
      const seccionFinal = {
        ...datosInspeccion,
        fotos,
        id: Date.now().toString(),
      };

      const cuadrosFinales = [...seccionesValidas, seccionFinal];

      // Objeto consolidado con toda la información de la inspección
      const reporteCompleto = {
        ...datosGenerales,
        cuadros: cuadrosFinales,
      };

      const reporteGuardado = await guardarReporte(reporteCompleto);
      await generarYCompartirPDF(reporteGuardado, { nombreArchivo: true });
    } catch (error) {
      console.error('Error al crear PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF. Verifica que las fotos sean válidas e inténtalo nuevamente.');
    } finally {
      setCargandoPdf(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Captura de Fotografías</Text>
      <Text style={styles.subtitulo}>
        Fotos del cuadro actual ({fotos.length}/5) - Cuadros guardados: {seccionesValidas.length}
      </Text>

      <TouchableOpacity 
        style={[styles.botonCamara, (fotos.length >= 5 || cargandoPdf) && styles.botonDeshabilitado]} 
        onPress={tomarFoto}
        disabled={fotos.length >= 5 || cargandoPdf}
      >
        <Text style={styles.botonCamaraTexto}>
          {fotos.length >= 5 ? '🚫 Límite de Fotos Alcanzado' : '📷 Tomar Fotografía'}
        </Text>
      </TouchableOpacity>

      <View style={styles.galeriaContainer}>
        {fotos.map((uri, index) => (
          <View key={index} style={styles.tarjetaFoto}>
            <Image source={{ uri: obtenerRutaFotoHistorial(uri) }} style={styles.imagenPreview} />
            <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarFoto(index)}>
              <Text style={styles.botonEliminarTexto}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.fotoContador}>Foto {index + 1}</Text>
          </View>
        ))}
      </View>

      <View style={styles.accionesContainer}>
        <TouchableOpacity 
          style={[styles.botonAccion, styles.botonMasDatos, (fotos.length === 0 || cargandoPdf) && styles.botonDeshabilitado]} 
          onPress={ingresarMasDatos}
          disabled={fotos.length === 0 || cargandoPdf}
        >
          <Text style={styles.botonTextoAccion}>+ Ingresar Más Datos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.botonAccion, styles.botonPdf, (fotos.length === 0 || cargandoPdf) && styles.botonDeshabilitado]} 
          onPress={crearPDF}
          disabled={fotos.length === 0 || cargandoPdf}
        >
          {cargandoPdf ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.botonTextoAccion}>📄 Crear PDF</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#ffffff', flexGrow: 1, alignItems: 'center' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6, textAlign: 'center' },
  subtitulo: { fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 20 },
  botonCamara: { backgroundColor: '#28a745', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 20 },
  botonCamaraTexto: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  galeriaContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  tarjetaFoto: { width: '48%', aspectRatio: 1, marginBottom: 15, borderRadius: 8, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#e0e0e0' },
  imagenPreview: { width: '100%', height: '100%' },
  botonEliminar: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(220, 53, 69, 0.9)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  botonEliminarTexto: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  fotoContador: { position: 'absolute', bottom: 4, left: 6, backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#ffffff', fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  accionesContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 'auto', paddingTop: 10 },
  botonAccion: { flex: 0.48, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  botonMasDatos: { backgroundColor: '#6c757d' },
  botonPdf: { backgroundColor: '#0066cc' },
  botonDeshabilitado: { backgroundColor: '#cccccc' },
  botonTextoAccion: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
});
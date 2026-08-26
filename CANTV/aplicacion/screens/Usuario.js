import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import {
  EMPRESA_CANTV,
  getRegiones,
  getEstadosPorRegion,
  getMunicipiosPorEstado,
  getParroquiasPorMunicipio,
  getInstalacionesPorParroquia,
} from '../constants/Localidad';

export default function FormularioScreen({ navigation }) {
  const [regionSeleccionada, setRegionSeleccionada] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState(null);
  const [parroquiaSeleccionada, setParroquiaSeleccionada] = useState(null);
  const [instalacionSeleccionada, setInstalacionSeleccionada] = useState(null);
  
  const [telefono, setTelefono] = useState('');
  const [th, setTh] = useState('');

  const scrollViewRef = useRef(null);

  // 🔒 PROTECCIÓN: Se asegura de que siempre devuelvan un Array ejecutable [].
  const regiones = getRegiones() || [];
  
  const estados = regionSeleccionada 
    ? (getEstadosPorRegion(regionSeleccionada) || []) 
    : [];

  const municipios = (regionSeleccionada && estadoSeleccionado) 
    ? (getMunicipiosPorEstado(regionSeleccionada, estadoSeleccionado) || []) 
    : [];

  const parroquias = (regionSeleccionada && estadoSeleccionado && municipioSeleccionado) 
    ? (getParroquiasPorMunicipio(regionSeleccionada, estadoSeleccionado, municipioSeleccionado) || []) 
    : [];

  const instalaciones = (regionSeleccionada && estadoSeleccionado && municipioSeleccionado && parroquiaSeleccionada) 
    ? (getInstalacionesPorParroquia(regionSeleccionada, estadoSeleccionado, municipioSeleccionado, parroquiaSeleccionada) || []) 
    : [];

  const handleTelefonoChange = (text) => {
    const numLimpio = text.replace(/[^0-9]/g, '');
    setTelefono(numLimpio);
  };

  const handleThChange = (text) => {
    const numLimpio = text.replace(/[^0-9]/g, '');
    setTh(numLimpio);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleSiguiente = () => {
    if (
      !regionSeleccionada ||
      !estadoSeleccionado ||
      !municipioSeleccionado ||
      !parroquiaSeleccionada ||
      !instalacionSeleccionada ||
      !telefono ||
      !th
    ) {
      Alert.alert('Campos Incompletos', 'Por favor complete todos los campos antes de continuar.');
      return;
    }

    navigation.navigate('Fotosede', {
      region: regionSeleccionada,
      estado: estadoSeleccionado,
      municipio: municipioSeleccionado,
      parroquia: parroquiaSeleccionada,
      instalacion: instalacionSeleccionada,
      telefono: telefono,
      th: th,
      sede: instalacionSeleccionada,
      localidad: `${municipioSeleccionado}, ${parroquiaSeleccionada}`,
      direccion: `Parroquia ${parroquiaSeleccionada}, Mun. ${municipioSeleccionado}`,
    });
  };

  const cerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      'Al cerrar sesión se eliminarán los datos de la inspección actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          }),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Formulario de Ubicación</Text>
        <Text style={styles.empresa}>Empresa: {EMPRESA_CANTV}</Text>

        {/* 1. REGIÓN */}
        <Text style={styles.label}>Región:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            dropdownIconColor="#243447"
            selectedValue={regionSeleccionada}
            onValueChange={(val) => {
              if (val) {
                setRegionSeleccionada(val);
                setEstadoSeleccionado(null);
                setMunicipioSeleccionado(null);
                setParroquiaSeleccionada(null);
                setInstalacionSeleccionada(null);
              }
            }}
          >
            <Picker.Item label="Seleccione una Región..." value={null} />
            {Array.isArray(regiones) && regiones.map((item, index) => (
              <Picker.Item key={`reg-${index}`} label={String(item)} value={item} />
            ))}
          </Picker>
        </View>

        {/* 2. ESTADO */}
        {regionSeleccionada && (
          <>
            <Text style={styles.label}>Estado:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                dropdownIconColor="#243447"
                selectedValue={estadoSeleccionado}
                onValueChange={(val) => {
                  if (val) {
                    setEstadoSeleccionado(val);
                    setMunicipioSeleccionado(null);
                    setParroquiaSeleccionada(null);
                    setInstalacionSeleccionada(null);
                  }
                }}
              >
                <Picker.Item label="Seleccione un Estado..." value={null} />
                {Array.isArray(estados) && estados.map((item, index) => (
                  <Picker.Item key={`est-${index}`} label={String(item)} value={item} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {/* 3. MUNICIPIO */}
        {estadoSeleccionado && (
          <>
            <Text style={styles.label}>Municipio:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                dropdownIconColor="#243447"
                selectedValue={municipioSeleccionado}
                onValueChange={(val) => {
                  if (val) {
                    setMunicipioSeleccionado(val);
                    setParroquiaSeleccionada(null);
                    setInstalacionSeleccionada(null);
                  }
                }}
              >
                <Picker.Item label="Seleccione un Municipio..." value={null} />
                {Array.isArray(municipios) && municipios.map((item, index) => (
                  <Picker.Item key={`mun-${index}`} label={String(item)} value={item} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {/* 4. PARROQUIA */}
        {municipioSeleccionado && (
          <>
            <Text style={styles.label}>Parroquia:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                dropdownIconColor="#243447"
                selectedValue={parroquiaSeleccionada}
                onValueChange={(val) => {
                  if (val) {
                    setParroquiaSeleccionada(val);
                    setInstalacionSeleccionada(null);
                  }
                }}
              >
                <Picker.Item label="Seleccione una Parroquia..." value={null} />
                {Array.isArray(parroquias) && parroquias.map((item, index) => (
                  <Picker.Item key={`parr-${index}`} label={String(item)} value={item} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {/* 5. INSTALACIÓN */}
        {parroquiaSeleccionada && (
          <>
            <Text style={styles.label}>Instalación:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                dropdownIconColor="#243447"
                selectedValue={instalacionSeleccionada}
                onValueChange={(val) => val && setInstalacionSeleccionada(val)}
              >
                <Picker.Item label="Seleccione una Instalación..." value={null} />
                {Array.isArray(instalaciones) && instalaciones.map((item, index) => (
                  <Picker.Item key={`inst-${index}`} label={String(item)} value={item} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {/* 6. TELÉFONO */}
        {instalacionSeleccionada && (
          <>
            <Text style={styles.label}>Teléfono:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese número telefónico..."
              placeholderTextColor="#888888"
              keyboardType="numeric"
              value={telefono}
              onChangeText={handleTelefonoChange}
              onFocus={scrollToBottom}
              maxLength={11}
            />
          </>
        )}

        {/* 7. TH */}
        {instalacionSeleccionada && (
          <>
            <Text style={styles.label}>TH:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese solo números enteros..."
              placeholderTextColor="#888888"
              keyboardType="numeric"
              value={th}
              onChangeText={handleThChange}
              onFocus={scrollToBottom}
              maxLength={10}
            />
          </>
        )}

        {/* RESUMEN FINAL Y BOTÓN SIGUIENTE */}
        {instalacionSeleccionada && telefono !== '' && th !== '' && (
          <>
            <View style={styles.resumenCard}>
              <Text style={styles.resumenTitle}>Selección Completa:</Text>
              <Text style={styles.resumenTexto}>• Región: {regionSeleccionada}</Text>
              <Text style={styles.resumenTexto}>• Estado: {estadoSeleccionado}</Text>
              <Text style={styles.resumenTexto}>• Municipio: {municipioSeleccionado}</Text>
              <Text style={styles.resumenTexto}>• Parroquia: {parroquiaSeleccionada}</Text>
              <Text style={styles.resumenTexto}>• Instalación: {instalacionSeleccionada}</Text>
              <Text style={styles.resumenTexto}>• Teléfono: {telefono}</Text>
              <Text style={styles.resumenTexto}>• TH: {th}</Text>
            </View>

            <TouchableOpacity style={styles.btnSiguiente} onPress={handleSiguiente}>
              <Text style={styles.btnText}>Siguiente</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.btnCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.btnCerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f6f8' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  empresa: { fontSize: 14, color: '#0066cc', fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 10, marginBottom: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#b9c7d3', borderRadius: 8, backgroundColor: '#ffffff', marginBottom: 10, overflow: 'hidden' },
  picker: { color: '#243447', backgroundColor: '#ffffff' },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    color: '#000000',
  },
  resumenCard: { marginTop: 20, padding: 15, backgroundColor: '#e8f5e9', borderRadius: 8, borderWidth: 1, borderColor: '#a5d6a7' },
  resumenTitle: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', marginBottom: 5 },
  resumenTexto: { color: '#17202a' },
  btnSiguiente: {
    marginTop: 20,
    backgroundColor: '#0066cc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnCerrarSesion: {
    marginTop: 28,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCerrarSesionTexto: {
    color: '#d9534f',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
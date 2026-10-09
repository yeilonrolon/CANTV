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
  Modal,
  FlatList,
} from 'react-native';

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
  
  const [telefonoInstalacion, setTelefonoInstalacion] = useState('');
  const [telefonoInspector, setTelefonoInspector] = useState('');
  const [th, setTh] = useState('');
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorClave, setSelectorClave] = useState('');
  const [selectorTitulo, setSelectorTitulo] = useState('');
  const [busqueda, setBusqueda] = useState('');

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

  const normalizarTexto = (texto) => String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const opcionesSelector = {
    REGION: regiones,
    ESTADO: estados,
    MUNICIPIO: municipios,
    PARROQUIA: parroquias,
    INSTALACION: instalaciones,
  }[selectorClave] || [];
  const opcionesFiltradas = opcionesSelector.filter((opcion) =>
    normalizarTexto(opcion).includes(normalizarTexto(busqueda.trim()))
  );

  const abrirSelector = (clave, titulo) => {
    setSelectorClave(clave);
    setSelectorTitulo(titulo);
    setBusqueda('');
    setSelectorVisible(true);
  };

  const seleccionarUbicacion = (valor) => {
    switch (selectorClave) {
      case 'REGION':
        setRegionSeleccionada(valor);
        setEstadoSeleccionado(null);
        setMunicipioSeleccionado(null);
        setParroquiaSeleccionada(null);
        setInstalacionSeleccionada(null);
        break;
      case 'ESTADO':
        setEstadoSeleccionado(valor);
        setMunicipioSeleccionado(null);
        setParroquiaSeleccionada(null);
        setInstalacionSeleccionada(null);
        break;
      case 'MUNICIPIO':
        setMunicipioSeleccionado(valor);
        setParroquiaSeleccionada(null);
        setInstalacionSeleccionada(null);
        break;
      case 'PARROQUIA':
        setParroquiaSeleccionada(valor);
        setInstalacionSeleccionada(null);
        break;
      case 'INSTALACION':
        setInstalacionSeleccionada(valor);
        break;
      default:
        break;
    }
    setSelectorVisible(false);
    setBusqueda('');
  };

  const seleccionarPersonalizada = () => {
    const valor = busqueda.trim();
    if (!valor) {
      Alert.alert('Opción personalizada', 'Escriba el valor que desea agregar en el buscador.');
      return;
    }
    seleccionarUbicacion(valor);
  };

  const handleTelefonoInstalacionChange = (text) => {
    const numLimpio = text.replace(/[^0-9]/g, '');
    setTelefonoInstalacion(numLimpio);
  };

  const handleTelefonoInspectorChange = (text) => {
    const numLimpio = text.replace(/[^0-9]/g, '');
    setTelefonoInspector(numLimpio);
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
      !telefonoInstalacion ||
      !telefonoInspector ||
      !th
    ) {
      Alert.alert('Campos incompletos', 'Complete los datos de ubicación, ambos teléfonos y el TH antes de continuar.');
      return;
    }

    navigation.navigate('Fotosede', {
      region: regionSeleccionada,
      estado: estadoSeleccionado,
      municipio: municipioSeleccionado,
      parroquia: parroquiaSeleccionada,
      instalacion: instalacionSeleccionada,
      telefonoInstalacion,
      telefonoInspector,
      telefono: telefonoInstalacion,
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
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
        <TouchableOpacity style={styles.pickerContainer} onPress={() => abrirSelector('REGION', 'Región')}>
          <Text style={regionSeleccionada ? styles.selectorTexto : styles.selectorPlaceholder}>
            {regionSeleccionada || 'Seleccione una Región...'}
          </Text>
        </TouchableOpacity>

        {/* 2. ESTADO */}
        {regionSeleccionada && (
          <>
            <Text style={styles.label}>Estado:</Text>
            <TouchableOpacity style={styles.pickerContainer} onPress={() => abrirSelector('ESTADO', 'Estado')}>
              <Text style={estadoSeleccionado ? styles.selectorTexto : styles.selectorPlaceholder}>
                {estadoSeleccionado || 'Seleccione un Estado...'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* 3. MUNICIPIO */}
        {estadoSeleccionado && (
          <>
            <Text style={styles.label}>Municipio:</Text>
            <TouchableOpacity style={styles.pickerContainer} onPress={() => abrirSelector('MUNICIPIO', 'Municipio')}>
              <Text style={municipioSeleccionado ? styles.selectorTexto : styles.selectorPlaceholder}>
                {municipioSeleccionado || 'Seleccione un Municipio...'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* 4. PARROQUIA */}
        {municipioSeleccionado && (
          <>
            <Text style={styles.label}>Parroquia:</Text>
            <TouchableOpacity style={styles.pickerContainer} onPress={() => abrirSelector('PARROQUIA', 'Parroquia')}>
              <Text style={parroquiaSeleccionada ? styles.selectorTexto : styles.selectorPlaceholder}>
                {parroquiaSeleccionada || 'Seleccione una Parroquia...'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* 5. INSTALACIÓN */}
        {parroquiaSeleccionada && (
          <>
            <Text style={styles.label}>Instalación:</Text>
            <TouchableOpacity style={styles.pickerContainer} onPress={() => abrirSelector('INSTALACION', 'Instalación')}>
              <Text style={instalacionSeleccionada ? styles.selectorTexto : styles.selectorPlaceholder}>
                {instalacionSeleccionada || 'Seleccione una Instalación...'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* 6. TELÉFONOS DE CONTACTO */}
        {instalacionSeleccionada && (
          <>
            <Text style={styles.label}>Teléfono de la instalación:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el teléfono de la instalación"
              placeholderTextColor="#888888"
              keyboardType="numeric"
              value={telefonoInstalacion}
              onChangeText={handleTelefonoInstalacionChange}
              onFocus={scrollToBottom}
              maxLength={11}
            />

            <Text style={styles.label}>Teléfono del inspector:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el teléfono del inspector"
              placeholderTextColor="#888888"
              keyboardType="numeric"
              value={telefonoInspector}
              onChangeText={handleTelefonoInspectorChange}
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
        {instalacionSeleccionada && telefonoInstalacion !== '' && telefonoInspector !== '' && th !== '' && (
          <>
            <View style={styles.resumenCard}>
              <Text style={styles.resumenTitle}>Selección Completa:</Text>
              <Text style={styles.resumenTexto}>• Región: {regionSeleccionada}</Text>
              <Text style={styles.resumenTexto}>• Estado: {estadoSeleccionado}</Text>
              <Text style={styles.resumenTexto}>• Municipio: {municipioSeleccionado}</Text>
              <Text style={styles.resumenTexto}>• Parroquia: {parroquiaSeleccionada}</Text>
              <Text style={styles.resumenTexto}>• Instalación: {instalacionSeleccionada}</Text>
              <Text style={styles.resumenTexto}>• Teléfono de la instalación: {telefonoInstalacion}</Text>
              <Text style={styles.resumenTexto}>• Teléfono del inspector: {telefonoInspector}</Text>
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

      <Modal
        visible={selectorVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectorVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Seleccionar {selectorTitulo}</Text>
            <TextInput
              style={styles.busquedaInput}
              placeholder={`Buscar ${selectorTitulo.toLowerCase()}...`}
              placeholderTextColor="#78838c"
              value={busqueda}
              onChangeText={setBusqueda}
              autoFocus
            />
            {opcionesFiltradas.length > 0 ? (
              <FlatList
                style={styles.listaOpciones}
                data={opcionesFiltradas}
                keyExtractor={(item, index) => `${item}-${index}`}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.opcionItem} onPress={() => seleccionarUbicacion(item)}>
                    <Text style={styles.opcionTexto}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.sinResultados}>No hay coincidencias. Puede agregar un valor personalizado.</Text>
            )}
            {busqueda.trim() !== '' && (
              <TouchableOpacity style={styles.opcionPersonalizada} onPress={seleccionarPersonalizada}>
                <Text style={styles.opcionPersonalizadaTexto}>
                  Usar "{busqueda.trim()}" como {selectorTitulo.toLowerCase()}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.botonCancelar} onPress={() => setSelectorVisible(false)}>
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f6f8' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  empresa: { fontSize: 14, color: '#0066cc', fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 10, marginBottom: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#b9c7d3', borderRadius: 8, backgroundColor: '#ffffff', marginBottom: 10, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 14 },
  selectorTexto: { color: '#243447', fontSize: 16 },
  selectorPlaceholder: { color: '#78838c', fontSize: 16 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#ffffff', borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 18, height: '82%', maxHeight: '82%' },
  listaOpciones: { flex: 1 },
  modalTitulo: { color: '#243447', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  busquedaInput: { borderWidth: 1, borderColor: '#b9c7d3', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 10, color: '#17202a', marginBottom: 8 },
  opcionItem: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#edf0f2' },
  opcionTexto: { color: '#243447', fontSize: 15 },
  sinResultados: { color: '#63717c', textAlign: 'center', paddingVertical: 22 },
  opcionPersonalizada: { backgroundColor: '#e8f5e9', borderRadius: 7, padding: 12, marginTop: 8 },
  opcionPersonalizadaTexto: { color: '#22633a', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  botonCancelar: { backgroundColor: '#eef1f3', borderRadius: 7, padding: 12, marginTop: 10, alignItems: 'center' },
  botonCancelarTexto: { color: '#34495e', fontWeight: '600' },
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
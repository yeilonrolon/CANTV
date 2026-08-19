import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  Alert, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

import { 
  NIVELES, 
  AREAS, 
  UNIDADES_RESPONSABLES, 
  CRITICIDAD, 
  STATUS 
} from '../constants/Eleccion'; 

import { 
  getRubrosUnicos, 
  getDetallesPorRubro 
} from '../constants/actividadesRubro'; 

export default function CuadroScreen({ route, navigation }) {
  // Recibir las secciones previas guardadas (si existen)
  const seccionesAcumuladas = route?.params?.seccionesAcumuladas || [];

  const [nivelSeleccionado, setNivelSeleccionado] = useState(null);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [criticidadSeleccionada, setCriticidadSeleccionada] = useState(null);
  const [statusSeleccionado, setStatusSeleccionado] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoModal, setTipoModal] = useState({ clave: '', titulo: '' });

  const [modalTextoVisible, setModalTextoVisible] = useState(false);
  const [textoManual, setTextoManual] = useState('');

  // Limpiar campos del formulario cuando se recibe una actualización de secciones acumuladas
  useEffect(() => {
    if (route?.params?.seccionesAcumuladas) {
      limpiarFormulario();
    }
  }, [route?.params?.seccionesAcumuladas]);

  const limpiarFormulario = () => {
    setNivelSeleccionado(null);
    setAreaSeleccionada(null);
    setRubroSeleccionado(null);
    setDetalleSeleccionado(null);
    setUnidadSeleccionada(null);
    setCriticidadSeleccionada(null);
    setStatusSeleccionado(null);
  };

  const abrirSelector = (clave, titulo) => {
    if (clave === 'DETALLE' && !rubroSeleccionado) {
      Alert.alert('Atención', 'Primero debe seleccionar o escribir un Rubro para ver o redactar el detalle.');
      return;
    }

    setTipoModal({ clave, titulo });
    setModalVisible(true);
  };

  const seleccionarOpcion = (item) => {
    if (item === '__ESCRIBIR_MANUAL__') {
      setModalVisible(false);
      if (tipoModal.clave === 'AREA') setTextoManual(areaSeleccionada || '');
      if (tipoModal.clave === 'RUBRO') setTextoManual(rubroSeleccionado || '');
      if (tipoModal.clave === 'DETALLE') setTextoManual(detalleSeleccionado || '');
      setModalTextoVisible(true);
      return;
    }

    switch (tipoModal.clave) {
      case 'NIVEL':
        setNivelSeleccionado(item);
        break;
      case 'AREA':
        setAreaSeleccionada(item);
        break;
      case 'RUBRO':
        setRubroSeleccionado(item);
        setDetalleSeleccionado(null);
        break;
      case 'DETALLE':
        setDetalleSeleccionado(item);
        break;
      case 'UNIDAD':
        setUnidadSeleccionada(item);
        break;
      case 'CRITICIDAD':
        setCriticidadSeleccionada(item);
        break;
      case 'STATUS':
        setStatusSeleccionado(item);
        break;
      default:
        break;
    }
    setModalVisible(false);
  };

  const guardarTextoManual = () => {
    const textoLimpio = textoManual.trim();
    if (!textoLimpio) {
      Alert.alert('Atención', 'Por favor ingrese un texto válido.');
      return;
    }

    switch (tipoModal.clave) {
      case 'AREA':
        setAreaSeleccionada(textoLimpio);
        break;
      case 'RUBRO':
        setRubroSeleccionado(textoLimpio);
        setDetalleSeleccionado(null);
        break;
      case 'DETALLE':
        setDetalleSeleccionado(textoLimpio);
        break;
      default:
        break;
    }

    setModalTextoVisible(false);
    setTextoManual('');
  };

  const obtenerDatosModal = () => {
    let opciones = [];

    switch (tipoModal.clave) {
      case 'NIVEL':
        return NIVELES || [];
      case 'AREA':
        opciones = AREAS || [];
        return ['__ESCRIBIR_MANUAL__', ...opciones];
      case 'RUBRO':
        opciones = getRubrosUnicos();
        return ['__ESCRIBIR_MANUAL__', ...opciones];
      case 'DETALLE':
        opciones = getDetallesPorRubro(rubroSeleccionado);
        return ['__ESCRIBIR_MANUAL__', ...opciones];
      case 'UNIDAD':
        return UNIDADES_RESPONSABLES || [];
      case 'CRITICIDAD':
        return CRITICIDAD || [];
      case 'STATUS':
        return STATUS || [];
      default:
        return [];
    }
  };

  // ✏️ Reemplaza esta función dentro de CuadroScreen.js
const manejarSiguiente = () => {
  if (!nivelSeleccionado || !areaSeleccionada || !rubroSeleccionado) {
    Alert.alert('Campos incompletos', 'Por favor complete al menos los campos Nivel, Área y Rubro antes de continuar.');
    return;
  }

  const datosInspeccion = {
    nivel: nivelSeleccionado,
    area: areaSeleccionada,
    rubro: rubroSeleccionado,
    detalle: detalleSeleccionado,
    unidad: unidadSeleccionada,
    criticidad: criticidadSeleccionada,
    status: statusSeleccionado,
  };

  // 💡 EXTRAER Y PRESERVAR TODOS LOS DATOS PREVIOS (Ubicación, CO2, PQS, Foto Extintor, etc.)
  const { seccionesAcumuladas: _, ...datosGenerales } = route?.params || {};

  if (navigation) {
    navigation.navigate('FotoCuadro', { 
      ...datosGenerales, // 👈 ¡Pase completo de variables hacia FotoCuadro!
      datosInspeccion, 
      seccionesAcumuladas 
    });
  }
};

  const irAlResumenPDF = () => {
    if (navigation) {
      navigation.navigate('TablaCuadros', { 
        seccionesAcumuladas 
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Formulario de Inspección</Text>
        <Text style={styles.subtitulo}>
          {seccionesAcumuladas.length > 0 
            ? `Cuadros guardados anteriormente: ${seccionesAcumuladas.length}`
            : 'Seleccione las opciones correspondientes:'}
        </Text>

        <Text style={styles.label}>Nivel:</Text>
        <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('NIVEL', 'Nivel')}>
          <Text style={nivelSeleccionado ? styles.textoSeleccionado : styles.placeholder}>
            {nivelSeleccionado || 'Seleccione un nivel'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Área:</Text>
        <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('AREA', 'Área')}>
          <Text style={areaSeleccionada ? styles.textoSeleccionado : styles.placeholder}>
            {areaSeleccionada || 'Seleccione o escriba un área'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Rubro:</Text>
        <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('RUBRO', 'Rubro')}>
          <Text style={rubroSeleccionado ? styles.textoSeleccionado : styles.placeholder}>
            {rubroSeleccionado || 'Seleccione o escriba un rubro'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Detalle de la Actividad / Desviación:</Text>
        <TouchableOpacity 
          style={[styles.selector, !rubroSeleccionado && styles.selectorDeshabilitado]} 
          onPress={() => abrirSelector('DETALLE', 'Detalle de la Actividad / Desviación')}
        >
          <Text style={detalleSeleccionado ? styles.textoSeleccionado : styles.placeholder}>
            {detalleSeleccionado || (rubroSeleccionado ? 'Seleccione o escriba el detalle' : 'Primero seleccione un rubro')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Unidad Responsable:</Text>
        <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('UNIDAD', 'Unidad Responsable')}>
          <Text style={unidadSeleccionada ? styles.textoSeleccionado : styles.placeholder}>
            {unidadSeleccionada || 'Seleccione una unidad responsable'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Criticidad:</Text>
        <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('CRITICIDAD', 'Criticidad')}>
          <Text style={criticidadSeleccionada ? styles.textoSeleccionado : styles.placeholder}>
            {criticidadSeleccionada || 'Seleccione un nivel de criticidad'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Estatus:</Text>
        <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('STATUS', 'Estatus')}>
          <Text style={statusSeleccionado ? styles.textoSeleccionado : styles.placeholder}>
            {statusSeleccionado || 'Seleccione el estatus'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonSiguiente} onPress={manejarSiguiente}>
          <Text style={styles.botonSiguienteTexto}>Siguiente (Capturar Fotos)</Text>
        </TouchableOpacity>

        {seccionesAcumuladas.length > 0 && (
          <TouchableOpacity 
            style={[styles.botonCerrar, { marginTop: 0, marginBottom: 20 }]} 
            onPress={irAlResumenPDF}
          >
            <Text style={styles.botonCerrarTexto}>Ver Resumen ({seccionesAcumuladas.length})</Text>
          </TouchableOpacity>
        )}

        {/* Modal 1: Lista de Selección */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Seleccionar {tipoModal.titulo}</Text>
              
              <FlatList
                data={obtenerDatosModal()}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  const esOpcionEscritura = item === '__ESCRIBIR_MANUAL__';

                  return (
                    <TouchableOpacity
                      style={[styles.opcionItem, esOpcionEscritura && styles.opcionEscribirItem]}
                      onPress={() => seleccionarOpcion(item)}
                    >
                      <Text style={[styles.opcionTexto, esOpcionEscritura && styles.opcionEscribirTexto]}>
                        {esOpcionEscritura 
                          ? `✍️ Escribir ${tipoModal.titulo.toLowerCase()} personalizado...` 
                          : item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <TouchableOpacity
                style={styles.botonCerrar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botonCerrarTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 2: Entrada de Texto Libre */}
        <Modal
          visible={modalTextoVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalTextoVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlayCentro}>
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', alignItems: 'center' }}
              >
                <View style={styles.modalTextoContainer}>
                  <Text style={styles.modalTitulo}>Escribir {tipoModal.titulo}</Text>
                  
                  <TextInput
                    style={styles.textInputManual}
                    placeholder={`Ingrese el valor para ${tipoModal.titulo.toLowerCase()}...`}
                    placeholderTextColor="#999999"
                    multiline={tipoModal.clave === 'DETALLE'}
                    numberOfLines={tipoModal.clave === 'DETALLE' ? 4 : 1}
                    value={textoManual}
                    onChangeText={setTextoManual}
                    autoFocus={true}
                  />

                  <View style={styles.contenedorBotonesTexto}>
                    <TouchableOpacity
                      style={[styles.botonModalTexto, styles.botonCancelarTexto]}
                      onPress={() => {
                        setModalTextoVisible(false);
                        setTextoManual('');
                      }}
                    >
                      <Text style={styles.botonCerrarTexto}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.botonModalTexto, styles.botonGuardarTexto]}
                      onPress={guardarTextoManual}
                    >
                      <Text style={styles.botonGuardarTextoLimpio}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
    marginTop: 10,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 6,
  },
  selectorDeshabilitado: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  placeholder: {
    color: '#888888',
    fontSize: 15,
  },
  textoSeleccionado: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '500',
  },
  botonSiguiente: {
    backgroundColor: '#0066cc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  botonSiguienteTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayCentro: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  opcionItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  opcionEscribirItem: {
    backgroundColor: '#eef6ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderBottomWidth: 0,
  },
  opcionTexto: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  opcionEscribirTexto: {
    color: '#0066cc',
    fontWeight: '600',
  },
  botonCerrar: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCerrarTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  modalTextoContainer: {
    backgroundColor: '#ffffff',
    width: '90%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  textInputManual: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#fafafa',
    marginTop: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  contenedorBotonesTexto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonModalTexto: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    backgroundColor: '#e0e0e0',
  },
  botonGuardarTexto: {
    backgroundColor: '#0066cc',
  },
  botonGuardarTextoLimpio: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
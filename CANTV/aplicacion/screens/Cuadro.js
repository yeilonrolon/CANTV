import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
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
import { generarYCompartirPDF } from '../constants/pdf';
import { guardarReporte } from '../constants/reportes';
import { obtenerInspectorActivo } from '../constants/inspectores';

export default function CuadroScreen({ route, navigation }) {
  // Recibir las secciones previas guardadas (si existen)
  const seccionesAcumuladas = route?.params?.seccionesAcumuladas || [];

  const [nivelSeleccionado, setNivelSeleccionado] = useState(null);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [tieneCantidad, setTieneCantidad] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [criticidadSeleccionada, setCriticidadSeleccionada] = useState(null);
  const [statusSeleccionado, setStatusSeleccionado] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoModal, setTipoModal] = useState({ clave: '', titulo: '' });

  const [modalTextoVisible, setModalTextoVisible] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [textoManual, setTextoManual] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const scrollViewRef = useRef(null);
  const modalTextoScrollRef = useRef(null);

  const desplazarAlCampo = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
  };

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
    setTieneCantidad(null);
    setCantidad('');
    setUnidadSeleccionada(null);
    setCriticidadSeleccionada(null);
    setStatusSeleccionado(null);
  };

  const generarPdfAcumulado = async () => {
    if (!seccionesAcumuladas.length || generandoPdf) return;

    setGenerandoPdf(true);
    try {
      const datosGenerales = { ...(route?.params || {}) };
      delete datosGenerales.seccionesAcumuladas;
      const reporteCompleto = {
        ...datosGenerales,
        cuadros: seccionesAcumuladas,
        inspector: await obtenerInspectorActivo(),
      };
      const idReporteExistente = datosGenerales.agregarAlReporte ? datosGenerales.id : null;
      const reporteGuardado = await guardarReporte(reporteCompleto, idReporteExistente);
      await generarYCompartirPDF(reporteGuardado, { nombreArchivo: true });
      Alert.alert(
        'PDF generado con éxito',
        'Se generó el PDF con las desviaciones ya guardadas y sus fotografías.',
        [{
          text: 'Volver al inicio',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] }),
        }],
        { cancelable: false }
      );
    } catch (error) {
      console.error('No se pudo generar el PDF de las desviaciones guardadas:', error);
      Alert.alert('Error', 'No se pudo generar el PDF con la información guardada. Inténtelo nuevamente.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const abrirSelector = (clave, titulo) => {
    if (clave === 'DETALLE' && !rubroSeleccionado) {
      Alert.alert('Atención', 'Primero debe seleccionar o escribir un Rubro para ver o redactar el detalle.');
      return;
    }

    setTipoModal({ clave, titulo });
    setBusqueda('');
    setModalVisible(true);
  };

  const seleccionarOpcion = (item) => {
    if (item === '__ESCRIBIR_MANUAL__') {
      setModalVisible(false);
      if (tipoModal.clave === 'AREA') setTextoManual(busqueda.trim() || areaSeleccionada || '');
      if (tipoModal.clave === 'RUBRO') setTextoManual(busqueda.trim() || rubroSeleccionado || '');
      if (tipoModal.clave === 'DETALLE') setTextoManual(busqueda.trim() || detalleSeleccionado || '');
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
    setBusqueda('');
  };

  const guardarTextoManual = () => {
    const textoLimpio = textoManual.trim().toUpperCase();
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
    setBusqueda('');
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

  const normalizarTexto = (texto) => String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const datosModalFiltrados = obtenerDatosModal().filter((opcion) =>
    opcion === '__ESCRIBIR_MANUAL__' || normalizarTexto(opcion).includes(normalizarTexto(busqueda.trim()))
  );

const manejarSiguiente = () => {
  const camposObligatorios = [
    ['Nivel', nivelSeleccionado],
    ['Área', areaSeleccionada],
    ['Rubro', rubroSeleccionado],
    ['Detalle de la Actividad / Desviación', detalleSeleccionado],
    ['Unidad Responsable', unidadSeleccionada],
    ['Criticidad', criticidadSeleccionada],
    ['Estatus', statusSeleccionado],
  ];
  const camposFaltantes = camposObligatorios
    .filter(([, valor]) => !String(valor ?? '').trim())
    .map(([nombre]) => nombre);

  if (camposFaltantes.length > 0) {
    Alert.alert(
      'Campos incompletos',
      `Complete los siguientes campos antes de continuar: ${camposFaltantes.join(', ')}.`
    );
    return;
  }

  if (tieneCantidad === null) {
    Alert.alert('Campo incompleto', 'Indique si la desviación corresponde a una cantidad.');
    return;
  }

  const cantidadNumerica = Number(cantidad);
  if (tieneCantidad && (!Number.isSafeInteger(cantidadNumerica) || cantidadNumerica < 1)) {
    Alert.alert('Cantidad inválida', 'Ingrese una cantidad entera mayor que cero.');
    return;
  }

  const datosInspeccion = {
    nivel: nivelSeleccionado,
    area: areaSeleccionada,
    rubro: rubroSeleccionado,
    detalle: detalleSeleccionado,
    tieneCantidad,
    cantidad: tieneCantidad ? cantidadNumerica : null,
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

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>Formulario de Inspección</Text>
        <Text style={styles.subtitulo}>
          {seccionesAcumuladas.length > 0 
            ? `Cuadros guardados anteriormente: ${seccionesAcumuladas.length}`
            : 'Seleccione las opciones correspondientes:'}
        </Text>
        {seccionesAcumuladas.length > 0 && (
          <View style={styles.pdfAcumuladoContainer}>
            <Text style={styles.pdfAcumuladoAyuda}>
              ¿Ya terminó y no necesita agregar otra desviación? Puede generar el PDF con las desviaciones y fotos ya guardadas.
            </Text>
            <TouchableOpacity
              style={[styles.botonPdfAcumulado, generandoPdf && styles.botonPdfDeshabilitado]}
              onPress={generarPdfAcumulado}
              disabled={generandoPdf}
              accessibilityRole="button"
            >
              {generandoPdf
                ? <ActivityIndicator color="#ffffff" />
                : <Text style={styles.botonPdfAcumuladoTexto}>Generar PDF con la información suministrada</Text>}
            </TouchableOpacity>
          </View>
        )}

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

        <Text style={styles.label}>¿La desviación es por cantidad?</Text>
        <View style={styles.opcionesCantidad}>
          {[true, false].map((opcion) => (
            <TouchableOpacity
              key={String(opcion)}
              style={[
                styles.botonCantidad,
                tieneCantidad === opcion && styles.botonCantidadSeleccionado,
              ]}
              onPress={() => {
                setTieneCantidad(opcion);
                if (!opcion) setCantidad('');
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: tieneCantidad === opcion }}
            >
              <Text
                style={[
                  styles.textoBotonCantidad,
                  tieneCantidad === opcion && styles.textoBotonCantidadSeleccionado,
                ]}
              >
                {opcion ? 'Sí' : 'No'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {tieneCantidad && (
          <>
            <Text style={styles.label}>Cantidad:</Text>
            <TextInput
              style={styles.selector}
              placeholder="Ingrese la cantidad"
              placeholderTextColor="#888888"
              value={cantidad}
              onChangeText={(texto) => setCantidad(texto.replace(/\D/g, ''))}
              onFocus={desplazarAlCampo}
              keyboardType="number-pad"
              accessibilityLabel="Cantidad de elementos con la desviación"
            />
          </>
        )}

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

        {/* Modal 1: Lista de Selección */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Seleccionar {tipoModal.titulo}</Text>
              <TextInput
                style={styles.busquedaInput}
                placeholder={`Buscar ${tipoModal.titulo.toLowerCase()}...`}
                placeholderTextColor="#888888"
                value={busqueda}
                onChangeText={setBusqueda}
                onFocus={desplazarAlCampo}
              />
              <FlatList
                style={styles.listaOpciones}
                data={datosModalFiltrados}
                keyExtractor={(item, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
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
                ListEmptyComponent={<Text style={styles.sinResultados}>No hay opciones que coincidan.</Text>}
              />

              <TouchableOpacity
                style={styles.botonCerrar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botonCerrarTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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
                <ScrollView
                  ref={modalTextoScrollRef}
                  contentContainerStyle={styles.modalTextoScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.modalTextoContainer}>
                    <Text style={styles.modalTitulo}>Escribir {tipoModal.titulo}</Text>

                    <TextInput
                      style={styles.textInputManual}
                      placeholder={`Ingrese el valor para ${tipoModal.titulo.toLowerCase()}...`}
                      placeholderTextColor="#888888"
                      multiline={tipoModal.clave === 'DETALLE'}
                      numberOfLines={tipoModal.clave === 'DETALLE' ? 4 : 1}
                      value={textoManual}
                      onChangeText={(texto) => setTextoManual(texto.toUpperCase())}
                      onFocus={() => {
                        setTimeout(() => modalTextoScrollRef.current?.scrollToEnd({ animated: true }), 150);
                      }}
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
                </ScrollView>
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
    backgroundColor: '#f4f6f8',
    flexGrow: 1,
    paddingBottom: 140,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 14,
    color: '#476b8d',
    fontWeight: '500',
    marginBottom: 15,
  },
  pdfAcumuladoContainer: {
    backgroundColor: '#eaf4ff',
    borderWidth: 1,
    borderColor: '#b7d6f5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  pdfAcumuladoAyuda: {
    color: '#34495e',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  botonPdfAcumulado: {
    backgroundColor: '#0066cc',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPdfDeshabilitado: { backgroundColor: '#9aa7b2' },
  botonPdfAcumuladoTexto: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderColor: '#c7d1da',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginBottom: 6,
  },
  selectorDeshabilitado: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  opcionesCantidad: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  botonCantidad: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c7d1da',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  botonCantidadSeleccionado: {
    backgroundColor: '#145da0',
    borderColor: '#145da0',
  },
  textoBotonCantidad: {
    color: '#17202a',
    fontSize: 15,
    fontWeight: '600',
  },
  textoBotonCantidadSeleccionado: {
    color: '#ffffff',
  },
  placeholder: {
    color: '#888888',
    fontSize: 15,
  },
  textoSeleccionado: {
    color: '#17202a',
    fontSize: 15,
    fontWeight: '500',
  },
  botonSiguiente: {
    backgroundColor: '#145da0',
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
    height: '70%',
    maxHeight: '70%',
  },
  listaOpciones: { flex: 1 },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  busquedaInput: {
    borderWidth: 1,
    borderColor: '#c7d1da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#17202a',
    marginBottom: 8,
  },
  sinResultados: {
    color: '#63717c',
    textAlign: 'center',
    paddingVertical: 20,
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
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTextoScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  textInputManual: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#000000',
    backgroundColor: '#FFFFFF',
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
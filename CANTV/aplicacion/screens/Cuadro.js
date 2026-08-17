import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  Alert, 
  TextInput 
} from 'react-native';

// Importamos las constantes generales desde Eleccion.js
import { 
  NIVELES, 
  AREAS, 
  UNIDADES_RESPONSABLES, 
  CRITICIDAD, 
  STATUS 
} from '../constants/Eleccion'; 

// Importamos los datos y funciones helper desde actividadesrubro.js
import { 
  getRubrosUnicos, 
  getDetallesPorRubro 
} from '../constants/actividadesRubro'; 

export default function CuadroScreen() {
  // Estados para almacenar las selecciones del usuario
  const [nivelSeleccionado, setNivelSeleccionado] = useState(null);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [criticidadSeleccionada, setCriticidadSeleccionada] = useState(null);
  const [statusSeleccionado, setStatusSeleccionado] = useState(null);

  // Estados para controlar el Modal de lista de opciones
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoModal, setTipoModal] = useState({ clave: '', titulo: '' });

  // Estados para el Modal de entrada manual de texto (Escribir personalizado)
  const [modalTextoVisible, setModalTextoVisible] = useState(false);
  const [textoManual, setTextoManual] = useState('');

  // Abre el modal asignando el tipo y título correspondientes
  const abrirSelector = (clave, titulo) => {
    // Validación previa para Detalle de la Actividad
    if (clave === 'DETALLE' && !rubroSeleccionado) {
      Alert.alert('Atención', 'Primero debe seleccionar o escribir un Rubro para ver o redactar el detalle.');
      return;
    }

    setTipoModal({ clave, titulo });
    setModalVisible(true);
  };

  // Asigna la opción elegida al estado correspondiente
  const seleccionarOpcion = (item) => {
    // Opción para abrir campo de texto libre
    if (item === '__ESCRIBIR_MANUAL__') {
      setModalVisible(false);
      // Precargamos el texto existente si ya había escrito algo previamente
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
        setDetalleSeleccionado(null); // Resetea el detalle si cambia de rubro
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

  // Guarda el texto libre ingresado por el usuario
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
        setDetalleSeleccionado(null); // Resetea el detalle
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

  // Obtiene los datos correspondientes añadiendo la opción de escribir si aplica
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

  const manejarSiguiente = () => {
    // Por el momento no hace nada, listo para agregar lógica o navegación posterior
    console.log('Botón Siguiente presionado');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Formulario de Inspección</Text>
      <Text style={styles.subtitulo}>Seleccione las opciones correspondientes:</Text>

      {/* 1. Selector de Nivel */}
      <Text style={styles.label}>Nivel:</Text>
      <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('NIVEL', 'Nivel')}>
        <Text style={nivelSeleccionado ? styles.textoSeleccionado : styles.placeholder}>
          {nivelSeleccionado || 'Seleccione un nivel'}
        </Text>
      </TouchableOpacity>

      {/* 2. Selector de Área (Con opción a escribir) */}
      <Text style={styles.label}>Área:</Text>
      <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('AREA', 'Área')}>
        <Text style={areaSeleccionada ? styles.textoSeleccionado : styles.placeholder}>
          {areaSeleccionada || 'Seleccione o escriba un área'}
        </Text>
      </TouchableOpacity>

      {/* 3. Selector de Rubro (Con opción a escribir) */}
      <Text style={styles.label}>Rubro:</Text>
      <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('RUBRO', 'Rubro')}>
        <Text style={rubroSeleccionado ? styles.textoSeleccionado : styles.placeholder}>
          {rubroSeleccionado || 'Seleccione o escriba un rubro'}
        </Text>
      </TouchableOpacity>

      {/* 4. Selector de Detalle / Desviación (Con opción a escribir) */}
      <Text style={styles.label}>Detalle de la Actividad / Desviación:</Text>
      <TouchableOpacity 
        style={[styles.selector, !rubroSeleccionado && styles.selectorDeshabilitado]} 
        onPress={() => abrirSelector('DETALLE', 'Detalle de la Actividad / Desviación')}
      >
        <Text style={detalleSeleccionado ? styles.textoSeleccionado : styles.placeholder}>
          {detalleSeleccionado || (rubroSeleccionado ? 'Seleccione o escriba el detalle' : 'Primero seleccione un rubro')}
        </Text>
      </TouchableOpacity>

      {/* 5. Selector de Unidad Responsable */}
      <Text style={styles.label}>Unidad Responsable:</Text>
      <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('UNIDAD', 'Unidad Responsable')}>
        <Text style={unidadSeleccionada ? styles.textoSeleccionado : styles.placeholder}>
          {unidadSeleccionada || 'Seleccione una unidad responsable'}
        </Text>
      </TouchableOpacity>

      {/* 6. Selector de Criticidad */}
      <Text style={styles.label}>Criticidad:</Text>
      <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('CRITICIDAD', 'Criticidad')}>
        <Text style={criticidadSeleccionada ? styles.textoSeleccionado : styles.placeholder}>
          {criticidadSeleccionada || 'Seleccione un nivel de criticidad'}
        </Text>
      </TouchableOpacity>

      {/* 7. Selector de Status */}
      <Text style={styles.label}>Estatus:</Text>
      <TouchableOpacity style={styles.selector} onPress={() => abrirSelector('STATUS', 'Estatus')}>
        <Text style={statusSeleccionado ? styles.textoSeleccionado : styles.placeholder}>
          {statusSeleccionado || 'Seleccione el estatus'}
        </Text>
      </TouchableOpacity>

      {/* Botón Siguiente */}
      <TouchableOpacity style={styles.botonSiguiente} onPress={manejarSiguiente}>
        <Text style={styles.botonSiguienteTexto}>Siguiente</Text>
      </TouchableOpacity>

      {/* Modal 1: Lista de Selección de Opciones */}
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

      {/* Modal 2: Campo de Entrada para Escribir Manualmente */}
      <Modal
        visible={modalTextoVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalTextoVisible(false)}
      >
        <View style={styles.modalOverlay}>
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
        </View>
      </Modal>

    </ScrollView>
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
    color: '#666666',
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
  /* Modal Principal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
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
  /* Modal Entrada de Texto */
  modalTextoContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
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
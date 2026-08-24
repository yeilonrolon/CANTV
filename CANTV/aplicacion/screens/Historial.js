import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { eliminarReporte, eliminarTodosLosReportes, obtenerReportes } from '../constants/reportes';

export default function HistorialScreen({ navigation }) {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    setReportes(await obtenerReportes());
    setCargando(false);
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const confirmarEliminar = (reporte) => Alert.alert(
    'Eliminar historial',
    `¿Está seguro de eliminar el reporte de ${reporte.sede || 'esta sede'}?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await eliminarReporte(reporte.id);
        setReportes((actuales) => actuales.filter((item) => item.id !== reporte.id));
      } },
    ]
  );

  const confirmarEliminarTodo = () => Alert.alert(
    'Eliminar todo el historial',
    '¿Está seguro de eliminar todos los reportes guardados?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar todo', style: 'destructive', onPress: async () => {
        await eliminarTodosLosReportes();
        setReportes([]);
      } },
    ]
  );

  const renderReporte = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity onPress={() => navigation.navigate('DetalleHistorial', { reporte: item })}>
        <Text style={styles.sede}>{item.sede || 'Sede sin nombre'}</Text>
        <Text style={styles.detalle}>{item.fecha || (item.fechaCreacion ? new Date(item.fechaCreacion).toLocaleDateString('es-VE') : 'Sin fecha')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.botonEliminar} onPress={() => confirmarEliminar(item)}>
        <Text style={styles.botonEliminarTexto}>Eliminar este reporte</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Historial de Reportes</Text>
      {reportes.length > 0 && <TouchableOpacity style={styles.botonEliminarTodo} onPress={confirmarEliminarTodo}>
        <Text style={styles.botonEliminarTodoTexto}>Eliminar todo el historial</Text>
      </TouchableOpacity>}
      {cargando ? <Text style={styles.vacio}>Cargando...</Text> : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          renderItem={renderReporte}
          contentContainerStyle={reportes.length ? styles.lista : styles.listaVacia}
          ListEmptyComponent={<Text style={styles.vacio}>Todavía no hay reportes guardados.</Text>}
          refreshing={cargando}
          onRefresh={cargar}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 18 },
  titulo: { fontSize: 23, fontWeight: 'bold', color: '#17202a', marginBottom: 16 },
  lista: { paddingBottom: 20 },
  listaVacia: { flexGrow: 1, justifyContent: 'center' },
  item: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#dce1e5' },
  sede: { fontSize: 17, fontWeight: 'bold', color: '#17202a' },
  detalle: { color: '#68737d', marginTop: 4 },
  vacio: { color: '#68737d', textAlign: 'center', fontSize: 16 },
  botonEliminar: { marginTop: 10, alignItems: 'flex-end' },
  botonEliminarTexto: { color: '#b52b38', fontWeight: '600' },
  botonEliminarTodo: { alignSelf: 'flex-end', marginBottom: 10 },
  botonEliminarTodoTexto: { color: '#b52b38', fontWeight: 'bold' },
});

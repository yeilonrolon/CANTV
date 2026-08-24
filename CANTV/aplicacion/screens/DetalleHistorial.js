import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { STATUS } from '../constants/Eleccion';
import { actualizarEstatusCuadro } from '../constants/reportes';
import { generarYCompartirPDF } from '../constants/pdf';

export default function DetalleHistorialScreen({ route }) {
  const [reporte, setReporte] = useState(route?.params?.reporte || {});
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const cuadros = Array.isArray(reporte.cuadros) ? reporte.cuadros : [];

  const cambiarEstatus = async (cuadro, estatus) => {
    try {
      const actualizado = await actualizarEstatusCuadro(reporte.id, cuadro.id, estatus);
      setReporte(actualizado);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estatus del cuadro.');
    }
  };

  const generarPdf = async () => {
    setGenerandoPdf(true);
    try {
      await generarYCompartirPDF(reporte, { nombreArchivo: true });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>{reporte.sede || 'Sede sin nombre'}</Text>
      <Text style={styles.fecha}>{reporte.fecha || new Date(reporte.fechaCreacion).toLocaleDateString('es-VE')}</Text>
      <TouchableOpacity style={[styles.botonPdf, generandoPdf && styles.botonDeshabilitado]} onPress={generarPdf} disabled={generandoPdf}>
        {generandoPdf ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.botonPdfTexto}>Generar PDF</Text>}
      </TouchableOpacity>
      {cuadros.map((cuadro, index) => (
        <View style={styles.item} key={cuadro.id || `${reporte.id}-${index}`}>
          <Text style={styles.cuadro}>Cuadro {index + 1}</Text>
          <Text style={styles.detalle}>{cuadro.rubro || 'Sin rubro'}</Text>
          <Text style={styles.detalle}>{cuadro.detalle || 'Sin observaciones'}</Text>
          <Text style={styles.label}>Estatus del cuadro</Text>
          <View style={styles.selector}>
            <Picker selectedValue={cuadro.status || STATUS[0]} onValueChange={(estatus) => cambiarEstatus(cuadro, estatus)}>
              {STATUS.map((estatus) => <Picker.Item key={estatus} label={estatus} value={estatus} />)}
            </Picker>
          </View>
        </View>
      ))}
      {!cuadros.length && <Text style={styles.vacio}>Este reporte no tiene cuadros guardados.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 18, backgroundColor: '#f4f6f8' },
  titulo: { fontSize: 23, fontWeight: 'bold', color: '#17202a' },
  fecha: { color: '#68737d', marginTop: 4, marginBottom: 16 },
  botonPdf: { backgroundColor: '#0066cc', paddingVertical: 13, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  botonDeshabilitado: { backgroundColor: '#9aa7b2' },
  botonPdfTexto: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  item: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#dce1e5' },
  cuadro: { fontSize: 18, fontWeight: 'bold', color: '#17202a', marginBottom: 7 },
  detalle: { color: '#4f5b66', marginBottom: 4 },
  label: { color: '#17202a', fontWeight: '600', marginTop: 10 },
  selector: { borderWidth: 1, borderColor: '#b9c1c8', borderRadius: 6, marginTop: 6, backgroundColor: '#ffffff' },
  vacio: { color: '#68737d', textAlign: 'center', marginTop: 30 },
});
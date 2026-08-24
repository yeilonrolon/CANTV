import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_REPORTES = '@cantv_reportes_v1';
const DIRECTORIO_REPORTES = `${FileSystem.documentDirectory}reportes/`;
const DIRECTORIO_IMAGENES = `${DIRECTORIO_REPORTES}imagenes/`;

const asegurarDirectorios = async () => {
  await FileSystem.makeDirectoryAsync(DIRECTORIO_IMAGENES, { intermediates: true });
};

const nombreSeguro = (valor) => String(valor || 'reporte')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase() || 'reporte';

export const obtenerNombrePDF = (sede, fecha, id = Date.now()) =>
  `${nombreSeguro(sede)}-${nombreSeguro(fecha)}-${id}.pdf`;

const obtenerFechaLegible = () => new Date().toLocaleDateString('es-VE');

const copiarImagen = async (uri, reporteId, indice) => {
  if (!uri || typeof uri !== 'string' || uri.startsWith('data:image/')) return uri || '';

  try {
    const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();
    const extensionValida = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
    const destino = `${DIRECTORIO_IMAGENES}${reporteId}-${indice}.${extensionValida}`;
    const existente = await FileSystem.getInfoAsync(destino);
    if (!existente.exists) await FileSystem.copyAsync({ from: uri, to: destino });
    return destino;
  } catch (error) {
    console.warn('No se pudo resguardar la imagen:', error);
    return '';
  }
};

export const guardarReporte = async (reporte, idExistente = null) => {
  await asegurarDirectorios();
  const id = idExistente || `${Date.now()}`;
  let indiceImagen = 0;
  const copiar = async (uri) => copiarImagen(uri, id, indiceImagen++);

  const reporteGuardado = {
    ...reporte,
    id,
    fecha: reporte.fecha || obtenerFechaLegible(),
    fechaCreacion: reporte.fechaCreacion || new Date().toISOString(),
    estatusGeneral: reporte.estatusGeneral || 'No Operativo',
    fotoSedeUri: undefined,
    fotoExtintorUri: undefined,
    fotosSede: await Promise.all((reporte.fotosSede || []).map(copiar)),
    fotosExtintor: [],
    fotosParticipantes: await Promise.all((reporte.fotosParticipantes || []).map(copiar)),
    participantes: await Promise.all((reporte.participantes || []).map(async (participante) => ({
      ...participante,
      foto: await copiar(participante?.foto || participante?.fotoUri),
      fotoUri: undefined,
    }))),
    cuadros: await Promise.all((reporte.cuadros || []).map(async (cuadro) => ({
      ...cuadro,
      foto: undefined,
      fotos: await Promise.all((cuadro.fotos || []).map(copiar)),
    }))),
  };

  const reportes = await obtenerReportes();
  const posicion = reportes.findIndex((item) => item.id === id);
  if (posicion >= 0) reportes[posicion] = reporteGuardado;
  else reportes.unshift(reporteGuardado);
  await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(reportes));
  return reporteGuardado;
};

export const obtenerReportes = async () => {
  try {
    const contenido = await AsyncStorage.getItem(CLAVE_REPORTES);
    const reportes = contenido ? JSON.parse(contenido) : [];
    return Array.isArray(reportes) ? reportes : [];
  } catch (error) {
    console.warn('No se pudo leer el historial:', error);
    return [];
  }
};

export const actualizarEstatusReporte = async (id, estatus) => {
  const reportes = await obtenerReportes();
  const actualizados = reportes.map((reporte) => (
    reporte.id === id ? { ...reporte, estatusGeneral: estatus, fechaActualizacion: new Date().toISOString() } : reporte
  ));
  await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(actualizados));
  return actualizados.find((reporte) => reporte.id === id);
};

export const actualizarEstatusCuadro = async (idReporte, idCuadro, estatus) => {
  const reportes = await obtenerReportes();
  const actualizados = reportes.map((reporte) => {
    if (reporte.id !== idReporte) return reporte;

    return {
      ...reporte,
      cuadros: (reporte.cuadros || []).map((cuadro) => (
        cuadro.id === idCuadro ? { ...cuadro, status: estatus } : cuadro
      )),
      fechaActualizacion: new Date().toISOString(),
    };
  });
  await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(actualizados));
  return actualizados.find((reporte) => reporte.id === idReporte);
};

export const eliminarReporte = async (id) => {
  const reportes = await obtenerReportes();
  const reporte = reportes.find((item) => item.id === id);
  const restantes = reportes.filter((item) => item.id !== id);
  await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(restantes));
  return reporte;
};

export const eliminarTodosLosReportes = async () => {
  await AsyncStorage.removeItem(CLAVE_REPORTES);
};

export const limpiarFotosNoUsadas = async () => {
  await asegurarDirectorios();
  const reportes = await obtenerReportes();
  const usadas = new Set();
  reportes.forEach((reporte) => {
    (reporte.fotosSede || []).forEach((foto) => usadas.add(foto));
    (reporte.fotosParticipantes || []).forEach((foto) => usadas.add(foto));
    (reporte.participantes || []).forEach((participante) => usadas.add(participante.foto));
    (reporte.cuadros || []).forEach((cuadro) => (cuadro.fotos || []).forEach((foto) => usadas.add(foto)));
  });

  const archivos = await FileSystem.readDirectoryAsync(DIRECTORIO_IMAGENES);
  let eliminadas = 0;
  for (const archivo of archivos) {
    const uri = `${DIRECTORIO_IMAGENES}${archivo}`;
    if (!usadas.has(uri)) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      eliminadas += 1;
    }
  }
  return eliminadas;
};

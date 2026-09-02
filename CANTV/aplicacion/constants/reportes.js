import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_REPORTES = '@cantv_reportes_v1';
const DIRECTORIO_IMAGENES = `${FileSystem.documentDirectory}fotos_historial/`;

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

const obtenerNombreArchivo = (uri) => String(uri || '').split('?')[0].split('/').pop() || '';

export const obtenerRutaFotoHistorial = (nombreArchivo) => {
  if (!nombreArchivo || typeof nombreArchivo !== 'string') return '';
  const valor = nombreArchivo.trim();
  if (valor.startsWith('data:image/') || valor.startsWith('content://')) return valor;
  if (valor.startsWith('file://')) return valor;
  return `${DIRECTORIO_IMAGENES}${valor.split('?')[0].split('/').pop()}`;
};

export const guardarImagenHistorial = async (uri) => {
  if (!uri || typeof uri !== 'string' || uri.startsWith('data:image/')) return uri || '';

  const nombreExistente = obtenerNombreArchivo(uri);
  if (!uri.includes('://')) return nombreExistente;
  if (uri.startsWith(DIRECTORIO_IMAGENES)) return nombreExistente;

  try {
    await asegurarDirectorios();
    const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();
    const extensionValida = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
    const nombre = `foto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extensionValida}`;
    await FileSystem.copyAsync({ from: uri, to: `${DIRECTORIO_IMAGENES}${nombre}` });
    return nombre;
  } catch (error) {
    console.warn('No se pudo resguardar la imagen:', error);
    // Mantener la URI original permite que el reporte actual no pierda la foto.
    return uri;
  }
};

export const guardarReporte = async (reporte, idExistente = null) => {
  await asegurarDirectorios();
  const id = idExistente || `${Date.now()}`;
  const copiar = guardarImagenHistorial;

  const reporteGuardado = {
    ...reporte,
    id,
    fecha: reporte.fecha || obtenerFechaLegible(),
    fechaCreacion: reporte.fechaCreacion || new Date().toISOString(),
    estatusGeneral: reporte.estatusGeneral || 'No Operativo',
    fotoSedeUri: undefined,
    fotoExtintorUri: undefined,
    fotosSede: await Promise.all((reporte.fotosSede || []).map(copiar)),
    fotosExtintor: await Promise.all((reporte.fotosExtintor || []).map(copiar)),
    fotosParticipantes: await Promise.all((reporte.fotosParticipantes || []).map(copiar)),
    participantes: await Promise.all((reporte.participantes || []).map(async (participante) => ({
      ...participante,
      foto: await copiar(participante?.foto || participante?.fotoUri),
      fotoUri: undefined,
    }))),
    cuadros: await Promise.all((reporte.cuadros || []).map(async (cuadro) => ({
      ...cuadro,
      foto: undefined,
      fotos: await Promise.all((cuadro.fotos || (cuadro.foto ? [cuadro.foto] : [])).map(copiar)),
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

export const reemplazarFotoReporte = async (idReporte, tipo, indice, uri, indiceCuadro = null) => {
  const fotoGuardada = await guardarImagenHistorial(uri);
  const reportes = await obtenerReportes();
  const actualizados = reportes.map((reporte) => {
    if (reporte.id !== idReporte) return reporte;

    if (tipo === 'cuadro' && indiceCuadro !== null) {
      return {
        ...reporte,
        cuadros: (reporte.cuadros || []).map((cuadro, cuadroIndex) => (
          cuadroIndex === indiceCuadro
            ? { ...cuadro, fotos: (cuadro.fotos || []).map((foto, fotoIndex) => fotoIndex === indice ? fotoGuardada : foto) }
            : cuadro
        )),
        fechaActualizacion: new Date().toISOString(),
      };
    }

    return {
      ...reporte,
      [tipo]: (reporte[tipo] || []).map((foto, fotoIndex) => fotoIndex === indice ? fotoGuardada : foto),
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
    (reporte.fotosSede || []).forEach((foto) => usadas.add(obtenerNombreArchivo(foto)));
    (reporte.fotosParticipantes || []).forEach((foto) => usadas.add(obtenerNombreArchivo(foto)));
    (reporte.participantes || []).forEach((participante) => usadas.add(obtenerNombreArchivo(participante.foto)));
    (reporte.cuadros || []).forEach((cuadro) => (cuadro.fotos || []).forEach((foto) => usadas.add(obtenerNombreArchivo(foto))));
  });

  const archivos = await FileSystem.readDirectoryAsync(DIRECTORIO_IMAGENES);
  let eliminadas = 0;
  for (const archivo of archivos) {
    const uri = `${DIRECTORIO_IMAGENES}${archivo}`;
    if (!usadas.has(archivo)) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      eliminadas += 1;
    }
  }
  return eliminadas;
};

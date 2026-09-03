import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_REPORTES = '@cantv_reportes_v1';
const DIRECTORIO_IMAGENES_LEGACY = `${FileSystem.documentDirectory}fotos_historial/`;
const ALBUM_FOTOS = 'Inspecciones SHA';

const nombreSeguro = (valor) => String(valor || 'reporte')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase() || 'reporte';

export const obtenerNombrePDF = (sede, fecha, id = Date.now()) =>
  `${nombreSeguro(sede)}-${nombreSeguro(fecha)}-${id}.pdf`;

const obtenerFechaLegible = () => new Date().toLocaleDateString('es-VE');

const obtenerMarcaModificacion = () => {
  const ahora = new Date();
  return {
    fecha: ahora.toLocaleDateString('es-VE'),
    fechaActualizacion: ahora.toISOString(),
  };
};

export const obtenerRutaFotoHistorial = (nombreArchivo) => {
  if (!nombreArchivo || typeof nombreArchivo !== 'string') return '';
  const valor = nombreArchivo.trim();
  if (valor.startsWith('data:image/') || valor.startsWith('content://') || valor.startsWith('ph://')) return valor;
  if (valor.startsWith('file://')) return valor;
  return `${DIRECTORIO_IMAGENES_LEGACY}${valor.split('?')[0].split('/').pop()}`;
};

export const guardarFotoEnGaleria = async (uri) => {
  if (!uri || typeof uri !== 'string') return '';

  try {
    const permiso = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
    if (!permiso.granted) throw new Error('Permiso de galería denegado.');

    const album = await MediaLibrary.getAlbumAsync(ALBUM_FOTOS);
    if (album) {
      const asset = await MediaLibrary.createAssetAsync(uri, album);
      return asset.uri;
    }

    const asset = await MediaLibrary.createAssetAsync(uri);
    await MediaLibrary.createAlbumAsync(ALBUM_FOTOS, asset, false);
    return asset.uri;
  } catch (error) {
    console.warn('No se pudo guardar la imagen en la galería:', error);
    throw error;
  }
};

export const guardarReporte = async (reporte, idExistente = null) => {
  const id = idExistente || `${Date.now()}`;

  const reporteGuardado = {
    ...reporte,
    id,
    fecha: reporte.fecha || obtenerFechaLegible(),
    fechaCreacion: reporte.fechaCreacion || new Date().toISOString(),
    estatusGeneral: reporte.estatusGeneral || 'No Operativo',
    fotoSedeUri: undefined,
    fotoExtintorUri: undefined,
    fotosSede: reporte.fotosSede || [],
    fotosExtintor: reporte.fotosExtintor || [],
    fotosParticipantes: reporte.fotosParticipantes || [],
    participantes: await Promise.all((reporte.participantes || []).map(async (participante) => ({
      ...participante,
      foto: participante?.foto || participante?.fotoUri || '',
      fotoUri: undefined,
    }))),
    cuadros: await Promise.all((reporte.cuadros || []).map(async (cuadro) => ({
      ...cuadro,
      foto: undefined,
      fotos: cuadro.fotos || (cuadro.foto ? [cuadro.foto] : []),
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
  const marcaModificacion = obtenerMarcaModificacion();
  const actualizados = reportes.map((reporte) => (
    reporte.id === id ? { ...reporte, estatusGeneral: estatus, ...marcaModificacion } : reporte
  ));
  await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(actualizados));
  return actualizados.find((reporte) => reporte.id === id);
};

export const actualizarEstatusCuadro = async (idReporte, idCuadro, estatus) => {
  const reportes = await obtenerReportes();
  const marcaModificacion = obtenerMarcaModificacion();
  const actualizados = reportes.map((reporte) => {
    if (reporte.id !== idReporte) return reporte;

    return {
      ...reporte,
      cuadros: (reporte.cuadros || []).map((cuadro) => (
        cuadro.id === idCuadro ? { ...cuadro, status: estatus } : cuadro
      )),
      ...marcaModificacion,
    };
  });
  await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(actualizados));
  return actualizados.find((reporte) => reporte.id === idReporte);
};

export const reemplazarFotoReporte = async (idReporte, tipo, indice, uri, indiceCuadro = null) => {
  const reportes = await obtenerReportes();
  const marcaModificacion = obtenerMarcaModificacion();
  const actualizados = reportes.map((reporte) => {
    if (reporte.id !== idReporte) return reporte;

    if (tipo === 'cuadro' && indiceCuadro !== null) {
      return {
        ...reporte,
        cuadros: (reporte.cuadros || []).map((cuadro, cuadroIndex) => (
          cuadroIndex === indiceCuadro
            ? { ...cuadro, fotos: (cuadro.fotos || []).map((foto, fotoIndex) => fotoIndex === indice ? uri : foto) }
            : cuadro
        )),
        ...marcaModificacion,
      };
    }

    return {
      ...reporte,
      [tipo]: (reporte[tipo] || []).map((foto, fotoIndex) => fotoIndex === indice ? uri : foto),
      ...marcaModificacion,
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


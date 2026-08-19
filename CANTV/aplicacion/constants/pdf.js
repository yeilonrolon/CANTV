import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

// Helper para convertir cualquier imagen local URI a Base64
const uriABase64 = async (uri) => {
  if (!uri) return '';
  try {
    if (typeof uri !== 'string') return '';
    if (uri.startsWith('data:image')) return uri;
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.warn('Error convirtiendo imagen a Base64:', uri, error);
    return '';
  }
};

/**
 * Mapeo tolerante a múltiples nombres de propiedades
 */
const extraerDatosFormulario = (data) => {
  if (!data) return {};

  const u = data.datosUbicacion || data.ubicacion || data;

  // Extracción de fotos de extintor / sede
  let fotosExtintorArray = [];
  if (Array.isArray(data.fotosExtintor)) fotosExtintorArray = data.fotosExtintor;
  else if (data.fotoExtintorUri) fotosExtintorArray = [data.fotoExtintorUri];
  else if (Array.isArray(u.fotosSede)) fotosExtintorArray = u.fotosSede;

  return {
    empresa: u.empresa || data.empresa || 'CANTV',
    region: u.region || u.regionSeleccionada || data.region || 'N/A',
    estado: u.estado || u.estadoSeleccionado || data.estado || 'N/A',
    municipio: u.municipio || u.municipioSeleccionado || data.municipio || 'N/A',
    parroquia: u.parroquia || u.parroquiaSeleccionada || data.parroquia || 'N/A',
    sede: u.instalacion || u.instalacionSeleccionada || u.sede || data.sede || 'N/A',
    telefono: u.telefono || data.telefono || 'N/A',
    th: u.th || data.th || 'N/A',
    
    // CO2, PQS y Extintores
    co2: data.co2 || u.co2 || '0',
    pqs: data.pqs || u.pqs || '0',
    extintores: u.extintores || u.numeroExtintores || data.extintores || '0',
    estatusGeneral: u.estatusGeneral || u.statusGeneral || u.estatus || data.estatusGeneral || 'N/A',
    fecha: u.fecha || data.fecha || new Date().toLocaleDateString(),

    // Fotos de extintor / sede
    fotosExtintor: fotosExtintorArray,

    // Participantes
    participantes: data.participantes || u.participantes || [],

    // Cuadros acumulados
    cuadros: Array.isArray(data.cuadros) ? data.cuadros : (Array.isArray(data.seccionesAcumuladas) ? data.seccionesAcumuladas : [])
  };
};

export const generarYCompartirPDF = async (reporteCompleto) => {
  try {
    const datos = extraerDatosFormulario(reporteCompleto);

    // Procesar imágenes de extintores / sede
    const fotosExtintorBase64 = await Promise.all(
      datos.fotosExtintor.map(uriABase64)
    );

    // Procesar participantes
    const participantesProcesados = await Promise.all(
      datos.participantes.map(async (p) => ({
        ...p,
        fotoBase64: await uriABase64(p.foto || p.fotoUri)
      }))
    );

    // Procesar fotos de cada Cuadro de Inspección
    const cuadrosProcesados = await Promise.all(
      datos.cuadros.map(async (cuadro, index) => {
        const listaFotos = Array.isArray(cuadro.fotos) ? cuadro.fotos : (cuadro.foto ? [cuadro.foto] : []);
        const fotosBase64 = await Promise.all(listaFotos.map(uriABase64));

        return {
          ...cuadro,
          numeroCuadro: index + 1,
          nivel: cuadro.nivel || 'N/A',
          area: cuadro.area || 'N/A',
          rubro: cuadro.rubro || 'N/A',
          detalle: cuadro.detalle || 'Sin observaciones',
          unidad: cuadro.unidad || 'N/A',
          criticidad: cuadro.criticidad || 'N/A',
          status: cuadro.status || cuadro.estatus || 'N/A',
          fotosBase64: fotosBase64.filter((img) => img !== '')
        };
      })
    );

    // HTML: Cabecera y Extintores
    const htmlCabecera = `
      <div class="seccion-cabecera">
        <h2>DATOS GENERALES Y UBICACIÓN</h2>
        <table class="tabla-datos">
          <tr>
            <td><strong>Empresa:</strong> ${datos.empresa}</td>
            <td><strong>Región:</strong> ${datos.region}</td>
          </tr>
          <tr>
            <td><strong>Estado:</strong> ${datos.estado}</td>
            <td><strong>Municipio:</strong> ${datos.municipio}</td>
          </tr>
          <tr>
            <td><strong>Parroquia:</strong> ${datos.parroquia}</td>
            <td><strong>Sede / Instalación:</strong> ${datos.sede}</td>
          </tr>
          <tr>
            <td><strong>Teléfono:</strong> ${datos.telefono}</td>
            <td><strong>TH:</strong> ${datos.th}</td>
          </tr>
          <tr>
            <td><strong>Cantidad CO2:</strong> ${datos.co2}</td>
            <td><strong>Cantidad PQS:</strong> ${datos.pqs}</td>
          </tr>
          <tr>
            <td><strong>Estatus General:</strong> ${datos.estatusGeneral}</td>
            <td><strong>Fecha:</strong> ${datos.fecha}</td>
          </tr>
        </table>

        ${fotosExtintorBase64.filter(i => i !== '').length > 0 ? `
          <div class="subtitulo">Fotografía de Participantes / Extintores:</div>
          <div class="galeria-grid">
            ${fotosExtintorBase64.filter(i => i !== '').map(img => `<img src="${img}" class="foto-reporte" />`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // HTML: Participantes (si existen)
    const htmlParticipantes = participantesProcesados.length > 0 ? `
      <div class="seccion-cabecera">
        <h2>PARTICIPANTES / PERSONAL INSPECTOR</h2>
        <div class="grid-participantes">
          ${participantesProcesados.map(p => `
            <div class="tarjeta-participante">
              ${p.fotoBase64 ? `<img src="${p.fotoBase64}" class="foto-participante" />` : '<div class="foto-placeholder">Sin foto</div>'}
              <div class="info-participante">
                <strong>${p.nombre || 'Nombre N/A'}</strong><br/>
                <span>${p.rol || p.cargo || 'Inspector'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // HTML: Cuadros de Inspección
    const seccionesHtml = cuadrosProcesados.map((sec) => `
      <div class="tarjeta-cuadro">
        <div class="encabezado-cuadro">CUADRO N° ${sec.numeroCuadro}</div>
        
        <table class="tabla-datos">
          <tr>
            <td><strong>Nivel:</strong> ${sec.nivel}</td>
            <td><strong>Área:</strong> ${sec.area}</td>
          </tr>
          <tr>
            <td><strong>Rubro:</strong> ${sec.rubro}</td>
            <td><strong>Unidad Responsable:</strong> ${sec.unidad}</td>
          </tr>
          <tr>
            <td><strong>Criticidad:</strong> ${sec.criticidad}</td>
            <td><strong>Estatus:</strong> ${sec.status}</td>
          </tr>
        </table>

        <div class="campo"><strong>Detalle / Observaciones:</strong> ${sec.detalle}</div>
        
        ${sec.fotosBase64.length > 0 ? `
          <div class="subtitulo">Fotografías del Cuadro:</div>
          <div class="galeria-grid">
            ${sec.fotosBase64.map((img) => `<img src="${img}" class="foto-reporte" />`).join('')}
          </div>
        ` : '<div class="sin-fotos">Sin fotografías registradas en este cuadro</div>'}
      </div>
    `).join('');

    // HTML Global
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 20px; color: #333333; }
            h1 { color: #0066cc; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0066cc; padding-bottom: 10px; font-size: 20px; }
            h2 { color: #0066cc; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #0066cc; padding-bottom: 4px; }
            .subtitulo { font-size: 12px; font-weight: bold; margin-top: 10px; margin-bottom: 6px; }
            
            .seccion-cabecera { border: 1px solid #d0d0d0; border-radius: 6px; padding: 12px; margin-bottom: 20px; background-color: #f9f9f9; page-break-inside: avoid; }
            .tarjeta-cuadro { border: 1px solid #cccccc; border-radius: 6px; padding: 14px; margin-bottom: 18px; page-break-inside: avoid; background-color: #ffffff; }
            .encabezado-cuadro { background-color: #0066cc; color: #ffffff; padding: 6px 12px; font-weight: bold; border-radius: 4px; margin-bottom: 12px; display: inline-block; font-size: 13px; }
            
            .tabla-datos { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .tabla-datos td { width: 50%; padding: 4px 0; font-size: 12px; color: #333333; vertical-align: top; }
            .campo { margin-top: 6px; margin-bottom: 8px; font-size: 12px; line-height: 1.4; color: #333333; }
            
            .galeria-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
            .foto-reporte { width: 110px; height: 110px; object-fit: cover; border-radius: 4px; border: 1px solid #dddddd; }
            
            .grid-participantes { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
            .tarjeta-participante { display: flex; align-items: center; gap: 10px; border: 1px solid #e0e0e0; padding: 8px; border-radius: 4px; background: #fff; width: 45%; }
            .foto-participante { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
            .foto-placeholder { width: 45px; height: 45px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #777; text-align: center; }
            .info-participante { font-size: 11px; line-height: 1.3; }
            
            .sin-fotos { font-size: 11px; color: #888888; font-style: italic; margin-top: 6px; }
          </style>
        </head>
        <body>
          <h1>REPORTE DE INSPECCIÓN TÉCNICA</h1>
          ${htmlCabecera}
          ${htmlParticipantes}
          ${seccionesHtml}
        </body>
      </html>
    `;

    // Generar archivo PDF con Expo Print
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } else {
      Alert.alert('PDF Generado', `El documento se guardó en: ${uri}`);
    }
  } catch (error) {
    console.error('Error al generar PDF:', error);
    Alert.alert('Error', 'Ocurrió un error inesperado al generar el PDF.');
  }
};
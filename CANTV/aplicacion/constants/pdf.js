import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

// Helper para convertir URI de imagen local a Base64
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
 * Función extractora encargada de buscar y recuperar todas las variables 
 * del formulario desde cualquier nivel de anidamiento dentro del objeto reporteCompleto.
 */
const extraerDatosFormulario = (data) => {
  if (!data) return {};

  // Buscar si viene dentro de sub-objetos comunes de navegación o formulario
  const origen = data.datosUbicacion || data.ubicacion || data.params || data;

  return {
    empresa: origen.empresa || data.empresa || 'CANTV',
    region: origen.region || origen.regionSeleccionada || data.region || 'N/A',
    estado: origen.estado || origen.estadoSeleccionado || data.estado || 'N/A',
    municipio: origen.municipio || origen.municipioSeleccionado || data.municipio || 'N/A',
    parroquia: origen.parroquia || origen.parroquiaSeleccionada || data.parroquia || 'N/A',
    sede: origen.instalacion || origen.instalacionSeleccionada || origen.sede || data.sede || 'N/A',
    telefono: origen.telefono || data.telefono || 'N/A',
    th: origen.th || data.th || 'N/A',
    
    // Extintores, Estatus y Fecha
    extintores: origen.extintores || origen.numeroExtintores || data.extintores || 'N/A',
    estatusGeneral: origen.estatusGeneral || origen.statusGeneral || origen.estatus || data.estatusGeneral || 'N/A',
    fecha: origen.fecha || data.fecha || new Date().toLocaleDateString(),

    // Fotos de la sede
    fotosSede: origen.fotosSede || origen.fotosUbicacion || data.fotosSede || data.fotos || [],

    // Participantes
    participantes: origen.participantes || data.participantes || data.personal || [],

    // Cuadros
    cuadros: data.cuadros || data.seccionesAcumuladas || (Array.isArray(data) ? data : [])
  };
};

export const generarYCompartirPDF = async (reporteCompleto) => {
  try {
    // 1. Invocación de la función extractora de variables
    const datosNormalizados = extraerDatosFormulario(reporteCompleto);

    const {
      empresa,
      region,
      estado,
      municipio,
      parroquia,
      sede,
      telefono,
      th,
      extintores,
      estatusGeneral,
      fecha,
      fotosSede,
      participantes,
      cuadros,
    } = datosNormalizados;

    // 2. Procesar fotos de la Sede / Ubicación a Base64
    const fotosSedeBase64 = await Promise.all(
      (Array.isArray(fotosSede) ? fotosSede : []).map(uriABase64)
    );

    // 3. Procesar Participantes (Fotos a Base64)
    const participantesProcesados = await Promise.all(
      (Array.isArray(participantes) ? participantes : []).map(async (p) => ({
        ...p,
        fotoBase64: await uriABase64(p.foto || p.fotoUri || p.imagen)
      }))
    );

    // 4. Procesar Cuadros de Inspección (detalles + fotos a Base64)
    const cuadrosConBase64 = await Promise.all(
      (Array.isArray(cuadros) ? cuadros : []).map(async (cuadro, index) => {
        let listaFotos = [];
        if (Array.isArray(cuadro.fotos)) listaFotos = cuadro.fotos;
        else if (Array.isArray(cuadro.fotosCuadro)) listaFotos = cuadro.fotosCuadro;
        else if (Array.isArray(cuadro.fotoCuadro)) listaFotos = cuadro.fotoCuadro;
        else if (cuadro.fotoCuadro) listaFotos = [cuadro.fotoCuadro];
        else if (cuadro.foto) listaFotos = [cuadro.foto];

        const fotosBase64 = await Promise.all(listaFotos.map(uriABase64));

        return {
          ...cuadro,
          numeroCuadro: index + 1,
          fotosBase64: fotosBase64.filter((img) => img !== '')
        };
      })
    );

    // 5. Inyección del HTML de Cabecera (Sede + Ubicación)
    const htmlCabecera = `
      <div class="seccion-cabecera">
        <h2>DATOS GENERALES Y UBICACIÓN</h2>
        <table class="tabla-datos">
          <tr>
            <td><strong>Empresa:</strong> ${empresa}</td>
            <td><strong>Región:</strong> ${region}</td>
          </tr>
          <tr>
            <td><strong>Estado:</strong> ${estado}</td>
            <td><strong>Municipio:</strong> ${municipio}</td>
          </tr>
          <tr>
            <td><strong>Parroquia:</strong> ${parroquia}</td>
            <td><strong>Sede / Instalación:</strong> ${sede}</td>
          </tr>
          <tr>
            <td><strong>Teléfono:</strong> ${telefono}</td>
            <td><strong>TH:</strong> ${th}</td>
          </tr>
          <tr>
            <td><strong>N° de Extintores:</strong> ${extintores}</td>
            <td><strong>Estatus General:</strong> ${estatusGeneral}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Fecha de Registro:</strong> ${fecha}</td>
          </tr>
        </table>

        ${fotosSedeBase64.filter(i => i !== '').length > 0 ? `
          <div class="subtitulo">Fotografías de la Sede / Ubicación:</div>
          <div class="galeria-grid">
            ${fotosSedeBase64.filter(i => i !== '').map(img => `<img src="${img}" class="foto-reporte" />`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // 6. Inyección del HTML de Participantes
    const htmlParticipantes = participantesProcesados.length > 0 ? `
      <div class="seccion-cabecera">
        <h2>PARTICIPANTES / PERSONAL INSPECTOR</h2>
        <div class="grid-participantes">
          ${participantesProcesados.map(p => `
            <div class="tarjeta-participante">
              ${p.fotoBase64 ? `<img src="${p.fotoBase64}" class="foto-participante" />` : '<div class="foto-placeholder">Sin foto</div>'}
              <div class="info-participante">
                <strong>${p.nombre || 'Nombre N/A'}</strong><br/>
                <span>${p.rol || p.cargo || 'Participante'}</span><br/>
                <small>${p.cedula || p.documento || ''}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // 7. Inyección del HTML de los Cuadros de Inspección
    const seccionesHtml = cuadrosConBase64
      .map(
        (sec) => `
        <div class="tarjeta-cuadro">
          <div class="encabezado-cuadro">CUADRO N° ${sec.numeroCuadro}</div>
          
          <table class="tabla-datos">
            <tr>
              <td><strong>Nivel:</strong> ${sec.nivel || 'N/A'}</td>
              <td><strong>Área:</strong> ${sec.area || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Rubro:</strong> ${sec.rubro || 'N/A'}</td>
              <td><strong>Unidad Responsable:</strong> ${sec.unidad || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Criticidad:</strong> ${sec.criticidad || 'N/A'}</td>
              <td><strong>Estatus:</strong> ${sec.status || 'N/A'}</td>
            </tr>
          </table>

          <div class="campo"><strong>Detalle / Observaciones:</strong> ${sec.detalle || 'Sin observaciones'}</div>
          
          ${sec.fotosBase64.length > 0 ? `
            <div class="subtitulo">Fotografías del Cuadro:</div>
            <div class="galeria-grid">
              ${sec.fotosBase64
                .map((img) => `<img src="${img}" class="foto-reporte" />`)
                .join('')}
            </div>
          ` : '<div class="sin-fotos">Sin fotografías registradas en este cuadro</div>'}
        </div>
      `
      )
      .join('');

    // 8. Documento HTML final (Mantiene intactos tus estilos CSS)
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

    // 9. Generar y compartir el PDF
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
    Alert.alert('Error', 'No se pudo generar el documento PDF.');
  }
};
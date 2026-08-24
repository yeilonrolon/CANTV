import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { Alert } from 'react-native';
import { obtenerNombrePDF } from './reportes';

// -------------------------------------------------------------
// 1. IMPORTACIÓN DE LOGOS PREDETERMINADOS (Ajusta tus rutas)
// -------------------------------------------------------------
import logoSHA from '../assets/logo.jpg'; // Reemplaza por tu ruta local
import logoInstitucional from '../assets/logo cantv.png'; // Reemplaza por tu ruta local

const MAX_FOTOS_POR_REPORTE = 15;
const MAX_BYTES_POR_FOTO = 2 * 1024 * 1024;


const escaparHtml = (valor) => String(valor ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const esUriImagen = (uri) => typeof uri === 'string' && (
  uri.startsWith('file://') ||
  uri.startsWith('content://') ||
  uri.startsWith('data:image/')
);

// Conversor de asset local (Require / Import) a Base64
const cargarAssetLocalABase64 = async (modulo) => {
  try {
    if (!modulo) return '';
    const asset = Asset.fromModule(modulo);
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;
    if (!uri) return '';
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    const tipoImagen = asset.type === 'jpg' || asset.type === 'jpeg' ? 'jpeg' : 'png';
    return `data:image/${tipoImagen};base64,${base64}`;
  } catch (e) {
    console.warn('Error cargando asset local en Base64:', e);
    return '';
  }
};

// Convierte una imagen dinámica a Base64
const uriABase64 = async (uri) => {
  if (!uri) return '';
  try {
    if (!esUriImagen(uri)) return '';
    if (uri.startsWith('data:image/')) {
      return uri.length <= MAX_BYTES_POR_FOTO * 1.4 ? uri : '';
    }

    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || (info.size && info.size > MAX_BYTES_POR_FOTO)) return '';

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.warn('Error convirtiendo imagen a Base64:', uri, error);
    return '';
  }
};

const convertirFotos = async (fotos, contador) => {
  if (contador.total >= MAX_FOTOS_POR_REPORTE) return [];

  const fotosDisponibles = fotos.slice(0, MAX_FOTOS_POR_REPORTE - contador.total);
  const resultados = await Promise.all(fotosDisponibles.map(uriABase64));
  const resultado = resultados.filter(Boolean);
  contador.total += resultado.length;
  return resultado;
};

const extraerDatosFormulario = (data) => {
  if (!data) return {};

  const u = data.datosUbicacion || data.ubicacion || data;

  let fotosSedeArray = [];
  if (Array.isArray(data.fotosSede)) fotosSedeArray = data.fotosSede;
  else if (data.fotoSedeUri) fotosSedeArray = [data.fotoSedeUri];
  else if (u.fotoSedeUri) fotosSedeArray = [u.fotoSedeUri];

  let fotosExtintorArray = [];
  if (Array.isArray(data.fotosExtintor)) fotosExtintorArray = data.fotosExtintor;
  else if (data.fotoExtintorUri) fotosExtintorArray = [data.fotoExtintorUri];

  let fotosParticipantesArray = [];
  if (Array.isArray(data.fotosParticipantes)) fotosParticipantesArray = data.fotosParticipantes;
  else if (data.fotoParticipantesUri) fotosParticipantesArray = [data.fotoParticipantesUri];

  return {
    empresa: u.empresa || data.empresa || 'CANTV',
    region: u.region || u.regionSeleccionada || data.region || 'N/A',
    estado: u.estado || u.estadoSeleccionado || data.estado || 'N/A',
    municipio: u.municipio || u.municipioSeleccionado || data.municipio || 'N/A',
    parroquia: u.parroquia || u.parroquiaSeleccionada || data.parroquia || 'N/A',
    sede: u.instalacion || u.instalacionSeleccionada || u.sede || data.sede || 'N/A',
    telefono: u.telefono || data.telefono || 'N/A',
    th: u.th || data.th || 'N/A',
    
    co2: data.co2 || u.co2 || '0',
    pqs: data.pqs || u.pqs || '0',
    extintores: u.extintores || u.numeroExtintores || data.extintores || '0',
    estatusGeneral: u.estatusGeneral || u.statusGeneral || u.estatus || data.estatusGeneral || 'N/A',
    fecha: u.fecha || data.fecha || new Date().toLocaleDateString(),

    fotosSede: fotosSedeArray,
    fotosExtintor: fotosExtintorArray,
    fotosParticipantes: fotosParticipantesArray,

    participantes: Array.isArray(data.participantes)
      ? data.participantes
      : (Array.isArray(u.participantes) ? u.participantes : []),

    cuadros: Array.isArray(data.cuadros) ? data.cuadros : (Array.isArray(data.seccionesAcumuladas) ? data.seccionesAcumuladas : [])
  };
};

export const generarYCompartirPDF = async (reporteCompleto, opciones = {}) => {
  try {
    const datos = extraerDatosFormulario(reporteCompleto);
    const contadorFotos = { total: 0 };

    // 1. Cargar logos locales predeterminados
    const logoShaBase64 = await cargarAssetLocalABase64(logoSHA);
    const logoInstBase64 = await cargarAssetLocalABase64(logoInstitucional);

    // 2. Procesar imágenes dinámicas del reporte
    const fotosSedeBase64 = await convertirFotos(datos.fotosSede.slice(0, 1), contadorFotos);
    // Procesar participantes
    const participantesProcesados = [];
    const participantes = datos.participantes.length > 0
      ? datos.participantes.slice(0, 1)
      : datos.fotosParticipantes.slice(0, 1).map((foto) => ({ foto }));
    for (const participante of participantes) {
      const participanteSeguro = participante || {};
      participantesProcesados.push({
        ...participanteSeguro,
        fotoBase64: contadorFotos.total < MAX_FOTOS_POR_REPORTE
          ? (await convertirFotos([participanteSeguro.foto || participanteSeguro.fotoUri], contadorFotos))[0] || ''
          : '',
      });
    }
      const participanteConFoto = participantesProcesados.find((participante) => participante.fotoBase64);

    // Procesar cuadros de inspección
    const cuadrosProcesados = [];
    for (const [index, cuadro] of datos.cuadros.entries()) {
      const cuadroSeguro = cuadro || {};
      const listaFotos = Array.isArray(cuadroSeguro.fotos)
        ? cuadroSeguro.fotos
        : (cuadroSeguro.foto ? [cuadroSeguro.foto] : []);
      const fotosBase64 = await convertirFotos(listaFotos, contadorFotos);

      cuadrosProcesados.push({
        ...cuadroSeguro,
        numeroCuadro: index + 1,
        nivel: cuadroSeguro.nivel || 'N/A',
        area: cuadroSeguro.area || 'N/A',
        rubro: cuadroSeguro.rubro || 'N/A',
        detalle: cuadroSeguro.detalle || 'Sin observaciones',
        unidad: cuadroSeguro.unidad || 'N/A',
        criticidad: cuadroSeguro.criticidad || 'N/A',
        status: cuadroSeguro.status || cuadroSeguro.estatus || 'N/A',
        fotosBase64,
      });
    }

    if (contadorFotos.total >= MAX_FOTOS_POR_REPORTE) {
      Alert.alert('PDF reducido', `Se incluyeron las primeras ${MAX_FOTOS_POR_REPORTE} fotos para optimizar el documento.`);
    }

    // -------------------------------------------------------------
    // 3. CONSTRUCCIÓN DE SECCIONES HTML (Formato Informe SHA)
    // -------------------------------------------------------------

    // Encabezado con Membrete SHA
    const htmlHeader = `
      <div class="header-container">
        <div class="logo-sha-box">
          ${logoShaBase64 ? `<img src="${logoShaBase64}" class="logo-sha" />` : ''}
        </div>
        <div class="header-text">
          <h2 class="inspector-nombre">Ana María Torres</h2>
          <p class="inspector-cargo">Coordinador Región Andes / Occidente</p>
          <p class="inspector-gerencia">Gerencia Seguridad Industrial, Higiene y Ambiente</p>
          <p class="inspector-gerencia">Gerencia General Seguridad Integral</p>
          <p class="inspector-telefono">${escaparHtml(datos.telefono)}</p>
        </div>
      </div>
      <hr class="linea-divisoria" />
    `;

    // Introducción Institucional Formal
    const htmlIntroduccion = `
      <div class="asunto-box">
        <p><strong>ASUNTO:</strong> RV: Informe Inspección SHA / ${escaparHtml(datos.fecha)}</p>
        <p class="eslogan">"La Prevención Está En Ti, Todos Somos Responsables"</p>
      </div>

      <p class="parrafo-saludo">Buen día, reciban un cordial saludo,</p>
      <p class="parrafo-cuerpo">
        Por medio del presente les informo que en fecha <strong>${escaparHtml(datos.fecha)}</strong>, en cumplimiento al plan de inspecciones en la 
        <strong>(${escaparHtml(datos.empresa)}, REGION ${escaparHtml(datos.region)}, ESTADO ${escaparHtml(datos.estado)}, MUNICIPIO ${escaparHtml(datos.municipio)}, PARROQUIA ${escaparHtml(datos.parroquia)} Y SEDE/INSTALACION ${escaparHtml(datos.sede)})</strong>, 
        el personal adscrito a esta gerencia realizó visita de inspección asociada a la evaluación de los aspectos en materia de Seguridad Industrial, Higiene y Ambiente (SIHA).
      </p>
    `;

    const htmlCantidadesExtintores = `
      <div class="cantidades-extintores">
        <div class="cantidad-item"><strong>Cantidad TH:</strong> ${escaparHtml(datos.th)}</div>
        <div class="titulo-cantidades">CANTIDAD DE EXTINTORES</div>
        <div class="cantidad-item"><strong>CO2:</strong> ${escaparHtml(datos.co2)}</div>
        <div class="cantidad-item"><strong>PQS:</strong> ${escaparHtml(datos.pqs)}</div>
      </div>
    `;

    // Galería Sede y Participantes
    const htmlGaleriaSedeParticipantes = `
      <div class="galeria-sede-container">
        <div class="columna-foto">
          <div class="titulo-foto">FOTO SEDE</div>
          ${fotosSedeBase64.length > 0 ? `
            <img src="${fotosSedeBase64[0]}" class="foto-marco" />
          ` : '<div class="marco-vacio">Sin Foto de Sede</div>'}
        </div>

        <div class="columna-foto">
          <div class="titulo-foto">FOTO PARTICIPANTES</div>
          ${participanteConFoto ? `
            <img src="${participanteConFoto.fotoBase64}" class="foto-marco" />
          ` : '<div class="marco-vacio">Sin Foto de Participantes</div>'}
        </div>
      </div>
    `;

    // Transición a inspecciones
    const htmlTransicionInspecciones = `
      <p class="parrafo-cuerpo" style="margin-top: 15px;">
        De dicha inspección se determinó que varias de las desviaciones en materia SHA reportadas en informes previos se mantienen, las cuales se reflejan en el cuadro siguiente, se insta a las unidades responsables del área, generar el respectivo número de reporte SAP en los casos que aplique, realice seguimiento de la desviación reportada, tomen acciones correctivas, adicionalmente de existir alguna observación nos la hagan llegar por esta vía.
      </p>
    `;

    // Tablas de Inspecciones (Inspección N-1, N-2, ...)
    const htmlCuadros = cuadrosProcesados.map((sec) => `
      <div class="bloque-inspeccion">
        <div class="etiqueta-inspeccion">Inspección N° ${escaparHtml(sec.numeroCuadro)}</div>
        
        <table class="tabla-sha">
          <tr>
            <td><strong>Nivel:</strong> ${escaparHtml(sec.nivel)}</td>
            <td><strong>Área:</strong> ${escaparHtml(sec.area)}</td>
          </tr>
          <tr>
            <td><strong>Rubro:</strong> ${escaparHtml(sec.rubro)}</td>
            <td><strong>Unidad Responsable:</strong> ${escaparHtml(sec.unidad)}</td>
          </tr>
          <tr>
            <td><strong>Criticidad:</strong> ${escaparHtml(sec.criticidad)}</td>
            <td><strong>Estatus:</strong> ${escaparHtml(sec.status)}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Detalle / Observaciones:</strong> ${escaparHtml(sec.detalle)}</td>
          </tr>
        </table>

        ${sec.fotosBase64.length > 0 ? `
          <div class="galeria-inspeccion">
            ${sec.fotosBase64.map((img) => `<img src="${img}" class="foto-inspeccion" />`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');

    // Recomendaciones Legales y Pie Institucional
    const htmlRecomendacionesYFooter = `
      <div class="seccion-final">
        <p class="parrafo-cuerpo">
          Por lo anterior, agradecemos su apoyo a fin de tomar las medidas preventivas y correctivas a las que haya lugar, con el fin de resguardar la vida de las personas y alrededores de la Instalación.
        </p>
        <p class="parrafo-cuerpo">
          Vale destacar que el proceso de verificación se hace conforme a la normativa nacional vigente, por lo que ponemos a la orden asesoría de tipo técnico que reviste carácter legal.
        </p>

        <p class="titulo-recomendaciones">Recomendaciones generales:</p>
        <ul class="lista-recomendaciones">
          <li>Desincorporar equipos sin uso en la instalación. <strong>Responsable: Gerencia de la Red y Gcia de Servicios Internos.</strong></li>
          <li>Los envases contentivos de los productos de limpieza deben ser identificados con el nombre del líquido o producto químico que contienen a fin de evitar el uso accidental de los mismos. <strong>Responsable: Gcia de Servicios Internos.</strong></li>
          <li>Revisión y organización periódica de los depósitos, retiro de material acumulado que no se esté utilizando (archivos muertos) a fin de mantener el orden y la limpieza, realizar el apilamiento adecuado, mantener libres las áreas de circulación (pasillos), no obstruir los dispositivos de seguridad (extintores, detectores de incendio entre otros). <strong>Responsable: Cada unidad que posea un depósito de equipos y materiales en esta instalación.</strong></li>
          <li>Mantener el orden y limpieza en las áreas destinadas al descanso y donde efectúan café (desconectar equipos energizados cuando no se estén utilizando cafeteras, microondas, entre otros, lo que minimiza posibles conatos de incendio).</li>
          <li>Evitar acumular alimentos y dejar agua en recipientes (floreros, envases y demás) a fin de minimizar la proliferación de plagas (cucarachas, roedores, zancudos entre otros). <strong>Responsable: Cada unidad que posea un área de descanso o calentamiento.</strong></li>
          <li>Efectuar proceso de limpieza interna de los enfriadores periódicamente, así como la dotación de vasos desechables (evitar dejar vasos plásticos de uso común), ya que esta práctica ocasiona transmisión de enfermedades. <strong>Responsable: Gcia de Servicios Internos.</strong></li>
          <li>Realizar la dotación de insumos de los botiquines de primeros auxilios dando cumplimiento a lo establecido en la Ley Orgánica de Prevención, Condiciones y Medio Ambiente de Trabajo (LOPCYMAT) en el artículo 59 indica las Condiciones y Ambiente en que se debe desarrollar el trabajo y en su numeral 6 establece "Garantice el auxilio inmediato al trabajador o la trabajadora lesionado o enfermo" y la Norma COVENIN n° 3478-1999. <strong>Responsable: Cada Gerencia de unidad que posea botiquín de primeros auxilios, los que no posean deben realizar la solicitud y efectuar el proceso de compra de los mismos.</strong></li>
        </ul>

        <p class="parrafo-despedida">
          Sin más a que hacer referencia, les recordamos que la seguridad es tarea de todos. Estas desviaciones se reportan para que se generen acciones que garanticen la seguridad y lleven bienestar a tod@s los trabajadores.
        </p>
        
        <p class="parrafo-saludo">Saludos Cordiales.</p>

        <div class="bloque-firma">
          <p class="eslogan">"La Prevención Está En Ti, Todos Somos Responsables"</p>
          <p><strong>Ana María Torres</strong></p>
          <p>Gcia Seguridad Industrial, Higiene Y Ambiente</p>
          <p>Coordinación Región Los Andes / Occidente</p>
          <p>Telf: ${escaparHtml(datos.telefono)}</p>
          <p>E-Mail: Atorr5@Cantv.Com.Ve / Atorr5cantv1@Gmail.Com</p>
        </div>

        ${logoInstBase64 ? `
          <div class="footer-institucional">
            <img src="${logoInstBase64}" class="logo-institucional" />
          </div>
        ` : ''}
      </div>
    `;

    // Documento HTML Integrado
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { margin: 1.35cm 1.5cm; }
            body { font-family: "Times New Roman", Times, serif; padding: 0; color: #111111; font-size: 10.5pt; line-height: 1.18; }
            
            /* Header SHA */
            .header-container { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
            .logo-sha-box { width: 92px; }
            .logo-sha { width: 100%; height: auto; object-fit: contain; }
            .header-text { flex: 1; }
            .inspector-nombre { font-size: 12pt; font-weight: bold; margin: 0; color: #000; }
            .inspector-cargo, .inspector-telefono { font-size: 9.5pt; margin: 1px 0; font-weight: normal; }
            .inspector-gerencia { font-size: 9.5pt; margin: 1px 0; color: #222; }
            .linea-divisoria { border: none; border-top: 1px solid #000; margin: 5px 0 8px 0; }

            /* Asunto y Saludo */
            .asunto-box { margin-bottom: 8px; }
            .asunto-box p { margin: 1px 0; font-size: 10.5pt; }
            .eslogan { font-style: italic; font-weight: bold; margin-top: 4px !important; }
            .parrafo-saludo { margin: 7px 0 4px 0; }
            .parrafo-cuerpo { text-align: justify; margin: 5px 0; font-size: 10.5pt; }

            /* Cantidades de extintores */
            .cantidades-extintores { display: flex; gap: 10px; align-items: center; margin: 8px 0 4px 0; padding: 5px 7px; border: 1px solid #666; page-break-inside: avoid; }
            .titulo-cantidades { font-weight: bold; font-size: 9.5pt; margin-right: auto; }
            .cantidad-item { font-size: 9.5pt; min-width: 62px; }

            /* Galería Sede y Participantes */
            .galeria-sede-container { display: flex; gap: 10px; margin: 8px 0; justify-content: center; page-break-inside: avoid; }
            .columna-foto { width: 48%; text-align: center; }
            .titulo-foto { font-weight: bold; font-size: 9.5pt; margin-bottom: 3px; }
            .foto-marco { width: 100%; height: 125px; object-fit: cover; border: 1px solid #333; }
            .marco-vacio { width: 100%; height: 125px; border: 1px dashed #888; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #666; }

            /* Bloque de Inspección */
            .bloque-inspeccion { margin: 8px 0; }
            .etiqueta-inspeccion { border: 1px solid #000; padding: 3px 7px; display: inline-block; font-weight: bold; font-size: 8.5pt; margin-bottom: 4px; background-color: #fff; }
            .tabla-sha { width: 100%; border-collapse: collapse; margin-bottom: 4px; page-break-inside: avoid; }
            .tabla-sha td { border: 1px solid #666; padding: 3px 5px; font-size: 8pt; width: 50%; vertical-align: top; }
            .galeria-inspeccion { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 3px; }
            .foto-inspeccion { width: 82px; height: 82px; object-fit: cover; border: 1px solid #666; }

            /* Recomendaciones */
            .seccion-final { margin-top: 8px; }
            .titulo-recomendaciones { font-weight: bold; margin-top: 8px; margin-bottom: 4px; font-size: 10.5pt; }
            .lista-recomendaciones { margin: 4px 0 8px 0; padding-left: 18px; font-size: 9.5pt; text-align: justify; }
            .lista-recomendaciones li { margin-bottom: 3px; }
            .parrafo-despedida { text-align: justify; margin: 7px 0; font-size: 10.5pt; }
            
            .bloque-firma { margin-top: 10px; font-size: 10pt; }
            .bloque-firma p { margin: 2px 0; }
            
            .footer-institucional { margin-top: 12px; text-align: center; }
            .logo-institucional { width: 100%; max-width: 400px; height: auto; }
          </style>
        </head>
        <body>
          ${htmlHeader}
          ${htmlIntroduccion}
          ${htmlCantidadesExtintores}
          ${htmlGaleriaSedeParticipantes}
          ${htmlTransicionInspecciones}
          ${htmlCuadros}
          ${htmlRecomendacionesYFooter}
        </body>
      </html>
    `;

    // Generación del archivo con Expo Print
    const resultadoPDF = await Print.printToFileAsync({ html: htmlContent });
    let uri = resultadoPDF.uri;

    if (opciones.nombreArchivo) {
      const nombre = obtenerNombrePDF(datos.sede, datos.fecha, reporteCompleto.id);
      const destino = `${FileSystem.documentDirectory}reportes/${nombre}`;
      await FileSystem.deleteAsync(destino, { idempotent: true });
      await FileSystem.moveAsync({ from: uri, to: destino });
      uri = destino;
    }

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
    throw error;
  }
};
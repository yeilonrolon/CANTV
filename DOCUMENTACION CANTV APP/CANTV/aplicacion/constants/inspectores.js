import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_INSPECTOR_ACTIVO = 'inspectorActivo';

export const INSPECTORES = [
  {
    id: 'ana-maria-torres',
    grupo: 'COORDINADORA',
    cargo: 'COORDINADORA',
    nombre: 'TORRES PINTO, ANA MARÍA',
    correo: 'Atorr5@Cantv.Com.Ve / Atorr5cantv1@Gmail.Com',
  },
  {
    id: 'isamar-graciela-morales',
    grupo: 'SUPERVISORA',
    cargo: 'SUPERVISORA',
    nombre: 'MORALES GUERRERO, ISAMAR GRACIELA',
    correo: 'Shacantvtachira@gmail.com / Imoral01@cantv.com',
  },
  {
    id: 'aglaee-duenas',
    grupo: 'CONSULTOR',
    cargo: 'CONSULTOR',
    nombre: 'DUEÑAS SANCHEZ, AGLAEE',
    correo: 'aduena01@cantv.com.ve / aglaeeduenas24@gmail.com',
  },
  {
    id:'losandes-isamar-morales',
    grupo: 'SUPERVISORA',
    estado:'Táchira',
    cargo: 'COORDINADORA',
    cargoCompleto: 'COORDINADORA REGIÓN LOS ANDES, LLANOS Y OCCIDENTE',
    nombre: 'TORRES PINTO, ANA MARÍA',
    correo: 'Atorr5@Cantv.com.ve'
  },
  {
    id: 'merida-renzo-yzarra',
    grupo: 'PERSONAL DE MÉRIDA',
    estado: 'Mérida',
    cargo: 'CONSULTOR SHA',
    cargoCompleto: 'CONSULTOR SHA - MÉRIDA',
    nombre: 'YZARRA TORRES, RENZO JAVIER',
    correo: 'ryzarr01@cantv.com.ve',
  },
  {
    id: 'merida-israel-villarroel',
    grupo: 'PERSONAL DE MÉRIDA',
    estado: 'Mérida',
    cargo: 'ESPECIALISTA SHA',
    cargoCompleto: 'ESPECIALISTA SHA - MÉRIDA',
    nombre: 'VILLARROEL PAREDES, ISRAEL OSWALDO',
    correo: 'ivilla04@cantv.com.ve',
  },
  {
    id: 'trujillo-franklin-palma',
    grupo: 'PERSONAL TRUJILLO',
    estado: 'Trujillo',
    cargo: 'ESPECIALISTA SHA',
    cargoCompleto: 'ESPECIALISTA SHA - TRUJILLO',
    nombre: 'PALMA AYALA, FRANKLIN JOSÉ',
    correo: 'fpalma02@cantv.com.ve',
  },
  {
    id: 'falcon-mayni-flores',
    grupo: 'REGIÓN OCCIDENTE / FALCÓN',
    estado: 'Falcón',
    cargo: 'SUPERVISORA SHA',
    cargoCompleto: 'SUPERVISORA SHA - FALCÓN',
    nombre: 'FLORES MAVO, MAYNI LISSETH',
    correo: 'mflore02@cantv.com.ve',
  },
  {
    id: 'falcon-milangelis-suarez',
    grupo: 'REGIÓN OCCIDENTE / FALCÓN',
    estado: 'Falcón',
    cargo: 'CONSULTOR SHA',
    cargoCompleto: 'CONSULTOR SHA - FALCÓN',
    nombre: 'SUÁREZ MACHADO, MILANGELIS DEL VALLE',
    correo: 'msuare13@cantv.com.ve',
  },
  {
    id: 'lara-maria-rojas',
    grupo: 'REGIÓN OCCIDENTE / LARA',
    estado: 'Lara',
    cargo: 'CONSULTOR SHA',
    cargoCompleto: 'CONSULTOR SHA - LARA',
    nombre: 'ROJAS CHÁVEZ, MARÍA LOURDES',
    correo: 'mrojas17@cantv.com.ve',
  },
  {
    id: 'lara-andreina-castro',
    grupo: 'REGIÓN OCCIDENTE / LARA',
    estado: 'Lara',
    cargo: 'CONSULTOR SHA',
    cargoCompleto: 'CONSULTOR SHA - LARA',
    nombre: 'CASTRO, ANDREINA JULIETTY',
    correo: 'acastr15@cantv.com.ve',
  },
];

export const guardarInspectorActivo = async (inspector) => {
  await AsyncStorage.setItem(CLAVE_INSPECTOR_ACTIVO, JSON.stringify(inspector));
};

export const obtenerInspectorActivo = async () => {
  const inspectorGuardado = await AsyncStorage.getItem(CLAVE_INSPECTOR_ACTIVO);
  if (!inspectorGuardado) return INSPECTORES[0];

  try {
    return JSON.parse(inspectorGuardado) || INSPECTORES[0];
  } catch {
    return INSPECTORES[0];
  }
};

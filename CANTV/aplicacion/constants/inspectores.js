import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_INSPECTOR_ACTIVO = 'inspectorActivo';

export const INSPECTORES = [
  {
    id: 'ana-maria-torres',
    cargo: 'Coordinadora',
    nombre: 'TORRES PINTO, ANA MARIA',
    correo: 'Atorr5@Cantv.Com.Ve / Atorr5cantv1@Gmail.Com',
  },
  {
    id: 'isamar-graciela-morales',
    cargo: 'Supervisora',
    nombre: 'MORALES GUERRERO, ISAMAR GRACIELA',
    correo: 'Shacantvtachira@gmail.com / Imoral01@cantv.com',
  },
  {
    id: 'aglaee-duenas',
    cargo: 'Consultor',
    nombre: 'DUEÑAS SANCHEZ, AGLAEE',
    correo: 'aduena01@cantv.com.ve / aglaeeduenas24@gmail.com',
  },
  {
    id:'losandes-isamar-morales',
    grupo:'Supervisora',
    estado:'Táchira',
    cargo:'Coordinadora',
    cargoCompleto: 'Coordinadora Region Los Andes, Llanos y Occidente',
    nombre: 'Torres Pinto, Ana Maria',
    correo: 'Atorr5@Cantv.com.ve'
  },
  {
    id: 'merida-renzo-yzarra',
    grupo: 'Personal de Mérida',
    estado: 'Mérida',
    cargo: 'Consultor SHA',
    cargoCompleto: 'Consultor SHA - Mérida',
    nombre: 'Yzarra Torres, Renzo Javier',
    correo: 'ryzarr01@cantv.com.ve',
  },
  {
    id: 'merida-israel-villarroel',
    grupo: 'Personal de Mérida',
    estado: 'Mérida',
    cargo: 'Especialista SHA',
    cargoCompleto: 'Especialista SHA - Mérida',
    nombre: 'Villarroel Paredes, Israel Oswaldo',
    correo: 'ivilla04@cantv.com.ve',
  },
  {
    id: 'trujillo-franklin-palma',
    grupo: 'Personal Trujillo',
    estado: 'Trujillo',
    cargo: 'Especialista SHA',
    cargoCompleto: 'Especialista SHA - Trujillo',
    nombre: 'Palma Ayala, Franklin José',
    correo: 'fpalma02@cantv.com.ve',
  },
  {
    id: 'falcon-mayni-flores',
    grupo: 'Región Occidente / Falcón',
    estado: 'Falcón',
    cargo: 'Supervisora SHA',
    cargoCompleto: 'Supervisora SHA - Falcón',
    nombre: 'Flores Mavo, Mayni Lisseth',
    correo: 'mflore02@cantv.com.ve',
  },
  {
    id: 'falcon-milangelis-suarez',
    grupo: 'Región Occidente / Falcón',
    estado: 'Falcón',
    cargo: 'Consultor SHA',
    cargoCompleto: 'Consultor SHA - Falcón',
    nombre: 'Suarez Machado, Milangelis del Valle',
    correo: 'msuare13@cantv.com.ve',
  },
  {
    id: 'lara-maria-rojas',
    grupo: 'Región Occidente / Lara',
    estado: 'Lara',
    cargo: 'Consultor SHA',
    cargoCompleto: 'Consultor SHA - Lara',
    nombre: 'Rojas Chavez, Maria Lourdes',
    correo: 'mrojas17@cantv.com.ve',
  },
  {
    id: 'lara-andreina-castro',
    grupo: 'Región Occidente / Lara',
    estado: 'Lara',
    cargo: 'Consultor SHA',
    cargoCompleto: 'Consultor SHA - Lara',
    nombre: 'Castro, Andreina Julietty',
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

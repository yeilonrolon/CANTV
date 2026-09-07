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

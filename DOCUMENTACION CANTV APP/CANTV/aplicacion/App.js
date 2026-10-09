import React from 'react';
import { Alert, Button } from 'react-native';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Login from './screens/Login';
import Olvidecontrasena from './screens/Olvidecontrasena';
import Usuario from './screens/Usuario';
import Fotosede from './screens/Fotosede';
import Extintores from './screens/Extintores';
import Cuadro from './screens/Cuadro';
import FotoCuadro from './screens/FotoCuadro';
import Inicio from './screens/Inicio';
import Historial from './screens/Historial';
import DetalleHistorial from './screens/DetalleHistorial';
import LimpiarFotos from './screens/LimpiarFotos';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
const conAreaSeguraInferior = (Pantalla) => function PantallaConAreaSeguraInferior(props) {
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <Pantalla {...props} />
    </SafeAreaView>
  );
};

const LoginConAreaSegura = conAreaSeguraInferior(Login);
const OlvidecontrasenaConAreaSegura = conAreaSeguraInferior(Olvidecontrasena);
const UsuarioConAreaSegura = conAreaSeguraInferior(Usuario);
const FotosedeConAreaSegura = conAreaSeguraInferior(Fotosede);
const ExtintoresConAreaSegura = conAreaSeguraInferior(Extintores);
const CuadroConAreaSegura = conAreaSeguraInferior(Cuadro);
const FotoCuadroConAreaSegura = conAreaSeguraInferior(FotoCuadro);
const InicioConAreaSegura = conAreaSeguraInferior(Inicio);
const HistorialConAreaSegura = conAreaSeguraInferior(Historial);
const DetalleHistorialConAreaSegura = conAreaSeguraInferior(DetalleHistorial);
const LimpiarFotosConAreaSegura = conAreaSeguraInferior(LimpiarFotos);

const bloquearRegreso = (event) => {
  if (['GO_BACK', 'POP', 'POP_TO_TOP'].includes(event.data.action.type)) {
    event.preventDefault();
    Alert.alert(
      'No se puede regresar',
      'Para iniciar nuevamente, cierre sesión e ingrese otra vez a la aplicación.'
    );
  }
};

const opcionesProtegidas = ({ navigation }) => ({
  headerBackVisible: false,
  gestureEnabled: false,
  headerRight: () => (
    <Button
      title="Salir"
      color="#d9534f"
      onPress={() => Alert.alert(
        'Cerrar sesión',
        'Al cerrar sesión se eliminarán los datos de la inspección actual.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar sesión',
            style: 'destructive',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            }),
          },
        ]
      )}
    />
  ),
});

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginConAreaSegura}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Inicio"
            component={InicioConAreaSegura}
            options={{ title: 'Menú principal', headerBackVisible: false }}
          />
          <Stack.Screen
            name="Historial"
            component={HistorialConAreaSegura}
            options={{ title: 'Historial' }}
          />
          <Stack.Screen
            name="DetalleHistorial"
            component={DetalleHistorialConAreaSegura}
            options={{ title: 'Cuadros del reporte' }}
          />
          <Stack.Screen
            name="LimpiarFotos"
            component={LimpiarFotosConAreaSegura}
            options={{ title: 'Limpiar fotos' }}
          />
          <Stack.Screen
            name="Olvidecontrasena"
            component={OlvidecontrasenaConAreaSegura}
            options={{ title: 'Recuperar Contraseña' }}
          />
          <Stack.Screen
            name="Usuario"
            component={UsuarioConAreaSegura}
            listeners={{ beforeRemove: bloquearRegreso }}
            options={({ navigation }) => ({
              title: 'Usuario',
              ...opcionesProtegidas({ navigation }),
            })}
          />
          <Stack.Screen
            name="Fotosede"
            component={FotosedeConAreaSegura}
            listeners={{ beforeRemove: bloquearRegreso }}
            options={({ navigation }) => ({
              title: 'Foto Sede',
              ...opcionesProtegidas({ navigation }),
            })}
          />
          <Stack.Screen
            name="Extintores"
            component={ExtintoresConAreaSegura}
            listeners={{ beforeRemove: bloquearRegreso }}
            options={({ navigation }) => ({
              title: 'Foto Participantes',
              ...opcionesProtegidas({ navigation }),
            })}
          />
          <Stack.Screen
            name="Cuadro"
            component={CuadroConAreaSegura}
            listeners={{ beforeRemove: bloquearRegreso }}
            options={({ navigation }) => ({
              title: 'Cuadro',
              ...opcionesProtegidas({ navigation }),
            })}
          />
          <Stack.Screen
            name="FotoCuadro"
            component={FotoCuadroConAreaSegura}
            listeners={{ beforeRemove: bloquearRegreso }}
            options={({ navigation }) => ({
              title: 'Imagenes del Reporte',
              ...opcionesProtegidas({ navigation }),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
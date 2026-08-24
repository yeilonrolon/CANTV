import React from 'react';
import { Alert, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Inicio"
          component={Inicio}
          options={{ title: 'Menú principal', headerBackVisible: false }}
        />
        <Stack.Screen
          name="Historial"
          component={Historial}
          options={{ title: 'Historial' }}
        />
        <Stack.Screen
          name="DetalleHistorial"
          component={DetalleHistorial}
          options={{ title: 'Cuadros del reporte' }}
        />
        <Stack.Screen
          name="LimpiarFotos"
          component={LimpiarFotos}
          options={{ title: 'Limpiar fotos' }}
        />
        <Stack.Screen 
          name="Olvidecontrasena" 
          component={Olvidecontrasena} 
          options={{ title: 'Recuperar Contraseña' }} 
        />
        <Stack.Screen 
          name="Usuario" 
          component={Usuario} 
          options={({ navigation }) => ({
            title: 'Usuario',
            ...opcionesProtegidas({ navigation }),
          })}
        />
        <Stack.Screen 
          name="Fotosede" 
          component={Fotosede} 
          options={({ navigation }) => ({
            title: 'Foto Sede',
            ...opcionesProtegidas({ navigation }),
          })}
        />
        <Stack.Screen 
          name="Extintores" 
          component={Extintores} 
          options={({ navigation }) => ({
            title: 'Foto Participantes',
            ...opcionesProtegidas({ navigation }),
          })}
        />
        <Stack.Screen 
          name="Cuadro" 
          component={Cuadro} 
          options={({ navigation }) => ({
            title: 'Cuadro',
            ...opcionesProtegidas({ navigation }),
          })}
        />
        <Stack.Screen 
          name="FotoCuadro" 
          component={FotoCuadro} 
          options={({ navigation }) => ({
            title: 'Imagenes del Reporte',
            ...opcionesProtegidas({ navigation }),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
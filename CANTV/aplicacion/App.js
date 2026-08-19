import React from 'react';
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

const Stack = createNativeStackNavigator();

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
          name="Olvidecontrasena" 
          component={Olvidecontrasena} 
          options={{ title: 'Recuperar Contraseña' }} 
        />
        <Stack.Screen 
          name="Usuario" 
          component={Usuario} 
          options={{ 
            title: 'Usuario',
            headerBackVisible: false, // ✅ Oculta la flecha de regresar sin romper el código nativo
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="Fotosede" 
          component={Fotosede} 
          options={{ 
            title: 'Foto Sede',
            headerBackVisible: false,
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="Extintores" 
          component={Extintores} 
          options={{ 
            title: 'Foto Participantes',
            headerBackVisible: false,
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="Cuadro" 
          component={Cuadro} 
          options={{ 
            title: 'Cuadro',
            headerBackVisible: false,
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="FotoCuadro" 
          component={FotoCuadro} 
          options={{ 
            title: 'FotoCuadro',
            headerBackVisible: false,
            gestureEnabled: false
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
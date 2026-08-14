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
            headerLeft: () => null // Evita que se devuelva al login arrastrando o con la flecha
          }} 
        />
        <Stack.Screen 
          name="Fotosede" 
          component={Fotosede} 
          options={{ 
            title: 'Foto Sede',
            headerLeft: () => null
          }} 
        />
        <Stack.Screen 
          name="Extintores" 
          component={Extintores} 
          options={{ 
            title: 'Foto Participantes',
            headerLeft: () => null
          }} 
        />
        <Stack.Screen 
          name="Cuadro" 
          component={Cuadro} 
          options={{ 
            title: 'Cuadro',
            headerLeft: () => null
          }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
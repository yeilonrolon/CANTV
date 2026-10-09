import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OlvideContrasena({ navigation }) {
  const [paso, setPaso] = useState(1); // 1: Preguntas, 2: Nueva Contraseña
  const [respuesta1, setRespuesta1] = useState('');
  const [respuesta2, setRespuesta2] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const scrollViewRef = useRef(null);

  const desplazarAlCampo = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const verificarPreguntas = async () => {
    if (respuesta1.toLowerCase() === 'palo gordo' && respuesta2.toLowerCase() === 'tachira') {
      // Intentar autenticación biométrica
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return Alert.alert("Error", "Tu dispositivo no soporta biometría");

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentícate para cambiar contraseña',
      });

      if (result.success) {
        setPaso(2); // Pasamos a pedir la nueva contraseña
      } else {
        Alert.alert("Error", "Autenticación fallida");
      }
    } else {
      Alert.alert("Error", "Respuestas incorrectas");
    }
  };

  const guardarPassword = async () => {
    await AsyncStorage.setItem('userPassword', nuevaPassword);
    Alert.alert("Éxito", "Contraseña actualizada correctamente", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedorTeclado}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {paso === 1 ? (
          <>
            <Text style={[styles.title, styles.textoVisible]}>Preguntas de Seguridad</Text>
            <TextInput style={styles.input} placeholder="¿Donde vives?" placeholderTextColor="#888888" onChangeText={setRespuesta1} onFocus={desplazarAlCampo} />
            <TextInput style={styles.input} placeholder="Estado" placeholderTextColor="#888888" onChangeText={setRespuesta2} onFocus={desplazarAlCampo} />
            <Button title="Verificar y Validar Huella" onPress={verificarPreguntas} />
          </>
        ) : (
          <>
            <Text style={[styles.title, styles.textoVisible]}>Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu nueva clave"
              placeholderTextColor="#888888"
              onChangeText={setNuevaPassword}
              onFocus={desplazarAlCampo}
              secureTextEntry={!mostrarPassword}
            />
            <Button title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onPress={() => setMostrarPassword((visible) => !visible)} />
            <Button title="Guardar Cambio" onPress={guardarPassword} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedorTeclado: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 8, color: '#000000', backgroundColor: '#FFFFFF' },
  textoVisible: { color: '#000000', backgroundColor: '#FFFFFF' },
});
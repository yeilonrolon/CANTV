import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const scrollViewRef = useRef(null);

  const subirFormulario = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // Al iniciar, verifica si ya existe una contraseña guardada
  useEffect(() => {
    const initPassword = async () => {
      const storedPass = await AsyncStorage.getItem('userPassword');
      if (!storedPass) {
        await AsyncStorage.setItem('userPassword', 'Admin123');
      }
    };
    initPassword();
  }, []);

  const handleLogin = async () => {
    const savedPassword = await AsyncStorage.getItem('userPassword');
    
    if (email.trim() === 'admin' && password === savedPassword) {
      Alert.alert('¡Bienvenido!', 'Inicio de sesión exitoso.', [
        { text: 'Aceptar', onPress: () => navigation.replace('Inicio') }
      ]);
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={[styles.title, styles.textoVisible]}>Bienvenido</Text>
         <View style={styles.topSection}>
            <Image 
                source={require('../assets/logo.jpg')} 
                style={styles.logo} 
               defaultSource={require('../assets/logo.jpg')}
              />
            </View>
      <View style={styles.card}>
        <Text style={[styles.label, styles.textoVisible]}>Usuario</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Ingrese su usuario" placeholderTextColor="#6b7785" />
        <Text style={[styles.label, styles.textoVisible]}>Contraseña</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Ingrese su contraseña" placeholderTextColor="#6b7785" onFocus={subirFormulario} returnKeyType="done" selectionColor="#0066cc" />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={[styles.buttonText, styles.textoVisible]}>Ingresar</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.forgotButton} onPress={() => navigation.navigate('Olvidecontrasena')}>
        <Text style={[styles.forgotText, styles.textoVisible]}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
// ... (mismos estilos de siempre)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    color: '#17202a',
    textAlignVertical: 'center',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  topSection: { 
    alignItems: 'center',
    marginBottom: 35 },
  logo: { 
      width: 165, 
      height: 195, 
      marginBottom: 10 },
  textoVisible: { color: '#17202a' },
});
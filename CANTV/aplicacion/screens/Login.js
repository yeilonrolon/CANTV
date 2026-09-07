import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { INSPECTORES, guardarInspectorActivo } from '../constants/inspectores';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inspectorSeleccionado, setInspectorSeleccionado] = useState(INSPECTORES[0].id);
  const [mostrarSeleccionInspector, setMostrarSeleccionInspector] = useState(false);
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
      setMostrarSeleccionInspector(true);
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos.');
    }
  };

  const continuarConInspector = async () => {
    const inspector = INSPECTORES.find((item) => item.id === inspectorSeleccionado) || INSPECTORES[0];
    await guardarInspectorActivo(inspector);
    navigation.replace('Inicio');
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
      <View style={styles.brandHeader}>
        <Image
          source={require('../assets/logo.jpg')}
          style={styles.logo}
          defaultSource={require('../assets/logo.jpg')}
        />
        <View style={styles.brandRule} />
        <Text style={styles.brandName}>REPORTES SHA</Text>
        <Text style={styles.brandSubtitle}>Seguridad Industrial, Higiene y Ambiente</Text>
      </View>
      {!mostrarSeleccionInspector ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>ACCESO AL SISTEMA</Text>
            <Text style={[styles.title, styles.textoVisible]}>Bienvenido</Text>
            <Text style={styles.cardSubtitle}>Ingrese sus credenciales para continuar.</Text>
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
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>RESPONSABLE DEL INFORME</Text>
          <Text style={[styles.panelTitle, styles.textoVisible]}>¿Quién realizará el registro?</Text>
          <Text style={styles.panelSubtitle}>Estos datos aparecerán en el encabezado y la firma del PDF.</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={inspectorSeleccionado}
              onValueChange={setInspectorSeleccionado}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropdownIconColor="#17324d"
            >
              {INSPECTORES.map((inspector) => (
                <Picker.Item key={inspector.id} label={`${inspector.cargo}: ${inspector.nombre}`} value={inspector.id} />
              ))}
            </Picker>
          </View>
          <View style={styles.selectedInspector}>
            <Text style={styles.selectedRole}>{INSPECTORES.find((item) => item.id === inspectorSeleccionado)?.cargo}</Text>
            <Text style={styles.selectedName}>{INSPECTORES.find((item) => item.id === inspectorSeleccionado)?.nombre}</Text>
            <Text style={styles.correoSeleccionado}>{INSPECTORES.find((item) => item.id === inspectorSeleccionado)?.correo}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={continuarConInspector}>
            <Text style={[styles.buttonText, styles.textoVisible]}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
// ... (mismos estilos de siempre)

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#edf1f4',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 34,
  },
  brandHeader: { alignItems: 'center', marginBottom: 24 },
  brandRule: { width: 44, height: 3, backgroundColor: '#c39a32', marginTop: 4, marginBottom: 10 },
  brandName: { color: '#17324d', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  brandSubtitle: { color: '#5b6873', fontSize: 12, marginTop: 5, textAlign: 'center' },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#17324d',
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderTopWidth: 4,
    borderTopColor: '#17324d',
    padding: 23,
    elevation: 4,
    shadowColor: '#17324d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  cardEyebrow: { color: '#c39a32', fontSize: 11, fontWeight: '800', marginBottom: 12 },
  cardSubtitle: { color: '#63717c', fontSize: 14, marginBottom: 22 },
  label: {
    fontSize: 13,
    color: '#34495e',
    marginBottom: 6,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c7d0d8',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fbfcfd',
    color: '#17202a',
    textAlignVertical: 'center',
  },
  button: {
    backgroundColor: '#17324d',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  panelTitle: { fontSize: 20, fontWeight: 'bold', color: '#17324d', marginBottom: 8 },
  panelSubtitle: { fontSize: 14, color: '#5f6b76', lineHeight: 20, marginBottom: 16 },
  pickerContainer: { borderWidth: 1, borderColor: '#c7d0d8', borderRadius: 4, marginBottom: 14, overflow: 'hidden', backgroundColor: '#fbfcfd' },
  picker: { color: '#17202a', backgroundColor: '#fbfcfd' },
  pickerItem: { color: '#17202a' },
  selectedInspector: { borderLeftWidth: 3, borderLeftColor: '#c39a32', backgroundColor: '#f4f6f7', padding: 12, marginBottom: 8 },
  selectedRole: { color: '#c39a32', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  selectedName: { color: '#17324d', fontSize: 14, fontWeight: '800', lineHeight: 19, marginBottom: 5 },
  correoSeleccionado: { color: '#52616d', fontSize: 12, lineHeight: 17 },
  forgotButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  forgotText: {
    color: '#17324d',
    fontSize: 14,
    fontWeight: '600',
  },
  logo: { 
      width: 116,
      height: 136,
      resizeMode: 'contain' },
  textoVisible: { color: '#17202a' },
});
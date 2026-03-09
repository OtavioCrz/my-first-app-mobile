import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity,
Alert, Button } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
export default function App() {

const [count, setCount] = useState(0); // 1. Estado para Contagem

 const handlePress = () => {
 Alert.alert('Sucesso!', 'Você clicou no botão!');
 }
 return (
 <View style={styles.container}>
 {/* 1. Imagem de Topo */}
 <Image
 source={{ uri:
'https://cdn.neemo.com.br/uploads/settings_webdelivery/logo/12184/Logo_01.jpg' }}
 style={styles.logo}
 />
 <Text style={styles.titulo}>Toque aqui!</Text>
 <TouchableOpacity onPress={handlePress}>
  <LinearGradient
    colors={['#6300c0', '#b700ff']}
    style={styles.botao}
  >
    <Text style={styles.textoBotao}>Clique Aqui</Text>
  </LinearGradient>
</TouchableOpacity>

 <Button
    title={`Contador: ${count}`}
    onPress={() => setCount(count + 1)}
    color="purple"
 />
 </View>

 );
}
// 4. Estilização (Equivalente ao CSS)
const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#fff',
 alignItems: 'center',
 justifyContent: 'center',
 padding: 20,
 },
 logo: {
 width: 100,
 height: 100,
 marginBottom: 20,
 },
 titulo: {
 fontSize: 28,
 fontWeight: 'bold',
 color: '#333',
 },
 subtitulo: {
 fontSize: 16,
 color: '#666',
 marginBottom: 30,
 },
 botao: {
 backgroundColor: '#6900f1',
 paddingVertical: 12,
 paddingHorizontal: 30,
 borderRadius: 16,
 marginTop: 20,
 marginBottom: 20,
 },
 textoBotao: {
 color: '#fff',
 fontSize: 18,
 fontWeight: '600',
 },
});

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Button,
  Pressable,
} from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context"; // SafeAreaView é um componente que garante que o conteúdo seja exibido dentro das áreas seguras da tela, evitando sobreposição com elementos do sistema, como a barra de status ou o notch em dispositivos modernos.
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login"); // com replace, o usuário não pode voltar para a tela anterior (tela de abas) usando o botão de voltar do dispositivo, garantindo que ele seja redirecionado para a tela de login após o logout. O que seria possível com .push
  }

  const [count, setCount] = useState(0); // 1. Estado para Contagem

  const handlePress = () => {
    Alert.alert("Sucesso!", "Você clicou no botão!");
  };
  return (
    <View style={styles.container}>

      <Pressable onPress={handleLogout} style={styles.botao}>
        <Text style={styles.textoBotao}>Logout</Text>
      </Pressable>
      
      {/* 1. Imagem de Topo */}
      <Image
        source={{
          uri: "https://cdn.neemo.com.br/uploads/settings_webdelivery/logo/12184/Logo_01.jpg",
        }}
        style={styles.logo}
      />
      <Text style={styles.titulo}>Toque aqui!</Text>
      <TouchableOpacity onPress={handlePress}>
        <LinearGradient colors={["#6300c0", "#b700ff"]} style={styles.botao}>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitulo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  botao: {
    backgroundColor: "#6900f1",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

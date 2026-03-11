import { auth } from "@/firebase/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    // Limpa mensagem de erro anterior
    setErrorMessage("");

    // Valida se campos estao vazios. Trim remove espaços em branco no começo e no fim
    //! significa "não", ou seja, se depois de remover espacos sobra algo? Nao
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Preencha email e senha.");
      return;
    }

    // Valida formato minimo de email. Includes verifica se tem @
    if (!email.includes("@")) {
      setErrorMessage("Email invalido.");
      return;
    }

    // Se passou em tudo, sucesso (por enquanto)
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)");
    } catch (error: any) {
      // O "any" é usado para indicar que o tipo do erro pode ser qualquer coisa, já que a função signInWithEmailAndPassword pode lançar erros de diferentes tipos. Isso permite acessar a propriedade "code" do erro sem TypeScript reclamar.
      if (error.code === "auth/invalid-credential") {
        setErrorMessage("Email ou senha invalidos.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMessage("Muitas tentativas. Tente novamente mais tarde.");
      } else {
        setErrorMessage("Nao foi possivel entrar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <ImageBackground
      source={require("@/assets/images/login/bg-login.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.safe} onPress={Keyboard.dismiss}>
          <Image
            source={require("@/assets/images/login/logo-maria-pitanga.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subtitulo}>Rastreamento de Entregas</Text>

          <Image
            source={require("@/assets/images/login/truck.png")}
            style={styles.truck}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#A7A2A2"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Seu E-mail"
                placeholderTextColor="#A7A2A2"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputRow}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="#A7A2A2"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Sua senha"
                placeholderTextColor="#A7A2A2"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#A7A2A2"
                />
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push("/reset-password")}
              style={{ marginLeft: "auto" }}
            >
              <Text style={{ color: "#F4A300", marginLeft: 8, padding: 4 }}>
                Esqueci minha senha
              </Text>
            </Pressable>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Pressable
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Carregando..." : "Entrar"}
              </Text>
            </Pressable>
          </View>

          <View style={{ alignItems: "center", marginTop: "auto", marginBottom: 20 }}>
          <Text style={{ color: "#fff"}}>
            Ainda não tem uma conta?{" "}
          <Text style={{ color: "#F4A300" }} onPress={() => router.push("/register")}>
              Fale com o suporte
            </Text>
          </Text>
          </View>

        </Pressable>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    flex: 1,
  },

  logo: {
    width: 200,
    height: 200,
  },

  subtitulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: -40,
    marginBottom: 60,
  },

  truck: {
    width: 300,
    height: 150,
    marginBottom: -80,
    zIndex: 1,
  },

  card: {
    backgroundColor: "#F2EEEE",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    paddingTop: 80,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D5D0D0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: "#ECE8E8",
    fontSize: 16,
    color: "#3B3B3B",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D5D0D0",
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "#ECE8E8",
    marginBottom: 12,
  },

  inputIcon: {
    marginRight: 8,
  },

  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#3B3B3B",
  },

  button: {
    marginTop: 10,
    backgroundColor: "#F4A300",
    borderRadius: 999,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  errorText: { color: "red", fontSize: 14, marginBottom: 12, justifyContent: "center", textAlign: "center", marginTop: 12 },
});

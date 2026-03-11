import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)", // Define a tela inicial do app para a rota (tabs)
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* define navegação em pilha (tela A -> tela B) */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        {/* headerShown oculta o cabeçalho da tela */}

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        {/* presentation: 'modal' faz a tela aparecer como um modal (deslizando de baixo para cima) */}
      </Stack>
      <StatusBar style="auto" />
      {/* StatusBar é um componente do Expo que permite controlar a aparência da barra de status do dispositivo (hora, bateria, etc.). O estilo "auto" ajusta automaticamente a cor do texto da barra de status com base no tema atual (claro ou escuro). */}
    </ThemeProvider>
  );
}

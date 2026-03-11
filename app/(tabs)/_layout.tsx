import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { useAuth } from "@/hooks/use-auth";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { user, isLoading } = useAuth();

  if (isLoading) { //Enquanto o Firebase ainda está verificando a sessão, a tela não renderiza nada, evitando que o usuário veja a tela de login por um breve momento antes de ser redirecionado para a tela principal. O indicador de carregamento é exibido para informar ao usuário que o aplicativo está processando a autenticação
    return null;
  }

  if (!user) { // Se não houver um usuário autenticado, redireciona para a tela de login. Isso garante que apenas usuários autenticados possam acessar as telas dentro do layout de abas
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ), // .fill para mudar o ícone
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />    
    </Tabs>
  );
}

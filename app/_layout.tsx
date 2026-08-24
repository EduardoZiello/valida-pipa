import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import EvidenciaGerador, {
  EvidenciaGeradorRef,
} from "@/components/EvidenciaGerador";

import { registrarGeradorEvidencia } from "@/services/evidencia";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const evidenciaRef = useRef<EvidenciaGeradorRef>(null);

  useEffect(() => {
    registrarGeradorEvidencia(async (dados) => {
      if (!evidenciaRef.current) {
        throw new Error("Gerador de evidência não está disponível.");
      }

      return evidenciaRef.current.gerar(dados);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
          <Stack.Screen name="caminhao" options={{ title: "Caminhão" }} />
          <Stack.Screen
            name="iniciar-rota"
            options={{ title: "Iniciar Rota" }}
          />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
      <EvidenciaGerador ref={evidenciaRef} />
    </SafeAreaProvider>
  );
}

import { auth } from "@/services/firebase";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Stack } from "expo-router";

import { StatusBar } from "expo-status-bar";

import { onAuthStateChanged } from "firebase/auth";

import { ActivityIndicator, Image, View } from "react-native";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { useEffect, useRef, useState } from "react";

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
  const [usuario, setUsuario] = useState(auth.currentUser);
  const [verificandoLogin, setVerificandoLogin] = useState(true);
  const [mostrarSplash, setMostrarSplash] = useState(true);

  const evidenciaRef = useRef<EvidenciaGeradorRef>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioAtual) => {
      setUsuario(usuarioAtual);
      setVerificandoLogin(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    registrarGeradorEvidencia(async (dados) => {
      if (!evidenciaRef.current) {
        throw new Error("Gerador de evidência não está disponível.");
      }

      return evidenciaRef.current.gerar(dados);
    });
  }, []);

  if (verificandoLogin || mostrarSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("@/assets/images/icone-valida-pipa.png")}
          style={styles.splashLogo}
          resizeMode="contain"
        />

        <ActivityIndicator
          size="small"
          color="#0879E8"
          style={styles.splashIndicator}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {usuario ? (
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
              <Stack.Screen name="caminhao" options={{ title: "Caminhão" }} />
              <Stack.Screen
                name="iniciar-rota"
                options={{ title: "Iniciar Rota" }}
              />
            </>
          ) : (
            <Stack.Screen name="login" options={{ headerShown: false }} />
          )}
        </Stack>

        <StatusBar style="dark" />
      </ThemeProvider>

      <EvidenciaGerador ref={evidenciaRef} />
    </SafeAreaProvider>
  );
}

const styles = {
  splashContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#F5FAFF",
  },

  splashLogo: {
    width: 150,
    height: 150,
  },

  splashIndicator: {
    marginTop: 28,
  },
};

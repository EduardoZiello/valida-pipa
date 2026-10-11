import { auth } from "@/services/firebase";
import { obterRotaEmAndamento } from "@/services/rotas";
import { obterMotorista } from "@/services/storage";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [nomeMotorista, setNomeMotorista] = useState("");
  const [temRotaEmAndamento, setTemRotaEmAndamento] = useState(false);
  const [verificandoAutenticacao, setVerificandoAutenticacao] = useState(true);

  const logo = require("@/assets/images/logo-valida-pipa.png");

  useEffect(() => {
    const cancelarObservador = onAuthStateChanged(auth, (usuario) => {
      if (!usuario) {
        setVerificandoAutenticacao(false);
        router.replace("/login");
        return;
      }

      setVerificandoAutenticacao(false);
    });

    return cancelarObservador;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (verificandoAutenticacao || !auth.currentUser) {
        return;
      }

      carregarMotorista();
    }, [verificandoAutenticacao]),
  );

  async function carregarMotorista() {
    const motorista = await obterMotorista();

    if (motorista?.nome) {
      setNomeMotorista(motorista.nome);
    } else {
      setNomeMotorista("");
    }

    const rota = await obterRotaEmAndamento();

    setTemRotaEmAndamento(!!rota);
  }

  if (verificandoAutenticacao) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Image source={logo} style={styles.loadingLogo} resizeMode="contain" />

        <Text style={styles.loadingTitle}>VALIDA PIPA</Text>

        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={styles.loadingIndicator}
        />

        <Text style={styles.loadingText}>Verificando acesso...</Text>
      </SafeAreaView>
    );
  }

  if (!auth.currentUser) {
    return null;
  }

  const horaAtual = new Date().getHours();
  const saudacao =
    horaAtual < 12
      ? "Bom dia 👋"
      : horaAtual < 18
        ? "Boa tarde 👋"
        : "Boa noite 👋";

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>VALIDA PIPA</Text>

        <Text style={styles.subtitle}>Validação inteligente de rotas</Text>

        <Text style={styles.greetingTitle}>{saudacao}</Text>

        <Text style={styles.greeting}>{nomeMotorista || "Motorista"}</Text>

        <View
          style={[
            styles.statusCard,
            temRotaEmAndamento && styles.statusCardAtiva,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: temRotaEmAndamento ? "#22C55E" : "#9CA3AF",
              },
            ]}
          />

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {temRotaEmAndamento
                ? "Rota em andamento"
                : "Nenhuma rota em andamento"}
            </Text>

            <Text style={styles.statusSubtitle}>
              {temRotaEmAndamento
                ? "Você tem uma rota sendo registrada"
                : "Pronto para iniciar uma nova rota"}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => {
            if (temRotaEmAndamento) {
              router.push("/rota-em-andamento");
            } else {
              router.push("/iniciar-rota");
            }
          }}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="truck-check" size={26} color="#FFF" />

            <Text style={styles.buttonText}>
              {temRotaEmAndamento ? "CONTINUAR ROTA" : "INICIAR ROTA"}
            </Text>
          </View>
        </Pressable>

        <View style={styles.menu}>
          <Pressable
            style={styles.menuButton}
            onPress={() => router.push("/perfil")}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemTitleRow}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={28}
                  color="#1976D2"
                />

                <Text style={styles.menuTitle}>Perfil</Text>
              </View>

              <Text style={styles.menuSubtitle}>Dados do motorista</Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable
            style={styles.menuButton}
            onPress={() => router.push("/caminhao")}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemTitleRow}>
                <MaterialCommunityIcons
                  name="truck"
                  size={28}
                  color="#1976D2"
                />

                <Text style={styles.menuTitle}>Caminhão</Text>
              </View>

              <Text style={styles.menuSubtitle}>Dados do veículo</Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5FAFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },

  loadingTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2196F3",
  },

  loadingIndicator: {
    marginTop: 28,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  scroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  logo: {
    width: 125,
    height: 125,
    alignSelf: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2196F3",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },

  greetingTitle: {
    marginTop: 10,
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
  },

  greeting: {
    fontSize: 25,
    fontWeight: "700",
    color: "#163A5F",
    marginTop: 6,
    marginBottom: 24,
    textAlign: "center",
  },

  statusCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  statusCardAtiva: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },

  statusContent: {
    flex: 1,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },

  statusTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#163A5F",
    flexShrink: 1,
  },

  statusSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    flexShrink: 1,
  },

  button: {
    width: "100%",
    backgroundColor: "#2196F3",
    paddingVertical: 19,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#1976D2",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    flexShrink: 1,
    textAlign: "center",
  },

  menu: {
    width: "100%",
    marginTop: 28,
    gap: 15,
  },

  menuButton: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 16,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuItemContent: {
    flex: 1,
  },

  menuItemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#163A5F",
    marginLeft: 10,
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },

  arrow: {
    fontSize: 34,
    color: "#B0BEC5",
    fontWeight: "300",
    marginLeft: 8,
  },
});

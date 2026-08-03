import { obterRotaEmAndamento } from "@/services/rotas";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { obterMotorista } from "@/services/storage";

export default function HomeScreen() {
  const [nomeMotorista, setNomeMotorista] = useState("");
  const [temRotaEmAndamento, setTemRotaEmAndamento] = useState(false);
  const logo = require("@/assets/images/logo-valida-pipa.png");

  useFocusEffect(
    useCallback(() => {
      carregarMotorista();
    }, []),
  );

  async function carregarMotorista() {
    const motorista = await obterMotorista();

    if (motorista?.nome) {
      setNomeMotorista(motorista.nome);
    }

    const rota = await obterRotaEmAndamento();

    setTemRotaEmAndamento(!!rota);
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <Image
        source={logo}
        style={{
          width: 125,
          height: 125,
          alignSelf: "center",
          marginTop: 25,
          marginBottom: 8,
        }}
      />

      <Text style={styles.title}>VALIDA PIPA</Text>

      <Text style={styles.subtitle}>Validação inteligente de rotas</Text>

      <Text style={styles.greetingTitle}>
        {new Date().getHours() < 12
          ? "Bom dia 👋"
          : new Date().getHours() < 18
            ? "Boa tarde 👋"
            : "Boa noite 👋"}
      </Text>

      <Text style={styles.greeting}>{nomeMotorista || "Motorista"}</Text>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: temRotaEmAndamento ? "#22C55E" : "#9CA3AF",
            },
          ]}
        />

        <View>
          <Text style={styles.statusTitle}>
            {temRotaEmAndamento
              ? "Rota em andamento"
              : "Nenhuma rota em andamento"}
          </Text>

          <Text style={styles.statusSubtitle}>
            {temRotaEmAndamento
              ? "Toque abaixo para continuar"
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="truck-check" size={26} color="#FFF" />

          <Text
            style={[
              styles.buttonText,
              {
                marginLeft: 10,
              },
            ]}
          >
            {temRotaEmAndamento ? "CONTINUAR ROTA" : "INICIAR ROTA"}
          </Text>
        </View>
      </Pressable>

      <View style={styles.menu}>
        <Pressable
          style={styles.menuButton}
          onPress={() => router.push("/perfil")}
        >
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="account-circle"
                size={28}
                color="#1976D2"
              />

              <Text style={[styles.menuTitle, { marginLeft: 10 }]}>Perfil</Text>
            </View>
            <Text style={styles.menuSubtitle}>Dados do motorista</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={() => router.push("/caminhao")}
        >
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons name="truck" size={28} color="#1976D2" />

              <Text style={[styles.menuTitle, { marginLeft: 10 }]}>
                Caminhão
              </Text>
            </View>
            <Text style={styles.menuSubtitle}>Dados do veículo</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
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
  },

  statusSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  logo: {
    fontSize: 70,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2196F3",
  },
  arrow: {
    fontSize: 34,
    color: "#B0BEC5",
    fontWeight: "300",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  greetingTitle: {
    marginTop: 18,
    fontSize: 18,
    color: "#6B7280",
  },

  greeting: {
    fontSize: 25,
    fontWeight: "700",
    color: "#163A5F",
    marginTop: 6,
    marginBottom: 35,
  },

  button: {
    width: "100%",
    backgroundColor: "#2196F3",

    paddingVertical: 22,

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

  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  menu: {
    width: "100%",
    marginTop: 50,
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

  menuText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  menuTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#163A5F",
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },
});

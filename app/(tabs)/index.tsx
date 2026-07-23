import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { obterMotorista } from "@/services/storage";

export default function HomeScreen() {
  const [nomeMotorista, setNomeMotorista] = useState("");

  useEffect(() => {
    carregarMotorista();
  }, []);

  async function carregarMotorista() {
    const motorista = await obterMotorista();

    if (motorista?.nome) {
      setNomeMotorista(motorista.nome);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🚛</Text>

      <Text style={styles.title}>VALIDA PIPA</Text>

      <Text style={styles.subtitle}>Validação inteligente de rotas</Text>

      <Text style={styles.greeting}>
        {nomeMotorista ? `Olá, ${nomeMotorista}!` : "Olá!"}
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/iniciar-rota")}
      >
        <Text style={styles.buttonText}>INICIAR ROTA</Text>
      </Pressable>

      <View style={styles.menu}>
        <Pressable
          style={styles.menuButton}
          onPress={() => router.push("/perfil")}
        >
          <Text style={styles.menuText}>👤 Perfil</Text>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={() => router.push("/caminhao")}
        >
          <Text style={styles.menuText}>🚛 Caminhão</Text>
        </Pressable>
      </View>
    </View>
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

  logo: {
    fontSize: 70,
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2196F3",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 17,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },

  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#163A5F",
    marginBottom: 40,
  },

  button: {
    width: "100%",
    backgroundColor: "#2196F3",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
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
    borderRadius: 12,
    elevation: 2,
  },

  menuText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});

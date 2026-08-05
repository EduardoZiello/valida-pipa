import { obterRotas, Rota } from "@/services/rotas";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetalhesRotaScreen() {
  const { id } = useLocalSearchParams();
  const [rota, setRota] = useState<Rota | null>(null);

  useEffect(() => {
    carregarRota();
  }, []);

  async function carregarRota() {
    const lista = await obterRotas();

    const rotaEncontrada = lista.find((r) => r.id === id);

    if (rotaEncontrada) {
      setRota(rotaEncontrada);
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Detalhes da Rota</Text>

        {rota && (
          <>
            <Text style={styles.subtitle}>{rota.motorista}</Text>

            <Text
              style={{
                marginTop: 12,
                textAlign: "center",
                color: "#1976D2",
                fontWeight: "700",
                fontSize: 22,
              }}
            >
              🚛 {rota.placa}
            </Text>

            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                color: "#666",
              }}
            >
              {rota.dataHoraInicio}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#163A5F",
    textAlign: "center",
    marginTop: 20,
  },

  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#6B7280",
  },
});

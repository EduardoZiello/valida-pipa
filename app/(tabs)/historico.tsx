import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { useFocusEffect } from "expo-router";

import { obterRotas, Rota } from "@/services/rotas";

export default function HistoricoScreen() {
  const [rotas, setRotas] = useState<Rota[]>([]);

  useFocusEffect(
    useCallback(() => {
      carregarRotas();
    }, []),
  );

  async function carregarRotas() {
    const lista = await obterRotas();
    setRotas(lista);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>

      <FlatList
        data={rotas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma rota cadastrada.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.id}>{item.id}</Text>

            <Text>👤 {item.motorista}</Text>

            <Text>🚛 {item.modelo}</Text>

            <Text>📋 {item.placa}</Text>

            <Text>📅 {item.dataHoraInicio}</Text>

            <Text
              style={{
                color: item.status === "EM_ANDAMENTO" ? "green" : "blue",
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  id: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 8,
    color: "#1565C0",
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    color: "#6B7280",
  },
});

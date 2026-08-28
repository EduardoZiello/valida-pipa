import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Histórico</Text>

      <Text style={styles.subtitle}>Todas as rotas realizadas</Text>

      <FlatList
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        data={rotas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma rota encontrada.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/detalhes-rota",
                params: {
                  id: item.id,
                },
              })
            }
          >
            <View style={styles.header}>
              <Text style={styles.idRota}>Rota #{item.id.slice(-6)}</Text>
              <Text style={styles.placa}>🚛 {item.placa}</Text>

              <Text style={styles.arrow}>›</Text>
            </View>

            <Text style={styles.motorista}>{item.motorista}</Text>

            <View style={styles.linhaInfo}>
              <MaterialCommunityIcons
                name="calendar-month"
                size={18}
                color="#1976D2"
              />

              <Text style={styles.infoTexto}>{item.dataHoraInicio}</Text>
            </View>

            <View style={styles.statusBadge}>
              <MaterialCommunityIcons
                name={
                  item.status === "FINALIZADA"
                    ? "check-circle"
                    : "progress-clock"
                }
                size={18}
                color={item.status === "FINALIZADA" ? "#22C55E" : "#1976D2"}
              />

              <Text
                style={[
                  styles.statusTexto,
                  {
                    color: item.status === "FINALIZADA" ? "#22C55E" : "#1976D2",
                  },
                ]}
              >
                {item.status === "FINALIZADA" ? "Finalizada" : "Em andamento"}
              </Text>
            </View>

            <View style={styles.linhaInfo}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={18}
                color="#F59E0B"
              />

              <Text style={styles.infoTexto}>
                {item.ocorrencias?.length ?? 0} ocorrência(s)
              </Text>
            </View>
            <View style={styles.linhaInfo}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={18}
                color="#1976D2"
              />
              <Text style={styles.infoTexto}>
                {item.distanciaPercorridaKm !== undefined
                  ? `${item.distanciaPercorridaKm.toFixed(2)} km percorridos`
                  : "Distância não calculada"}
              </Text>
            </View>

            <View style={styles.linhaInfo}>
              <MaterialCommunityIcons
                name="map-marker-multiple"
                size={18}
                color="#1976D2"
              />
              <Text style={styles.infoTexto}>
                {item.trajeto?.length ?? 0} ponto(s) registrados
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#163A5F",
    textAlign: "center",
    marginTop: 25,
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 10,
    fontSize: 15,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  placa: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1565C0",
  },

  motorista: {
    fontSize: 16,
    fontWeight: "600",
    color: "#163A5F",
    marginBottom: 12,
  },

  info: {
    color: "#6B7280",
    marginBottom: 4,
    fontSize: 15,
  },

  arrow: {
    fontSize: 30,
    color: "#B0BEC5",
  },

  empty: {
    marginTop: 80,
    textAlign: "center",
    color: "#6B7280",
  },
  idRota: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "600",
  },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  infoTexto: {
    marginLeft: 8,
    color: "#6B7280",
    fontSize: 15,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  statusTexto: {
    marginLeft: 8,
    fontWeight: "700",
  },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Stack } from "expo-router";

import { StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function AssinaturaScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          title: "Minha Assinatura",
          headerShown: true,
        }}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="credit-card-outline"
            size={42}
            color="#1976D2"
          />
        </View>

        <Text style={styles.title}>Minha Assinatura</Text>

        <Text style={styles.subtitle}>
          Gerencie aqui seu plano de acesso ao Valida Pipa.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PLANO ATUAL</Text>

          <Text style={styles.planTitle}>Plano Valida Pipa</Text>

          <View style={styles.statusRow}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>Configuração pendente</Text>
          </View>

          <Text style={styles.info}>
            Os detalhes do plano e da assinatura serão disponibilizados nesta
            área.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },

  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#EAF4FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#163A5F",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.8,
  },

  planTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#163A5F",
    marginTop: 8,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F59E0B",
    marginRight: 8,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },

  info: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    marginTop: 18,
  },
});

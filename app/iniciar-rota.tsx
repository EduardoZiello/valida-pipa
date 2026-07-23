import { useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function IniciarRotaScreen() {
  const [fotoCapturada] = useState(false);
  const [gpsCapturado] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Nova Rota</Text>

        <Text style={styles.subtitle}>
          Siga as etapas abaixo para iniciar uma nova viagem.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Motorista</Text>
          <Text style={styles.cardValue}>Não informado</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚛 Caminhão</Text>
          <Text style={styles.cardValue}>Não informado</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Foto Inicial</Text>

          <Text
            style={[
              styles.status,
              fotoCapturada ? styles.success : styles.pending,
            ]}
          >
            {fotoCapturada ? "✔ Foto capturada" : "✖ Foto pendente"}
          </Text>

          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>TIRAR FOTO</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Localização</Text>

          <Text
            style={[
              styles.status,
              gpsCapturado ? styles.success : styles.pending,
            ]}
          >
            {gpsCapturado
              ? "✔ Localização capturada"
              : "✖ Localização pendente"}
          </Text>

          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>CAPTURAR GPS</Text>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.button,
            !(fotoCapturada && gpsCapturado) && styles.buttonDisabled,
          ]}
          disabled={!fotoCapturada || !gpsCapturado}
        >
          <Text style={styles.buttonText}>INICIAR ROTA</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#163A5F",
    marginTop: 20,
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 30,
    fontSize: 15,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#163A5F",
  },

  cardValue: {
    marginTop: 8,
    fontSize: 16,
    color: "#4B5563",
  },

  status: {
    marginTop: 14,
    marginBottom: 14,
    fontWeight: "600",
  },

  pending: {
    color: "#E53935",
  },

  success: {
    color: "#2E7D32",
  },

  secondaryButton: {
    backgroundColor: "#EAF4FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#1565C0",
    fontWeight: "700",
    fontSize: 16,
  },

  button: {
    backgroundColor: "#1565C0",
    height: 58,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  buttonDisabled: {
    backgroundColor: "#B0BEC5",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

import { StyleSheet, Text, View } from "react-native";

export default function DetalhesRotaWebScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Valida Pipa</Text>

      <Text style={styles.texto}>
        Os detalhes completos da rota estão disponíveis no aplicativo Valida
        Pipa.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F5FAFF",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#163A5F",
    marginBottom: 12,
  },

  texto: {
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
    textAlign: "center",
  },
});

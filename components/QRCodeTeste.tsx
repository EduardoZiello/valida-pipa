import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

const URL_VALIDACAO =
  "https://valida-pipa-33e0f.web.app/validar/2osB3HEmxnTTZ141bGWg";

export default function QRCodeTeste() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Teste do QR Code</Text>

      <Text style={styles.descricao}>
        Escaneie este QR Code com a câmera do celular.
      </Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={URL_VALIDACAO}
          size={260}
          backgroundColor="#FFFFFF"
          color="#000000"
        />
      </View>

      <Text style={styles.url}>QR de teste da validação pública</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F5F7FA",
  },

  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1261A0",
    marginBottom: 8,
  },

  descricao: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },

  qrContainer: {
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },

  url: {
    marginTop: 20,
    fontSize: 13,
    color: "#777",
    textAlign: "center",
  },
});

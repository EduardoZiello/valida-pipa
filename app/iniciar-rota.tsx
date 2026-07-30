import { abrirCamera } from "@/services/camera";
import { obterRotaEmAndamento, salvarRota } from "@/services/rotas";
import { obterCaminhao, obterMotorista } from "@/services/storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function IniciarRotaScreen() {
  const [foto, setFoto] = useState<string | null>(null);
  const fotoCapturada = !!foto;
  const [motorista, setMotorista] = useState<any>(null);
  const [caminhao, setCaminhao] = useState<any>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [dataHoraGPS, setDataHoraGPS] = useState<string | null>(null);

  const gpsCapturado = latitude !== null && longitude !== null;

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const motoristaSalvo = await obterMotorista();
    const caminhaoSalvo = await obterCaminhao();

    setMotorista(motoristaSalvo);
    setCaminhao(caminhaoSalvo);
  }
  async function tirarFotoInicial() {
    try {
      const uri = await abrirCamera();

      if (uri) {
        setFoto(uri);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  }
  async function capturarGPS() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "É necessário permitir o acesso à localização.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setDataHoraGPS(new Date().toLocaleString("pt-BR"));
    } catch {
      Alert.alert("Erro", "Não foi possível obter a localização.");
    }
  }
  async function iniciarRota() {
    if (
      !motorista ||
      !caminhao ||
      !foto ||
      latitude === null ||
      longitude === null ||
      !dataHoraGPS
    ) {
      Alert.alert(
        "Dados incompletos",
        "Preencha todas as etapas antes de iniciar a rota.",
      );
      return;
    }
    const rotaEmAndamento = await obterRotaEmAndamento();

    if (rotaEmAndamento) {
      Alert.alert(
        "Rota em andamento",
        "Já existe uma rota em andamento. Finalize-a antes de iniciar uma nova.",
      );

      return;
    }

    const id = `VP-${Date.now()}`;

    await salvarRota({
      id,

      motorista: motorista.nome,

      placa: caminhao.placa,
      modelo: caminhao.modelo,

      dataHoraInicio: dataHoraGPS,

      latitudeInicio: latitude,
      longitudeInicio: longitude,

      fotoInicio: foto,

      status: "EM_ANDAMENTO",
    });

    router.replace("/rota-em-andamento");
  }

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
          <Text style={styles.cardValue}>
            {motorista?.nome || "Não informado"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚛 Caminhão</Text>
          <Text style={styles.cardValue}>
            {caminhao
              ? `${caminhao.modelo}\n${caminhao.placa}`
              : "Não informado"}
          </Text>
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

          {foto && (
            <Image
              source={{ uri: foto }}
              style={{
                width: "100%",
                height: 180,
                borderRadius: 12,
                marginBottom: 14,
              }}
            />
          )}

          <Pressable style={styles.secondaryButton} onPress={tirarFotoInicial}>
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
          {gpsCapturado && (
            <Text style={styles.cardValue}>
              Latitude: {latitude?.toFixed(6)}
              {"\n"}
              Longitude: {longitude?.toFixed(6)}
              {"\n\n"}
              Data/Hora: {dataHoraGPS}
            </Text>
          )}

          <Pressable style={styles.secondaryButton} onPress={capturarGPS}>
            <Text style={styles.secondaryButtonText}>CAPTURAR GPS</Text>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.button,
            !(fotoCapturada && gpsCapturado) && styles.buttonDisabled,
          ]}
          disabled={!fotoCapturada || !gpsCapturado}
          onPress={iniciarRota}
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

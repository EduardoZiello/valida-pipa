import { abrirCamera } from "@/services/camera";
import { finalizarRota, obterRotaEmAndamento } from "@/services/rotas";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RotaEmAndamentoScreen() {
  const [rota, setRota] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoFinal, setFotoFinal] = useState<string | null>(null);

  const [latitudeFinal, setLatitudeFinal] = useState<number | null>(null);
  const [longitudeFinal, setLongitudeFinal] = useState<number | null>(null);

  const [dataHoraFinal, setDataHoraFinal] = useState<string | null>(null);

  const fotoFinalCapturada = !!fotoFinal;

  const gpsFinalCapturado = latitudeFinal !== null && longitudeFinal !== null;

  useEffect(() => {
    carregarRota();
  }, []);

  async function carregarRota() {
    const rotaSalva = await obterRotaEmAndamento();

    setRota(rotaSalva);
    setCarregando(false);
  }
  async function tirarFotoFinal() {
    try {
      const uri = await abrirCamera();

      if (uri) {
        setFotoFinal(uri);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  }
  async function capturarGPSFinal() {
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

      setLatitudeFinal(location.coords.latitude);
      setLongitudeFinal(location.coords.longitude);
      setDataHoraFinal(new Date().toLocaleString("pt-BR"));
    } catch {
      Alert.alert("Erro", "Não foi possível obter a localização.");
    }
  }
  async function encerrarRota() {
    if (
      !rota ||
      !fotoFinal ||
      latitudeFinal === null ||
      longitudeFinal === null ||
      !dataHoraFinal
    ) {
      Alert.alert(
        "Dados incompletos",
        "Capture a foto final e o GPS antes de finalizar a rota.",
      );
      return;
    }

    Alert.alert("Finalizar rota", "Deseja realmente finalizar esta rota?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Finalizar",
        onPress: async () => {
          await finalizarRota(rota.id, {
            fotoFim: fotoFinal,
            latitudeFim: latitudeFinal,
            longitudeFim: longitudeFinal,
            dataHoraFim: dataHoraFinal,
          });

          Alert.alert("Sucesso", "Rota finalizada com sucesso!");

          router.replace("/");
        },
      },
    ]);
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={{ marginTop: 15 }}>Carregando rota...</Text>
      </SafeAreaView>
    );
  }

  if (!rota) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.semRota}>Nenhuma rota em andamento.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🚛 Rota em Andamento</Text>

        <View style={styles.card}>
          <Text style={styles.label}>🆔 ID</Text>
          <Text style={styles.value}>{rota.id}</Text>

          <Text style={styles.label}>👤 Motorista</Text>
          <Text style={styles.value}>{rota.motorista}</Text>

          <Text style={styles.label}>🚛 Caminhão</Text>
          <Text style={styles.value}>{rota.modelo}</Text>

          <Text style={styles.label}>📋 Placa</Text>
          <Text style={styles.value}>{rota.placa}</Text>

          <Text style={styles.label}>🕒 Início</Text>
          <Text style={styles.value}>{rota.dataHoraInicio}</Text>
        </View>

        <Image source={{ uri: rota.fotoInicio }} style={styles.foto} />
        <View style={styles.card}>
          <Text style={styles.label}>📷 Foto Final</Text>

          <Text
            style={{
              marginTop: 10,
              marginBottom: 12,
              color: fotoFinalCapturada ? "#2E7D32" : "#D32F2F",
              fontWeight: "700",
            }}
          >
            {fotoFinalCapturada ? "✔ Foto capturada" : "✖ Foto não capturada"}
          </Text>

          {fotoFinal && (
            <Image source={{ uri: fotoFinal }} style={styles.foto} />
          )}

          <Pressable style={styles.botao} onPress={tirarFotoFinal}>
            <Text style={styles.botaoTexto}>TIRAR FOTO FINAL</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>📍 GPS Final</Text>

          <Text
            style={{
              marginTop: 10,
              marginBottom: 12,
              color: gpsFinalCapturado ? "#2E7D32" : "#D32F2F",
              fontWeight: "700",
            }}
          >
            {gpsFinalCapturado
              ? "✔ Localização capturada"
              : "✖ Localização pendente"}
          </Text>

          {gpsFinalCapturado && (
            <Text style={styles.value}>
              Latitude: {latitudeFinal?.toFixed(6)}
              {"\n"}
              Longitude: {longitudeFinal?.toFixed(6)}
              {"\n\n"}
              {dataHoraFinal}
            </Text>
          )}

          <Pressable style={styles.botao} onPress={capturarGPSFinal}>
            <Text style={styles.botaoTexto}>CAPTURAR GPS FINAL</Text>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.botao,
            (!fotoFinalCapturada || !gpsFinalCapturado) && {
              backgroundColor: "#B0BEC5",
            },
          ]}
          disabled={!fotoFinalCapturada || !gpsFinalCapturado}
          onPress={encerrarRota}
        >
          <Text style={styles.botaoTexto}>FINALIZAR ROTA</Text>
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
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#163A5F",
    marginBottom: 25,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  label: {
    marginTop: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

  value: {
    fontSize: 17,
    color: "#163A5F",
    fontWeight: "700",
  },

  foto: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    marginBottom: 25,
  },

  botao: {
    backgroundColor: "#D32F2F",
    height: 58,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  botaoTexto: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  semRota: {
    fontSize: 18,
    color: "#555",
  },
});

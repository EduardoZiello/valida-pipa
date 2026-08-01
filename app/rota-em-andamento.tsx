import { abrirCamera } from "@/services/camera";
import { finalizarRota, obterRotaEmAndamento } from "@/services/rotas";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const [quantidadeOcorrencias, setQuantidadeOcorrencias] = useState(0);
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
  useFocusEffect(
    React.useCallback(() => {
      carregarRota();
    }, []),
  );

  async function carregarRota() {
    const rotaSalva = await obterRotaEmAndamento();

    setRota(rotaSalva);

    setQuantidadeOcorrencias(rotaSalva?.ocorrencias?.length ?? 0);

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
          <Text style={styles.label}>⚠️ Ocorrências</Text>

          {rota.ocorrencias?.length === 0 ? (
            <Text style={styles.value}>Nenhuma ocorrência registrada.</Text>
          ) : (
            rota.ocorrencias?.map((ocorrencia: any, index: number) => (
              <View
                key={ocorrencia.id}
                style={{
                  marginTop: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#EEE",
                  paddingBottom: 12,
                }}
              >
                <Image
                  source={{ uri: ocorrencia.foto }}
                  style={{
                    width: "100%",
                    height: 180,
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                />

                <Text style={styles.value}>
                  {index + 1}. {ocorrencia.dataHora}
                </Text>

                <Text style={{ color: "#555", marginTop: 6 }}>
                  📍 Latitude: {ocorrencia.latitude.toFixed(6)}
                </Text>

                <Text style={{ color: "#555" }}>
                  📍 Longitude: {ocorrencia.longitude.toFixed(6)}
                </Text>

                <Text style={{ color: "#666", marginTop: 4 }}>
                  {ocorrencia.observacao || "Sem observação"}
                </Text>
              </View>
            ))
          )}
        </View>
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

      <Pressable style={styles.fab} onPress={() => router.push("/ocorrencia")}>
        <Text style={styles.fabBadge}>{quantidadeOcorrencias}</Text>

        <Text style={styles.fabIcon}>⚠️</Text>

        <Text style={styles.fabText}>OCORRÊNCIA</Text>
      </Pressable>
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: "#F57C00",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  fabIcon: {
    fontSize: 28,
  },

  fabText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 10,
    marginTop: 2,
  },

  fabBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#D32F2F",
    color: "#FFF",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "700",
    overflow: "hidden",
  },
});

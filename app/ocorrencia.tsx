import { abrirCamera } from "@/services/camera";
import * as RotasService from "@/services/rotas";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
console.log("RotasService:", RotasService);

export default function OcorrenciaScreen() {
  const [foto, setFoto] = useState<string | null>(null);
  const [observacao, setObservacao] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  async function tirarFoto() {
    const uri = await abrirCamera();

    if (uri) {
      setFoto(uri);
    }
  }

  async function capturarGPS() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permissão", "Permita acessar a localização.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});

    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  }

  async function salvarOcorrenciaNaRota() {
    try {
      console.log("1 - Iniciou");

      if (!foto || latitude === null || longitude === null) {
        Alert.alert(
          "Dados incompletos",
          "Tire a foto e capture o GPS antes de salvar.",
        );
        return;
      }

      console.log("2 - Dados OK");

      const rota = await RotasService.obterRotaEmAndamento();

      console.log("3 - Rota:", rota);

      if (!rota) {
        Alert.alert("Erro", "Nenhuma rota em andamento.");
        return;
      }

      console.log("4 - Antes de salvar");

      await RotasService.salvarOcorrencia(rota.id, {
        id: Date.now().toString(),
        dataHora: new Date().toLocaleString("pt-BR"),
        foto,
        latitude,
        longitude,
        observacao,
      });

      console.log("5 - Salvou");

      Alert.alert("Sucesso", "Ocorrência registrada!");

      router.back();
    } catch (error) {
      console.error("ERRO COMPLETO:", error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Registrar Ocorrência</Text>

        {foto && <Image source={{ uri: foto }} style={styles.foto} />}

        <Pressable style={styles.botao} onPress={tirarFoto}>
          <Text style={styles.botaoTexto}>TIRAR FOTO</Text>
        </Pressable>

        <Pressable style={styles.botao} onPress={capturarGPS}>
          <Text style={styles.botaoTexto}>CAPTURAR GPS</Text>
        </Pressable>

        {latitude && longitude && (
          <Text style={styles.gps}>
            Lat: {latitude.toFixed(6)}
            {"\n"}
            Lon: {longitude.toFixed(6)}
          </Text>
        )}

        <TextInput
          placeholder="Descreva a ocorrência..."
          value={observacao}
          onChangeText={setObservacao}
          multiline
          style={styles.input}
        />

        <Pressable style={styles.botaoSalvar} onPress={salvarOcorrenciaNaRota}>
          <Text style={styles.botaoTexto}>SALVAR OCORRÊNCIA</Text>
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
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#163A5F",
  },

  foto: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },

  botao: {
    backgroundColor: "#1565C0",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  botaoSalvar: {
    backgroundColor: "#2E7D32",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  botaoTexto: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  gps: {
    marginVertical: 15,
    color: "#163A5F",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    minHeight: 120,
    padding: 15,
    textAlignVertical: "top",
  },
});

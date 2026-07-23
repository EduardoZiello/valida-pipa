import { useEffect, useState } from "react";
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

import { abrirCamera, abrirGaleria } from "@/services/camera";
import { obterCaminhao, salvarCaminhao } from "@/services/storage";

export default function CaminhaoScreen() {
  const [placa, setPlaca] = useState("");
  const [renavam, setRenavam] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [foto, setFoto] = useState<string | null>(null);

  useEffect(() => {
    carregarCaminhao();
  }, []);

  async function carregarCaminhao() {
    const caminhao = await obterCaminhao();

    if (!caminhao) return;

    setPlaca(caminhao.placa || "");
    setRenavam(caminhao.renavam || "");
    setModelo(caminhao.modelo || "");
    setCapacidade(caminhao.capacidade || "");
    setFoto(caminhao.foto || null);
  }
  async function tirarFoto() {
    try {
      const uri = await abrirCamera();

      if (uri) {
        setFoto(uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  }
  async function escolherDaGaleria() {
    try {
      const uri = await abrirGaleria();

      if (uri) {
        setFoto(uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  }
  function abrirMenuFoto() {
    if (!foto) {
      Alert.alert("Foto do Caminhão", "Escolha uma opção", [
        {
          text: "📷 Tirar foto",
          onPress: tirarFoto,
        },
        {
          text: "🖼 Galeria",
          onPress: escolherDaGaleria,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]);

      return;
    }

    Alert.alert("Foto do Caminhão", "O que deseja fazer?", [
      {
        text: "📷 Tirar outra foto",
        onPress: tirarFoto,
      },
      {
        text: "🖼 Escolher outra",
        onPress: escolherDaGaleria,
      },
      {
        text: "🗑 Remover foto",
        style: "destructive",
        onPress: () => setFoto(null),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  }

  async function salvar() {
    const caminhao = {
      placa,
      renavam,
      modelo,
      capacidade,
      foto,
    };

    await salvarCaminhao(caminhao);

    Alert.alert("Sucesso", "Caminhão salvo com sucesso!");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.photoCard} onPress={abrirMenuFoto}>
          {foto ? (
            <Image
              source={{ uri: foto }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 16,
              }}
            />
          ) : (
            <>
              <Text style={styles.photoIcon}>📷</Text>

              <Text style={styles.photoTitle}>Foto do Caminhão</Text>

              <Text style={styles.photoSubtitle}>
                Toque para adicionar uma foto
              </Text>
            </>
          )}
        </Pressable>

        <Text style={styles.title}>Cadastro do Caminhão</Text>

        <Text style={styles.subtitle}>
          Informe os dados do veículo utilizado nas rotas.
        </Text>

        <Text style={styles.label}>Placa</Text>

        <TextInput
          style={styles.input}
          placeholder="ABC-1234"
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>RENAVAM</Text>

        <TextInput
          style={styles.input}
          placeholder="Número do RENAVAM"
          keyboardType="numeric"
          value={renavam}
          onChangeText={setRenavam}
        />

        <Text style={styles.label}>Modelo</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex.: Mercedes Atego"
          value={modelo}
          onChangeText={setModelo}
        />

        <Text style={styles.label}>Capacidade do Tanque (Litros)</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex.: 10000"
          keyboardType="numeric"
          value={capacidade}
          onChangeText={setCapacidade}
        />

        <Pressable style={styles.button} onPress={salvar}>
          <Text style={styles.buttonText}>SALVAR</Text>
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

  photoCard: {
    height: 170,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#1565C0",
    backgroundColor: "#EEF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  photoIcon: {
    fontSize: 46,
  },

  photoTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#163A5F",
  },

  photoSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#163A5F",
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 28,
    fontSize: 15,
  },

  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#163A5F",
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 18,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#1565C0",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 17,
  },
});

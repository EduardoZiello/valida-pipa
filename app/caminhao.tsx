import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { abrirCamera, abrirGaleria } from "@/services/camera";
import { obterCaminhao, salvarCaminhao } from "@/services/storage";

export default function CaminhaoScreen() {
  const [placa, setPlaca] = useState("");
  const [renavam, setRenavam] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    carregarCaminhao();
  }, []);

  async function carregarCaminhao() {
    const caminhao = await obterCaminhao();

    if (!caminhao) {
      setEditando(true);
      return;
    }

    setEditando(false);

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

    setEditando(false);

    Alert.alert("Sucesso", "Caminhão salvo com sucesso!");
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.photoCard}
          onPress={abrirMenuFoto}
          disabled={!editando}
        >
          {foto ? (
            <>
              <Image source={{ uri: foto }} style={styles.photoImage} />

              <View style={styles.photoOverlay}>
                <Text style={styles.photoOverlayText}>
                  TOCAR PARA ALTERAR A FOTO
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.photoIcon}>📷</Text>

              <Text style={styles.photoTitle}>Foto do Caminhão</Text>

              <Text style={styles.photoSubtitle}>
                Adicione uma foto para identificação do veículo
              </Text>
            </>
          )}
        </Pressable>

        <Text style={styles.title}>Cadastro do Caminhão</Text>

        <Text style={styles.subtitle}>
          Informe os dados do veículo utilizado nas rotas.
        </Text>

        <View style={styles.dadosCard}>
          <Text style={styles.dadosCardTitle}>DADOS DO VEÍCULO</Text>

          <Text style={styles.label}>Placa</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC-1234"
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
            editable={editando}
          />

          <Text style={styles.label}>RENAVAM</Text>
          <TextInput
            style={styles.input}
            placeholder="Número do RENAVAM"
            keyboardType="numeric"
            value={renavam}
            onChangeText={setRenavam}
            editable={editando}
          />

          <Text style={styles.label}>Modelo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Mercedes Atego"
            value={modelo}
            onChangeText={setModelo}
            editable={editando}
          />

          <Text style={styles.label}>Capacidade do Tanque (Litros)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 10000"
            keyboardType="numeric"
            value={capacidade}
            onChangeText={setCapacidade}
            editable={editando}
          />
        </View>

        <Pressable
          style={styles.button}
          onPress={editando ? salvar : () => setEditando(true)}
        >
          <Text style={styles.buttonText}>
            {editando ? "SALVAR ALTERAÇÕES" : "EDITAR CAMINHÃO"}
          </Text>
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
    height: 190,
    borderRadius: 20,
    backgroundColor: "#EAF2FC",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D6E2F0",
  },

  photoImage: {
    width: "100%",
    height: "100%",
  },

  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(22, 58, 95, 0.78)",
    paddingVertical: 10,
    alignItems: "center",
  },

  photoOverlayText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
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
  dadosCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  dadosCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 0.8,
    marginBottom: 22,
  },
});

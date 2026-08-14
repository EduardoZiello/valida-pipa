import { abrirCamera } from "@/services/camera";
import { obterMotorista, salvarMotorista } from "@/services/storage";
import { useEffect, useState } from "react";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function PerfilScreen() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnh, setCnh] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    const motorista = await obterMotorista();

    if (!motorista) {
      setEditando(true);
      return;
    }

    setNome(motorista.nome || "");
    setCpf(motorista.cpf || "");
    setCnh(motorista.cnh || "");
    setTelefone(motorista.telefone || "");
    setEmail(motorista.email || "");
    setFoto(motorista.foto || null);

    setEditando(false);
  }

  async function tirarFoto() {
    if (!editando) return;

    try {
      const uri = await abrirCamera();

      if (uri) {
        setFoto(uri);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  }

  async function salvar() {
    const motorista = {
      nome,
      cpf,
      cnh,
      telefone,
      email,
      foto,
    };

    await salvarMotorista(motorista);

    setEditando(false);

    Alert.alert("Sucesso", "Perfil salvo com sucesso!");
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.photoContainer}
            onPress={tirarFoto}
            disabled={!editando}
          >
            {foto ? (
              <Image source={{ uri: foto }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>👤</Text>
              </View>
            )}
          </Pressable>

          {editando && (
            <Pressable style={styles.photoButton} onPress={tirarFoto}>
              <Text style={styles.photoButtonText}>
                {foto ? "ALTERAR FOTO" : "ADICIONAR FOTO"}
              </Text>
            </Pressable>
          )}

          <Text style={styles.title}>Perfil do Motorista</Text>

          <Text style={styles.subtitle}>
            {editando
              ? "Preencha os dados do motorista responsável pela rota."
              : "Confira os dados do motorista responsável pela rota."}
          </Text>

          <Text style={styles.label}>Nome</Text>

          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite o nome completo"
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
            editable={editando}
          />

          <Text style={styles.label}>CPF</Text>

          <TextInput
            style={styles.input}
            value={cpf}
            keyboardType="numeric"
            onChangeText={setCpf}
            placeholder="Digite o CPF"
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
            editable={editando}
          />

          <Text style={styles.label}>CNH</Text>

          <TextInput
            style={styles.input}
            value={cnh}
            onChangeText={setCnh}
            placeholder="Digite o número da CNH"
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
            editable={editando}
          />

          <Text style={styles.label}>Telefone</Text>

          <TextInput
            style={styles.input}
            value={telefone}
            keyboardType="phone-pad"
            onChangeText={setTelefone}
            placeholder="Digite o telefone"
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
            editable={editando}
          />

          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={styles.input}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Digite o e-mail"
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            editable={editando}
          />

          <Pressable
            style={styles.button}
            onPress={editando ? salvar : () => setEditando(true)}
          >
            <Text style={styles.buttonText}>
              {editando ? "SALVAR ALTERAÇÕES" : "EDITAR PERFIL"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  keyboardContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 140,
  },

  photoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignSelf: "center",
    marginBottom: 12,
    overflow: "hidden",
  },

  photoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
    backgroundColor: "#E6EEF8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D5E1EF",
  },

  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
  },

  photoIcon: {
    fontSize: 56,
  },

  photoButton: {
    alignSelf: "center",
    backgroundColor: "#EAF4FF",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    marginBottom: 24,
  },

  photoButtonText: {
    color: "#1565C0",
    fontWeight: "700",
    fontSize: 13,
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
    lineHeight: 22,
  },

  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#163A5F",
    fontSize: 15,
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 16,
    fontSize: 16,
    color: "#1F2937",
  },

  button: {
    backgroundColor: "#1565C0",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 17,
  },
});

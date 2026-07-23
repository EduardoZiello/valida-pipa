import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { obterMotorista, salvarMotorista } from "@/services/storage";

export default function PerfilScreen() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnh, setCnh] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    const motorista = await obterMotorista();

    if (!motorista) return;

    setNome(motorista.nome || "");
    setCpf(motorista.cpf || "");
    setCnh(motorista.cnh || "");
    setTelefone(motorista.telefone || "");
    setEmail(motorista.email || "");
  }

  async function salvar() {
    const motorista = {
      nome,
      cpf,
      cnh,
      telefone,
      email,
    };

    await salvarMotorista(motorista);

    Alert.alert("Sucesso", "Perfil salvo com sucesso!");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photo}>
          <Text style={styles.photoIcon}>👤</Text>
        </View>

        <Text style={styles.title}>Perfil do Motorista</Text>

        <Text style={styles.subtitle}>
          Preencha os dados do motorista responsável pela rota.
        </Text>

        <Text style={styles.label}>Nome</Text>

        <TextInput style={styles.input} value={nome} onChangeText={setNome} />

        <Text style={styles.label}>CPF</Text>

        <TextInput
          style={styles.input}
          value={cpf}
          keyboardType="numeric"
          onChangeText={setCpf}
        />

        <Text style={styles.label}>CNH</Text>

        <TextInput style={styles.input} value={cnh} onChangeText={setCnh} />

        <Text style={styles.label}>Telefone</Text>

        <TextInput
          style={styles.input}
          value={telefone}
          keyboardType="phone-pad"
          onChangeText={setTelefone}
        />

        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
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

  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E6EEF8",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },

  photoIcon: {
    fontSize: 56,
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
    marginBottom: 16,
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

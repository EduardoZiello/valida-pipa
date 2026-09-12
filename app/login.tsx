import { auth } from "@/services/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { router } from "expo-router";

import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function criarConta() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert(
        "Atenção",
        "Informe o e-mail e a senha para criar sua conta.",
      );
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setCarregando(true);

      await createUserWithEmailAndPassword(auth, email.trim(), senha);

      Alert.alert("Conta criada", "Sua conta foi criada com sucesso!", [
        {
          text: "Continuar",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error: any) {
      console.error("ERRO AO CRIAR CONTA:", error);

      let mensagem = "Não foi possível criar a conta.";

      if (error?.code === "auth/email-already-in-use") {
        mensagem = "Este e-mail já está cadastrado.";
      } else if (error?.code === "auth/invalid-email") {
        mensagem = "Informe um e-mail válido.";
      } else if (error?.code === "auth/weak-password") {
        mensagem = "A senha escolhida é muito fraca.";
      }

      Alert.alert("Erro", mensagem);
    } finally {
      setCarregando(false);
    }
  }

  async function entrar() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Informe o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      await signInWithEmailAndPassword(auth, email.trim(), senha);

      router.replace("/");
    } catch (error: any) {
      console.error("ERRO AO ENTRAR:", error);

      let mensagem = "Não foi possível entrar.";

      if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/user-not-found"
      ) {
        mensagem = "E-mail ou senha incorretos.";
      } else if (error?.code === "auth/invalid-email") {
        mensagem = "Informe um e-mail válido.";
      }

      Alert.alert("Erro", mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo-valida-pipa.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>VALIDA PIPA</Text>

      <Text style={styles.subtitle}>
        Acesse sua conta para registrar e validar suas rotas.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          placeholder="seuemail@exemplo.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!carregando}
        />

        <Text style={styles.label}>Senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#9CA3AF"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          editable={!carregando}
        />

        <Pressable
          style={[styles.button, carregando && styles.buttonDisabled]}
          onPress={entrar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.createButton}
          onPress={criarConta}
          disabled={carregando}
        >
          <Text style={styles.createButtonText}>CRIAR MINHA CONTA</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        Valida Pipa • Validação inteligente de rotas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
    padding: 24,
    justifyContent: "center",
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2196F3",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 35,
    lineHeight: 22,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#163A5F",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D7E3EF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: "#163A5F",
    marginBottom: 20,
  },

  button: {
    width: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },

  createButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
  },

  createButtonText: {
    color: "#1976D2",
    fontSize: 16,
    fontWeight: "800",
  },

  footer: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 35,
  },
});

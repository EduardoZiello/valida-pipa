import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebase";

const MOTORISTA_KEY = "@valida_pipa:motorista";
const CAMINHAO_KEY = "@valida_pipa:caminhao";

// ========================
// MOTORISTA
// ========================

export async function salvarMotorista(dados: any) {
  await AsyncStorage.setItem(MOTORISTA_KEY, JSON.stringify(dados));

  const usuario = auth.currentUser;

  if (!usuario) {
    return;
  }

  await setDoc(
    doc(db, "usuarios", usuario.uid),
    {
      motorista: dados,
    },
    { merge: true },
  );
}

export async function obterMotorista() {
  const dados = await AsyncStorage.getItem(MOTORISTA_KEY);

  if (dados) {
    return JSON.parse(dados);
  }

  const usuario = auth.currentUser;

  if (!usuario) {
    return null;
  }

  try {
    const documento = await getDoc(doc(db, "usuarios", usuario.uid));

    if (!documento.exists()) {
      return null;
    }

    const dadosFirebase = documento.data()?.motorista;

    if (!dadosFirebase) {
      return null;
    }

    await AsyncStorage.setItem(MOTORISTA_KEY, JSON.stringify(dadosFirebase));

    return dadosFirebase;
  } catch (error) {
    console.error("❌ Erro ao recuperar motorista do Firebase:", error);

    return null;
  }
}

// ========================
// CAMINHÃO
// ========================

export async function salvarCaminhao(dados: any) {
  await AsyncStorage.setItem(CAMINHAO_KEY, JSON.stringify(dados));

  const usuario = auth.currentUser;

  if (!usuario) {
    return;
  }

  await setDoc(
    doc(db, "usuarios", usuario.uid),
    {
      caminhao: dados,
    },
    { merge: true },
  );
}

export async function obterCaminhao() {
  const dados = await AsyncStorage.getItem(CAMINHAO_KEY);

  if (dados) {
    return JSON.parse(dados);
  }

  const usuario = auth.currentUser;

  if (!usuario) {
    return null;
  }

  try {
    const documento = await getDoc(doc(db, "usuarios", usuario.uid));

    if (!documento.exists()) {
      return null;
    }

    const dadosFirebase = documento.data()?.caminhao;

    if (!dadosFirebase) {
      return null;
    }

    await AsyncStorage.setItem(CAMINHAO_KEY, JSON.stringify(dadosFirebase));

    return dadosFirebase;
  } catch (error) {
    console.error("❌ Erro ao recuperar caminhão do Firebase:", error);

    return null;
  }
}

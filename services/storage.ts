import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "@/services/firebase";

const MOTORISTA_KEY_BASE = "@valida_pipa:motorista";
const CAMINHAO_KEY_BASE = "@valida_pipa:caminhao";

function getMotoristaKey(uid: string) {
  return `${MOTORISTA_KEY_BASE}:${uid}`;
}

function getCaminhaoKey(uid: string) {
  return `${CAMINHAO_KEY_BASE}:${uid}`;
}

// ========================
// MOTORISTA
// ========================

export async function salvarMotorista(dados: any) {
  const usuario = auth.currentUser;

  if (!usuario) {
    return;
  }

  const motoristaKey = getMotoristaKey(usuario.uid);

  await AsyncStorage.setItem(motoristaKey, JSON.stringify(dados));

  await setDoc(
    doc(db, "usuarios", usuario.uid),
    {
      motorista: dados,
    },
    { merge: true },
  );
}

export async function obterMotorista() {
  const usuario = auth.currentUser;

  if (!usuario) {
    return null;
  }

  const motoristaKey = getMotoristaKey(usuario.uid);

  const dados = await AsyncStorage.getItem(motoristaKey);

  if (dados) {
    return JSON.parse(dados);
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

    await AsyncStorage.setItem(motoristaKey, JSON.stringify(dadosFirebase));

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
  const usuario = auth.currentUser;

  if (!usuario) {
    return;
  }

  const caminhaoKey = getCaminhaoKey(usuario.uid);

  await AsyncStorage.setItem(caminhaoKey, JSON.stringify(dados));

  await setDoc(
    doc(db, "usuarios", usuario.uid),
    {
      caminhao: dados,
    },
    { merge: true },
  );
}

export async function obterCaminhao() {
  const usuario = auth.currentUser;

  if (!usuario) {
    return null;
  }

  const caminhaoKey = getCaminhaoKey(usuario.uid);

  const dados = await AsyncStorage.getItem(caminhaoKey);

  if (dados) {
    return JSON.parse(dados);
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

    await AsyncStorage.setItem(caminhaoKey, JSON.stringify(dadosFirebase));

    return dadosFirebase;
  } catch (error) {
    console.error("❌ Erro ao recuperar caminhão do Firebase:", error);

    return null;
  }
}

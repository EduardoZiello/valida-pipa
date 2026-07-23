import AsyncStorage from "@react-native-async-storage/async-storage";

const MOTORISTA_KEY = "@valida_pipa:motorista";
const CAMINHAO_KEY = "@valida_pipa:caminhao";

// ========================
// MOTORISTA
// ========================

export async function salvarMotorista(dados: any) {
  await AsyncStorage.setItem(MOTORISTA_KEY, JSON.stringify(dados));
}

export async function obterMotorista() {
  const dados = await AsyncStorage.getItem(MOTORISTA_KEY);

  if (!dados) return null;

  return JSON.parse(dados);
}

// ========================
// CAMINHÃO
// ========================

export async function salvarCaminhao(dados: any) {
  await AsyncStorage.setItem(CAMINHAO_KEY, JSON.stringify(dados));
}

export async function obterCaminhao() {
  const dados = await AsyncStorage.getItem(CAMINHAO_KEY);

  if (!dados) return null;

  return JSON.parse(dados);
}

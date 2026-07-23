import * as ImagePicker from "expo-image-picker";

export async function abrirCamera() {
  const permissao = await ImagePicker.requestCameraPermissionsAsync();

  if (!permissao.granted) {
    throw new Error("Permissão da câmera negada.");
  }

  const resultado = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  });

  if (resultado.canceled) {
    return null;
  }

  return resultado.assets[0].uri;
}

export async function abrirGaleria() {
  const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissao.granted) {
    throw new Error("Permissão da galeria negada.");
  }

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  });

  if (resultado.canceled) {
    return null;
  }

  return resultado.assets[0].uri;
}

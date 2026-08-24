import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";

export interface DadosEvidencia {
  foto: string;
  dataHora: string;
  latitude: number;
  longitude: number;
  motorista: string;
  placa: string;
  rotaId: string;
  tipo: "INICIO" | "FINAL" | "OCORRENCIA";
}

export interface EvidenciaGeradorRef {
  gerar: (dados: DadosEvidencia) => Promise<string>;
}

const EvidenciaGerador = forwardRef<EvidenciaGeradorRef>((_, ref) => {
  const viewRef = useRef<View>(null);

  const [dados, setDados] = useState<DadosEvidencia | null>(null);

  useImperativeHandle(ref, () => ({
    async gerar(novosDados) {
      setDados(novosDados);

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!viewRef.current) {
        throw new Error("Não foi possível preparar a evidência.");
      }

      const uri = await captureRef(viewRef, {
        format: "jpg",
        quality: 0.9,
      });

      return uri;
    },
  }));

  if (!dados) {
    return null;
  }

  return (
    <View ref={viewRef} collapsable={false} style={styles.container}>
      <Image
        source={{ uri: dados.foto }}
        style={styles.foto}
        resizeMode="cover"
      />

      <View style={styles.informacoes}>
        <Text style={styles.titulo}>VALIDA PIPA</Text>

        <Text style={styles.texto}>Motorista: {dados.motorista}</Text>

        <Text style={styles.texto}>Placa: {dados.placa}</Text>

        <Text style={styles.texto}>Data/Hora: {dados.dataHora}</Text>

        <Text style={styles.texto}>
          GPS: {dados.latitude.toFixed(6)}, {dados.longitude.toFixed(6)}
        </Text>

        <Text style={styles.texto}>Rota: {dados.rotaId}</Text>

        <Text style={styles.tipo}>{dados.tipo}</Text>
      </View>
    </View>
  );
});

EvidenciaGerador.displayName = "EvidenciaGerador";

export default EvidenciaGerador;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: -10000,
    top: 0,
    width: 400,
    backgroundColor: "#000",
  },

  foto: {
    width: 400,
    height: 500,
  },

  informacoes: {
    position: "absolute",
    left: 15,
    right: 15,
    bottom: 15,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 10,
    padding: 12,
  },

  titulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },

  texto: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 2,
  },

  tipo: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },
});

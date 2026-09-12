import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { db } from "@/services/firebase";

interface ValidacaoPublica {
  token: string;
  rotaId: string;
  motorista: string;
  placa: string;
  modelo: string;
  dataHoraInicio: string;
  dataHoraFim: string | null;
  distanciaPercorridaKm: number;
  quantidadePontosGPS: number;
  quantidadeOcorrencias: number;
  status: string;
  criadoEm: string;
}

export default function ValidarRotaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [validacao, setValidacao] = useState<ValidacaoPublica | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function buscarValidacao() {
      if (!id) {
        setErro(true);
        setCarregando(false);
        return;
      }

      try {
        const referencia = doc(db, "validacoesPublicas", id);
        const resultado = await getDoc(referencia);

        if (!resultado.exists()) {
          setErro(true);
          return;
        }

        setValidacao(resultado.data() as ValidacaoPublica);
      } catch (error) {
        console.error("Erro ao consultar validação pública:", error);

        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    buscarValidacao();
  }, [id]);

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" />
        <Text style={styles.textoCarregando}>Verificando comprovante...</Text>
      </View>
    );
  }

  if (erro || !validacao) {
    return (
      <View style={styles.centralizado}>
        <View style={styles.iconeErro}>
          <Text style={styles.iconeErroTexto}>!</Text>
        </View>

        <Text style={styles.titulo}>Comprovante não encontrado</Text>

        <Text style={styles.descricao}>
          Não foi possível localizar uma validação pública para este
          comprovante.
        </Text>
      </View>
    );
  }

  const comprovanteValido = validacao.status === "FINALIZADA";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.nomeApp}>VALIDA PIPA</Text>

        <Text style={styles.subtitulo}>Validação pública de comprovante</Text>
      </View>

      <View
        style={[
          styles.cardStatus,
          comprovanteValido ? styles.cardValido : styles.cardInvalido,
        ]}
      >
        <View
          style={[
            styles.iconeStatus,
            comprovanteValido ? styles.iconeValido : styles.iconeInvalido,
          ]}
        >
          <Text style={styles.iconeStatusTexto}>
            {comprovanteValido ? "✓" : "!"}
          </Text>
        </View>

        <Text style={styles.statusTitulo}>
          {comprovanteValido ? "COMPROVANTE VÁLIDO" : "COMPROVANTE INVÁLIDO"}
        </Text>

        <Text style={styles.statusDescricao}>
          {comprovanteValido
            ? "Este comprovante corresponde a um registro oficial de rota armazenado no sistema Valida Pipa."
            : "O registro encontrado não está marcado como finalizado."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Dados da Rota</Text>

        <Item titulo="Identificação" valor={validacao.rotaId} />

        <Item titulo="Motorista" valor={validacao.motorista} />

        <Item titulo="Placa" valor={validacao.placa} />

        <Item titulo="Modelo" valor={validacao.modelo} />

        <Item titulo="Status" valor={validacao.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Dados da Execução</Text>

        <Item titulo="Início" valor={validacao.dataHoraInicio} />

        <Item
          titulo="Finalização"
          valor={validacao.dataHoraFim ?? "Não informado"}
        />

        <Item
          titulo="Distância percorrida"
          valor={`${validacao.distanciaPercorridaKm.toFixed(2)} km`}
        />

        <Item
          titulo="Pontos GPS registrados"
          valor={String(validacao.quantidadePontosGPS)}
        />

        <Item
          titulo="Ocorrências registradas"
          valor={String(validacao.quantidadeOcorrencias)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Código de Validação</Text>

        <Text style={styles.token}>{validacao.token}</Text>

        <Text style={styles.aviso}>
          Este código identifica exclusivamente o registro público deste
          comprovante.
        </Text>
      </View>

      <Text style={styles.rodape}>
        Valida Pipa • Sistema de comprovação de rotas
      </Text>
    </ScrollView>
  );
}

function Item({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemTitulo}>{titulo}</Text>

      <Text style={styles.itemValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },

  centralizado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F5F7FA",
  },

  textoCarregando: {
    marginTop: 14,
    fontSize: 16,
    color: "#555",
  },

  cabecalho: {
    alignItems: "center",
    marginBottom: 20,
  },

  nomeApp: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1261A0",
    letterSpacing: 1,
  },

  subtitulo: {
    marginTop: 5,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },

  cardStatus: {
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },

  cardValido: {
    backgroundColor: "#EAF8EF",
    borderColor: "#8AD0A0",
  },

  cardInvalido: {
    backgroundColor: "#FFF0F0",
    borderColor: "#E2A0A0",
  },

  iconeStatus: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  iconeValido: {
    backgroundColor: "#27AE60",
  },

  iconeInvalido: {
    backgroundColor: "#D64545",
  },

  iconeStatusTexto: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
  },

  statusTitulo: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
  },

  statusDescricao: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#555",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 14,
  },

  item: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  itemTitulo: {
    fontSize: 12,
    color: "#777",
    marginBottom: 3,
  },

  itemValor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  token: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1261A0",
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
  },

  aviso: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#777",
  },

  iconeErro: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D64545",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  iconeErroTexto: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
  },

  titulo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
    textAlign: "center",
  },

  descricao: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#666",
    textAlign: "center",
  },

  rodape: {
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#888",
  },
});

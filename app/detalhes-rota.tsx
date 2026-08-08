import { obterRotas, Rota } from "@/services/rotas";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetalhesRotaScreen() {
  const { id } = useLocalSearchParams();
  const [rota, setRota] = useState<Rota | null>(null);

  useEffect(() => {
    carregarRota();
  }, []);

  async function carregarRota() {
    const lista = await obterRotas();

    const rotaEncontrada = lista.find((r) => r.id === id);

    if (rotaEncontrada) {
      setRota(rotaEncontrada);
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Detalhes da Rota</Text>

        {rota && (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>📋 Dados da Rota</Text>

            <View style={styles.linha}>
              <Text style={styles.label}>👤 Motorista</Text>
              <Text style={styles.valor}>{rota.motorista}</Text>
            </View>

            <View style={styles.linha}>
              <Text style={styles.label}>🚛 Placa</Text>
              <Text style={styles.valor}>{rota.placa}</Text>
            </View>

            <View style={styles.linha}>
              <Text style={styles.label}>🆔 ID</Text>
              <Text style={styles.valor}>VP-{rota.id.slice(-6)}</Text>
            </View>

            <View style={styles.linha}>
              <Text style={styles.label}>📅 Início</Text>
              <Text style={styles.valor}>{rota.dataHoraInicio}</Text>
            </View>

            <View style={styles.linha}>
              <Text style={styles.label}>✅ Status</Text>
              <Text
                style={{
                  color: rota.status === "FINALIZADA" ? "#22C55E" : "#1976D2",
                  fontWeight: "700",
                }}
              >
                {rota.status}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Foto Inicial</Text>

          {rota?.fotoInicio ? (
            <Image source={{ uri: rota.fotoInicio }} style={styles.foto} />
          ) : (
            <Text style={styles.semFoto}>Nenhuma foto encontrada.</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Localização Inicial</Text>

          <View style={styles.infoLinha}>
            <Text style={styles.infoLabel}>Latitude</Text>

            <Text style={styles.infoValor}>
              {rota?.latitudeInicio?.toFixed(6)}
            </Text>
          </View>

          <View style={styles.infoLinha}>
            <Text style={styles.infoLabel}>Longitude</Text>

            <Text style={styles.infoValor}>
              {rota?.longitudeInicio?.toFixed(6)}
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Foto Final</Text>

          {rota?.fotoFim ? (
            <Image source={{ uri: rota.fotoFim }} style={styles.foto} />
          ) : (
            <Text style={styles.semFoto}>Rota ainda não foi finalizada.</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Localização Final</Text>

          <View style={styles.infoLinha}>
            <Text style={styles.infoLabel}>Latitude</Text>

            <Text style={styles.infoValor}>
              {rota?.latitudeFim?.toFixed(6)}
            </Text>
          </View>

          <View style={styles.infoLinha}>
            <Text style={styles.infoLabel}>Longitude</Text>

            <Text style={styles.infoValor}>
              {rota?.longitudeFim?.toFixed(6)}
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ Ocorrências</Text>

          {rota?.ocorrencias?.length ? (
            rota.ocorrencias.map((ocorrencia: any, index: number) => (
              <View key={ocorrencia.id} style={styles.ocorrenciaItem}>
                <Text style={styles.ocorrenciaTitulo}>
                  Ocorrência #{index + 1}
                </Text>

                <Image source={{ uri: ocorrencia.foto }} style={styles.foto} />

                <Text style={styles.infoLabel}>Observação</Text>
                <Text style={styles.infoValor}>
                  {ocorrencia.observacao || "Sem observação"}
                </Text>

                <Text style={styles.infoLabel}>Data</Text>
                <Text style={styles.infoValor}>{ocorrencia.dataHora}</Text>

                <Text style={styles.infoLabel}>Latitude</Text>
                <Text style={styles.infoValor}>
                  {ocorrencia.latitude?.toFixed(6)}
                </Text>

                <Text style={styles.infoLabel}>Longitude</Text>
                <Text style={styles.infoValor}>
                  {ocorrencia.longitude?.toFixed(6)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.semFoto}>Nenhuma ocorrência registrada.</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🗺️ Percurso Registrado</Text>

          <Text style={styles.percursoResumo}>
            {rota?.trajeto?.length ?? 0} ponto(s) registrados
          </Text>

          {rota?.trajeto?.length ? (
            rota.trajeto.map((ponto, index) => (
              <View
                key={`${ponto.dataHora}-${index}`}
                style={styles.pontoTrajeto}
              >
                <Text style={styles.pontoTitulo}>Ponto #{index + 1}</Text>

                <Text style={styles.infoLabel}>Latitude</Text>
                <Text style={styles.infoValor}>
                  {ponto.latitude.toFixed(6)}
                </Text>

                <Text style={styles.infoLabel}>Longitude</Text>
                <Text style={styles.infoValor}>
                  {ponto.longitude.toFixed(6)}
                </Text>

                <Text style={styles.infoLabel}>Data/Hora</Text>
                <Text style={styles.infoValor}>{ponto.dataHora}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.semFoto}>
              Nenhum ponto de percurso registrado.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#163A5F",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
    elevation: 3,
  },

  cardTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#163A5F",
    marginBottom: 18,
  },

  linha: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
  },

  valor: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    color: "#163A5F",
  },

  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#6B7280",
  },
  foto: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    marginTop: 15,
  },

  semFoto: {
    marginTop: 15,
    textAlign: "center",
    color: "#6B7280",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#163A5F",
  },
  infoLinha: {
    marginTop: 16,
  },

  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
  },

  infoValor: {
    fontSize: 20,
    fontWeight: "700",
    color: "#163A5F",
    marginTop: 4,
  },
  ocorrenciaItem: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  ocorrenciaTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#163A5F",
    marginBottom: 12,
  },
  percursoResumo: {
    marginTop: 4,
    fontSize: 15,
    color: "#6B7280",
  },

  pontoTrajeto: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  pontoTitulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#163A5F",
    marginBottom: 12,
  },
});

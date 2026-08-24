import { obterRotas, Rota } from "@/services/rotas";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetalhesRotaScreen() {
  const { id } = useLocalSearchParams();

  const [rota, setRota] = useState<Rota | null>(null);
  const [carregando, setCarregando] = useState(true);

  const mapaRef = useRef<MapView | null>(null);

  useEffect(() => {
    carregarRota();
  }, []);

  async function carregarRota() {
    try {
      setCarregando(true);

      const lista = await obterRotas();

      const rotaEncontrada = lista.find((r) => r.id === id);

      if (rotaEncontrada) {
        setRota(rotaEncontrada);
      }
    } catch (error) {
      console.error("DETALHES DA ROTA - ERRO:", error);
    } finally {
      setCarregando(false);
    }
  }

  const coordenadasTrajeto = useMemo(() => {
    return (
      rota?.trajeto?.map((ponto) => ({
        latitude: ponto.latitude,
        longitude: ponto.longitude,
      })) ?? []
    );
  }, [rota?.trajeto]);

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />

          <Text style={styles.loadingTitle}>
            Carregando detalhes da rota...
          </Text>

          <Text style={styles.loadingSubtitle}>
            Preparando o percurso registrado.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!rota) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>Rota não encontrada</Text>

          <Text style={styles.loadingSubtitle}>
            Não foi possível localizar os dados desta rota.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Detalhes da Rota</Text>

        {/* DADOS DA ROTA */}
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

        {/* FOTO INICIAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Foto Inicial</Text>

          {rota.fotoInicio ? (
            <Image source={{ uri: rota.fotoInicio }} style={styles.foto} />
          ) : (
            <Text style={styles.semFoto}>Nenhuma foto encontrada.</Text>
          )}
        </View>

        {/* LOCALIZAÇÃO INICIAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Localização Inicial</Text>

          <View style={styles.infoLinha}>
            <Text style={styles.infoLabel}>Latitude</Text>

            <Text style={styles.infoValor}>
              {rota.latitudeInicio.toFixed(6)}
            </Text>
          </View>

          <View style={styles.infoLinha}>
            <Text style={styles.infoLabel}>Longitude</Text>

            <Text style={styles.infoValor}>
              {rota.longitudeInicio.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* FOTO FINAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Foto Final</Text>

          {rota.fotoFim ? (
            <Image source={{ uri: rota.fotoFim }} style={styles.foto} />
          ) : (
            <Text style={styles.semFoto}>Rota ainda não foi finalizada.</Text>
          )}
        </View>

        {/* LOCALIZAÇÃO FINAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Localização Final</Text>

          <View style={styles.infoLinha}>
            <Text style={styles.infoLabel}>Latitude</Text>

            <Text style={styles.infoValor}>
              {rota.latitudeFim !== undefined
                ? rota.latitudeFim.toFixed(6)
                : "Não disponível"}
            </Text>
          </View>

          <View style={styles.infoLinha}>
            <Text style={styles.infoLabel}>Longitude</Text>

            <Text style={styles.infoValor}>
              {rota.longitudeFim !== undefined
                ? rota.longitudeFim.toFixed(6)
                : "Não disponível"}
            </Text>
          </View>
        </View>

        {/* OCORRÊNCIAS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ Ocorrências</Text>

          {rota.ocorrencias?.length ? (
            rota.ocorrencias.map((ocorrencia, index) => (
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
                  {ocorrencia.latitude.toFixed(6)}
                </Text>

                <Text style={styles.infoLabel}>Longitude</Text>

                <Text style={styles.infoValor}>
                  {ocorrencia.longitude.toFixed(6)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.semFoto}>Nenhuma ocorrência registrada.</Text>
          )}
        </View>

        {/* PERCURSO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🗺️ Percurso Registrado</Text>

          <View style={styles.percursoResumoContainer}>
            <View style={styles.percursoResumoItem}>
              <Text style={styles.percursoNumero}>
                {rota.distanciaPercorridaKm !== undefined
                  ? `${rota.distanciaPercorridaKm.toFixed(2)} km`
                  : "--"}
              </Text>

              <Text style={styles.percursoLabel}>distância percorrida</Text>
            </View>

            <View style={styles.percursoResumoItem}>
              <Text style={styles.percursoNumero}>
                {rota.trajeto?.length ?? 0}
              </Text>

              <Text style={styles.percursoLabel}>pontos capturados</Text>
            </View>

            <View style={styles.statusPercurso}>
              <View style={styles.statusDot} />

              <Text style={styles.statusPercursoTexto}>
                Percurso registrado
              </Text>
            </View>
          </View>

          {coordenadasTrajeto.length > 0 ? (
            <MapView
              ref={mapaRef}
              style={styles.mapa}
              onMapReady={() => {
                if (coordenadasTrajeto.length > 0) {
                  mapaRef.current?.fitToCoordinates(coordenadasTrajeto, {
                    edgePadding: {
                      top: 40,
                      right: 40,
                      bottom: 40,
                      left: 40,
                    },
                    animated: false,
                  });
                }
              }}
            >
              <Polyline coordinates={coordenadasTrajeto} strokeWidth={5} />

              {/* INÍCIO */}
              <Marker
                coordinate={{
                  latitude: rota.latitudeInicio,
                  longitude: rota.longitudeInicio,
                }}
                title="Início da rota"
                description={rota.dataHoraInicio}
                pinColor="#22C55E"
              />

              {/* FINAL */}
              {rota.latitudeFim !== undefined &&
                rota.longitudeFim !== undefined && (
                  <Marker
                    coordinate={{
                      latitude: rota.latitudeFim,
                      longitude: rota.longitudeFim,
                    }}
                    title="Final da rota"
                    description={rota.dataHoraFim}
                    pinColor="#EF4444"
                  />
                )}

              {/* OCORRÊNCIAS */}
              {rota.ocorrencias?.map((ocorrencia, index) => (
                <Marker
                  key={ocorrencia.id}
                  coordinate={{
                    latitude: ocorrencia.latitude,
                    longitude: ocorrencia.longitude,
                  }}
                  title={`Ocorrência #${index + 1}`}
                  description={ocorrencia.observacao || "Sem observação"}
                  pinColor="#F59E0B"
                />
              ))}
            </MapView>
          ) : (
            <View style={styles.semPercurso}>
              <Text style={styles.semPercursoTexto}>
                Nenhum ponto de percurso registrado.
              </Text>
            </View>
          )}

          <Text style={styles.infoMapa}>
            O percurso acima representa os pontos de localização registrados
            durante a rota.
          </Text>
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
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 19,
    fontWeight: "700",
    color: "#163A5F",
    textAlign: "center",
  },

  loadingSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
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

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#163A5F",
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

  infoLinha: {
    marginTop: 16,
  },

  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
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

  mapa: {
    width: "100%",
    height: 280,
    borderRadius: 14,
    marginTop: 18,
    overflow: "hidden",
  },

  percursoResumoContainer: {
    marginTop: 18,
    padding: 16,
    backgroundColor: "#F5FAFF",
    borderRadius: 14,
  },

  percursoResumoItem: {
    alignItems: "center",
  },

  percursoNumero: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1976D2",
  },

  percursoLabel: {
    marginTop: 2,
    fontSize: 14,
    color: "#6B7280",
  },

  statusPercurso: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    marginRight: 7,
  },

  statusPercursoTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },

  semPercurso: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 14,
    marginTop: 18,
  },

  semPercursoTexto: {
    color: "#6B7280",
    fontSize: 15,
  },

  infoMapa: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
  },
});

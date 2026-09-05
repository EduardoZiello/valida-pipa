import {
  compartilharComprovacaoRota,
  gerarComprovacaoRota,
} from "@/services/comprovacaoRota";
import { obterRotas, Rota } from "@/services/rotas";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetalhesRotaScreen() {
  const { id } = useLocalSearchParams();

  const [rota, setRota] = useState<Rota | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [gerandoComprovante, setGerandoComprovante] = useState(false);

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

  async function gerarComprovante() {
    if (!rota) {
      return;
    }

    if (rota.status !== "FINALIZADA") {
      Alert.alert(
        "Rota não finalizada",
        "O comprovante somente pode ser gerado após a finalização da rota.",
      );
      return;
    }

    try {
      setGerandoComprovante(true);

      let mapaUri: string | undefined;

      if (mapaRef.current) {
        try {
          mapaUri = await captureRef(mapaRef as any, {
            format: "jpg",
            quality: 0.85,
            result: "tmpfile",
          });

          console.log("COMPROVANTE - MAPA CAPTURADO:", mapaUri);
        } catch (error) {
          console.error("COMPROVANTE - ERRO AO CAPTURAR MAPA:", error);
        }
      }

      const arquivoUri = await gerarComprovacaoRota(rota, mapaUri);

      await compartilharComprovacaoRota(arquivoUri);
    } catch (error) {
      console.error("COMPROVANTE DA ROTA - ERRO:", error);

      Alert.alert(
        "Erro",
        "Não foi possível gerar ou compartilhar o comprovante da rota.",
      );
    } finally {
      setGerandoComprovante(false);
    }
  }

  function calcularDistanciaMetros(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ): number {
    const raioTerraMetros = 6371000;

    const diferencaLatitude = ((latitude2 - latitude1) * Math.PI) / 180;

    const diferencaLongitude = ((longitude2 - longitude1) * Math.PI) / 180;

    const latitude1Rad = (latitude1 * Math.PI) / 180;
    const latitude2Rad = (latitude2 * Math.PI) / 180;

    const a =
      Math.sin(diferencaLatitude / 2) ** 2 +
      Math.cos(latitude1Rad) *
        Math.cos(latitude2Rad) *
        Math.sin(diferencaLongitude / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return raioTerraMetros * c;
  }
  function converterDataParaTimestamp(data: string): number {
    const partes = data.split(", ");

    if (partes.length !== 2) {
      return NaN;
    }

    const [dataParte, horaParte] = partes;

    const [dia, mes, ano] = dataParte.split("/").map(Number);

    const [hora, minuto, segundo] = horaParte.split(":").map(Number);

    if (
      !dia ||
      !mes ||
      !ano ||
      Number.isNaN(hora) ||
      Number.isNaN(minuto) ||
      Number.isNaN(segundo)
    ) {
      return NaN;
    }

    return new Date(ano, mes - 1, dia, hora, minuto, segundo).getTime();
  }

  function calcularDuracaoRota(
    dataHoraInicio: string,
    dataHoraFim?: string,
  ): string {
    if (!dataHoraFim) {
      return "--";
    }

    const inicio = converterDataParaTimestamp(dataHoraInicio);
    const fim = converterDataParaTimestamp(dataHoraFim);

    if (Number.isNaN(inicio) || Number.isNaN(fim) || fim < inicio) {
      return "--";
    }

    const duracaoMinutos = Math.floor((fim - inicio) / 60000);

    const horas = Math.floor(duracaoMinutos / 60);
    const minutos = duracaoMinutos % 60;

    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }

    return `${minutos}min`;
  }

  const coordenadasTrajeto = useMemo(() => {
    if (!rota) {
      return [];
    }

    const pontos = rota.trajeto ?? [];

    const resultado = [
      {
        latitude: rota.latitudeInicio,
        longitude: rota.longitudeInicio,
      },
    ];

    let ultimoPonto = resultado[0];

    for (const ponto of pontos) {
      const distancia = calcularDistanciaMetros(
        ultimoPonto.latitude,
        ultimoPonto.longitude,
        ponto.latitude,
        ponto.longitude,
      );

      if (distancia >= 10) {
        const novoPonto = {
          latitude: ponto.latitude,
          longitude: ponto.longitude,
        };

        resultado.push(novoPonto);
        ultimoPonto = novoPonto;
      }
    }

    if (rota.latitudeFim !== undefined && rota.longitudeFim !== undefined) {
      const distanciaFinal = calcularDistanciaMetros(
        ultimoPonto.latitude,
        ultimoPonto.longitude,
        rota.latitudeFim,
        rota.longitudeFim,
      );

      if (distanciaFinal >= 25) {
        resultado.push({
          latitude: rota.latitudeFim,
          longitude: rota.longitudeFim,
        });
      }
    }

    return resultado;
  }, [rota]);

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
          <Text style={styles.cardTitulo}>📋 Identificação da Rota</Text>

          <View style={styles.linha}>
            <Text style={styles.label}>👤 Motorista responsável pela Rota</Text>
            <Text style={styles.valor}>{rota.motorista}</Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>🚛 Placa</Text>
            <Text style={styles.valor}>{rota.placa}</Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>🆔 ID</Text>
            <Text style={styles.valor}>{rota.id}</Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>📅 Início</Text>
            <Text style={styles.valor}>{rota.dataHoraInicio}</Text>
          </View>
          {rota.dataHoraFim && (
            <View style={styles.linha}>
              <Text style={styles.label}>🏁 Finalização</Text>
              <Text style={styles.valor}>{rota.dataHoraFim}</Text>
            </View>
          )}

          <View style={styles.linha}>
            <Text style={styles.label}>✅ Status</Text>

            <View
              style={[
                styles.statusBadge,
                rota.status === "FINALIZADA"
                  ? styles.statusFinalizada
                  : styles.statusEmAndamento,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeTexto,
                  rota.status === "FINALIZADA"
                    ? styles.statusFinalizadaTexto
                    : styles.statusEmAndamentoTexto,
                ]}
              >
                {rota.status === "FINALIZADA" ? "FINALIZADA" : "EM ANDAMENTO"}
              </Text>
            </View>
          </View>
        </View>
        {/* RESUMO DA ROTA */}
        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitulo}>📊 Resumo da Rota</Text>

          <View style={styles.resumoLinha}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>
                {rota.distanciaPercorridaKm !== undefined
                  ? rota.distanciaPercorridaKm.toFixed(2)
                  : "--"}
              </Text>

              <Text style={styles.resumoLabel}>km percorridos</Text>
            </View>

            <View style={styles.resumoDivisor} />

            <View style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>
                {rota.trajeto?.length ?? 0}
              </Text>

              <Text style={styles.resumoLabel}>pontos GPS</Text>
            </View>
          </View>

          <View style={styles.resumoLinha}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>
                {rota.ocorrencias?.length ?? 0}
              </Text>

              <Text style={styles.resumoLabel}>ocorrências</Text>
            </View>

            <View style={styles.resumoDivisor} />

            <View style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>
                {calcularDuracaoRota(rota.dataHoraInicio, rota.dataHoraFim)}
              </Text>

              <Text style={styles.resumoLabel}>duração da rota</Text>
            </View>
          </View>
        </View>

        {/* COMPROVANTE */}
        {rota.status === "FINALIZADA" && (
          <View style={styles.comprovanteCard}>
            <View style={styles.comprovanteStatus}>
              <View style={styles.comprovanteStatusDot} />

              <Text style={styles.comprovanteStatusTexto}>
                ROTA FINALIZADA • COMPROVANTE DISPONÍVEL
              </Text>
            </View>
            <Text style={styles.comprovanteTitulo}>📄 Comprovante da Rota</Text>

            <Text style={styles.comprovanteDescricao}>
              Esta rota foi finalizada e possui um documento de comprovação com
              os registros de localização, percurso, fotos, ocorrências e
              informações de início e finalização.
            </Text>

            <Pressable
              style={[
                styles.botaoComprovante,
                gerandoComprovante && styles.botaoDesabilitado,
              ]}
              onPress={gerarComprovante}
              disabled={gerandoComprovante}
            >
              {gerandoComprovante ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />

                  <Text style={styles.botaoComprovanteTexto}>
                    Gerando comprovante...
                  </Text>
                </>
              ) : (
                <Text style={styles.botaoComprovanteTexto}>
                  📄 Gerar comprovante da rota
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* FOTO INICIAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Evidência Inicial</Text>

          {rota.fotoInicio ? (
            <Image source={{ uri: rota.fotoInicio }} style={styles.foto} />
          ) : (
            <Text style={styles.semFoto}>Nenhuma foto encontrada.</Text>
          )}
        </View>

        {/* LOCALIZAÇÃO INICIAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 GPS Inicial Registrado</Text>

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
          <Text style={styles.cardTitle}>📷 Evidência Final</Text>

          {rota.fotoFim ? (
            <Image source={{ uri: rota.fotoFim }} style={styles.foto} />
          ) : (
            <Text style={styles.semFoto}>Rota ainda não foi finalizada.</Text>
          )}
        </View>

        {/* LOCALIZAÇÃO FINAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 GPS Final Registrado</Text>

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
          <Text style={styles.cardTitle}>⚠️ Ocorrências Registradas</Text>

          {rota.ocorrencias?.length ? (
            rota.ocorrencias.map((ocorrencia, index) => (
              <View key={ocorrencia.id} style={styles.ocorrenciaItem}>
                <Text style={styles.ocorrenciaTitulo}>
                  Ocorrência #{index + 1} — Evidência registrada
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
          <Text style={styles.cardTitle}>📊 Resultado da Execução</Text>

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
            O mapa apresenta o percurso registrado pelo aplicativo durante a
            execução da rota, incluindo os pontos de localização capturados.
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
    fontSize: 21,
    fontWeight: "800",
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

  comprovanteCard: {
    backgroundColor: "#EAF3FF",
    borderRadius: 18,
    padding: 20,
    marginTop: 24,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  comprovanteTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#163A5F",
  },

  comprovanteDescricao: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#526579",
  },

  botaoComprovante: {
    minHeight: 56,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: "#1976D2",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    elevation: 4,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoComprovanteTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  foto: {
    width: "100%",
    height: 220,
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
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusFinalizada: {
    backgroundColor: "#DCFCE7",
  },

  statusEmAndamento: {
    backgroundColor: "#DBEAFE",
  },

  statusBadgeTexto: {
    fontSize: 13,
    fontWeight: "800",
  },

  statusFinalizadaTexto: {
    color: "#15803D",
  },

  statusEmAndamentoTexto: {
    color: "#1D4ED8",
  },
  resumoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginTop: 0,
    marginBottom: 0,
    elevation: 3,
  },

  resumoTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#163A5F",
    marginBottom: 18,
  },

  resumoLinha: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  resumoItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  resumoNumero: {
    fontSize: 25,
    fontWeight: "800",
    color: "#163A5F",
  },

  resumoLabel: {
    marginTop: 5,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },

  resumoDivisor: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  comprovanteStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  comprovanteStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 8,
  },

  comprovanteStatusTexto: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#15803D",
  },
});

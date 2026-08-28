import {
  agendarAlertaRota,
  cancelarAlertasRota,
} from "@/services/notificacoes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_ROTAS = "@valida_pipa_rotas";
export interface Ocorrencia {
  id: string;
  dataHora: string;
  latitude: number;
  longitude: number;
  foto: string;
  observacao: string;
}
export interface PontoTrajeto {
  latitude: number;
  longitude: number;
  dataHora: string;
  accuracy?: number | null;
}
export interface Rota {
  id: string;

  motorista: string;

  placa: string;
  modelo: string;

  // Início
  dataHoraInicio: string;
  latitudeInicio: number;
  longitudeInicio: number;
  fotoInicio: string;

  // Final (opcionais até a rota ser encerrada)
  dataHoraFim?: string;
  latitudeFim?: number;
  longitudeFim?: number;
  fotoFim?: string;
  ocorrencias?: Ocorrencia[];

  trajeto?: PontoTrajeto[];
  distanciaPercorridaKm?: number;

  alertasNotificacao?: string[];

  status: "EM_ANDAMENTO" | "FINALIZADA";
}

export async function obterRotas(): Promise<Rota[]> {
  const json = await AsyncStorage.getItem(CHAVE_ROTAS);

  if (!json) {
    return [];
  }

  return JSON.parse(json);
}
function calcularDistanciaEntrePontos(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const raioTerraKm = 6371;

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

  return raioTerraKm * c;
}
function calcularDistanciaPercorrida(
  rota: Rota,
  latitudeFinal: number,
  longitudeFinal: number,
): number {
  const pontos = rota.trajeto ?? [];

  let distanciaTotalKm = 0;

  let latitudeAnterior = rota.latitudeInicio;
  let longitudeAnterior = rota.longitudeInicio;

  for (const ponto of pontos) {
    const distancia = calcularDistanciaEntrePontos(
      latitudeAnterior,
      longitudeAnterior,
      ponto.latitude,
      ponto.longitude,
    );

    // Ignora pequenas oscilações do GPS
    // sem deixar de registrar o ponto no trajeto.
    if (distancia >= 0.025) {
      distanciaTotalKm += distancia;
      latitudeAnterior = ponto.latitude;
      longitudeAnterior = ponto.longitude;
    }
  }

  const distanciaFinal = calcularDistanciaEntrePontos(
    latitudeAnterior,
    longitudeAnterior,
    latitudeFinal,
    longitudeFinal,
  );

  if (distanciaFinal >= 0.025) {
    distanciaTotalKm += distanciaFinal;
  }

  return Number(distanciaTotalKm.toFixed(2));
}
export async function finalizarRota(
  id: string,
  dados: {
    dataHoraFim: string;
    latitudeFim: number;
    longitudeFim: number;
    fotoFim: string;
  },
) {
  const rotas = await obterRotas();
  const rota = rotas.find((item) => item.id === id);

  if (rota?.alertasNotificacao) {
    await cancelarAlertasRota(rota.alertasNotificacao);
  }

  const novasRotas = rotas.map((rota) => {
    if (rota.id !== id) {
      return rota;
    }

    const distanciaPercorridaKm = calcularDistanciaPercorrida(
      rota,
      dados.latitudeFim,
      dados.longitudeFim,
    );

    return {
      ...rota,
      ...dados,
      distanciaPercorridaKm,
      status: "FINALIZADA" as const,
    };
  });

  await AsyncStorage.setItem(CHAVE_ROTAS, JSON.stringify(novasRotas));
}

export async function salvarRota(rota: Rota) {
  const rotas = await obterRotas();

  rota.ocorrencias = [];
  rota.trajeto = [];

  rotas.unshift(rota);

  await AsyncStorage.setItem(CHAVE_ROTAS, JSON.stringify(rotas));

  const alertas = await agendarAlertaRota(rota.id, rota.dataHoraInicio);

  if (alertas) {
    rota.alertasNotificacao = [alertas.primeiroAlerta, alertas.segundoAlerta];

    const rotasAtualizadas = rotas.map((item) =>
      item.id === rota.id
        ? {
            ...item,
            alertasNotificacao: rota.alertasNotificacao,
          }
        : item,
    );

    await AsyncStorage.setItem(CHAVE_ROTAS, JSON.stringify(rotasAtualizadas));
  }
}
export async function obterRotaEmAndamento(): Promise<Rota | null> {
  const rotas = await obterRotas();

  return rotas.find((rota) => rota.status === "EM_ANDAMENTO") || null;
}
export async function existeRotaEmAndamento(): Promise<boolean> {
  const rota = await obterRotaEmAndamento();

  return rota !== null;
}
export async function salvarOcorrencia(rotaId: string, ocorrencia: Ocorrencia) {
  const rotas = await obterRotas();

  const novasRotas = rotas.map((rota) => {
    if (rota.id !== rotaId) {
      return rota;
    }

    return {
      ...rota,
      ocorrencias: [...(rota.ocorrencias ?? []), ocorrencia],
    };
  });

  await AsyncStorage.setItem(CHAVE_ROTAS, JSON.stringify(novasRotas));
}
export async function salvarPontoTrajeto(
  rotaId: string,
  latitude: number,
  longitude: number,
  accuracy?: number | null,
) {
  const rotas = await obterRotas();

  const novasRotas = rotas.map((rota) => {
    if (rota.id !== rotaId) {
      return rota;
    }

    const trajetoAtual = rota.trajeto ?? [];

    const ultimoPonto = trajetoAtual[trajetoAtual.length - 1];

    if (ultimoPonto) {
      const distancia = calcularDistanciaEntrePontos(
        ultimoPonto.latitude,
        ultimoPonto.longitude,
        latitude,
        longitude,
      );

      // Não salva pontos praticamente iguais.
      if (distancia < 0.01) {
        return rota;
      }
    }

    return {
      ...rota,
      trajeto: [
        ...trajetoAtual,
        {
          latitude,
          longitude,
          dataHora: new Date().toLocaleString("pt-BR"),
          accuracy,
        },
      ],
    };
  });

  await AsyncStorage.setItem(CHAVE_ROTAS, JSON.stringify(novasRotas));
}
export async function limparRotas() {
  await AsyncStorage.removeItem(CHAVE_ROTAS);
}

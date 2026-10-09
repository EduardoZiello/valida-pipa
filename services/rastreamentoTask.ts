import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { obterRotaEmAndamento, salvarPontoTrajeto } from "@/services/rotas";

export const RASTREAMENTO_TASK = "valida-pipa-background-location";

const MAX_VELOCIDADE_KMH = 140;

function calcularDistanciaKm(
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

function obterTimestampPonto(dataHora: string): number {
  const correspondencia = dataHora.match(
    /^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2}):(\d{2})$/,
  );

  if (correspondencia) {
    const [, dia, mes, ano, hora, minuto, segundo] = correspondencia;

    return new Date(
      Number(ano),
      Number(mes) - 1,
      Number(dia),
      Number(hora),
      Number(minuto),
      Number(segundo),
    ).getTime();
  }

  return new Date(dataHora).getTime();
}

TaskManager.defineTask(RASTREAMENTO_TASK, async ({ data, error }) => {
  if (error) {
    console.error("RASTREAMENTO BACKGROUND - ERRO:", error);
    return;
  }

  if (!data) {
    return;
  }

  const { locations } = data as {
    locations: Location.LocationObject[];
  };

  const rota = await obterRotaEmAndamento();

  if (!rota) {
    console.log("RASTREAMENTO BACKGROUND - Nenhuma rota em andamento.");
    return;
  }

  for (const location of locations) {
    const { latitude, longitude, accuracy } = location.coords;

    // 1. Rejeita pontos com precisão muito ruim.
    if (accuracy !== null && accuracy > 50) {
      console.log(
        "RASTREAMENTO BACKGROUND - Ponto ignorado por baixa precisão:",
        accuracy,
        "metros",
      );

      continue;
    }

    // 2. Verifica se o ponto atual representa um
    // deslocamento fisicamente plausível.
    const trajetoAtual = rota.trajeto ?? [];
    const ultimoPonto = trajetoAtual[trajetoAtual.length - 1];

    if (ultimoPonto) {
      const distanciaKm = calcularDistanciaKm(
        ultimoPonto.latitude,
        ultimoPonto.longitude,
        latitude,
        longitude,
      );

      const tempoAnterior = obterTimestampPonto(ultimoPonto.dataHora);

      const tempoAtual = location.timestamp;

      const diferencaHoras = (tempoAtual - tempoAnterior) / (1000 * 60 * 60);

      if (
        Number.isFinite(tempoAnterior) &&
        diferencaHoras > 0 &&
        diferencaHoras < 1
      ) {
        const velocidadeKmH = distanciaKm / diferencaHoras;

        if (velocidadeKmH > MAX_VELOCIDADE_KMH) {
          console.warn(
            "RASTREAMENTO BACKGROUND - Ponto rejeitado por salto de GPS:",
            {
              distanciaKm: Number(distanciaKm.toFixed(3)),
              velocidadeKmH: Number(velocidadeKmH.toFixed(1)),
            },
          );

          continue;
        }
      }
    }

    await salvarPontoTrajeto(rota.id, latitude, longitude, accuracy);

    // Mantém a cópia local atualizada caso o Android
    // entregue vários pontos no mesmo lote.
    rota.trajeto = [
      ...(rota.trajeto ?? []),
      {
        latitude,
        longitude,
        dataHora: new Date(location.timestamp).toLocaleString("pt-BR"),
        accuracy,
      },
    ];

    console.log(
      "RASTREAMENTO BACKGROUND - Ponto salvo:",
      latitude,
      longitude,
      "Precisão:",
      accuracy,
    );
  }
});

import * as Location from "expo-location";

import { RASTREAMENTO_TASK } from "@/services/rastreamentoTask";

let rastreamentoAtivo = false;

export async function iniciarRastreamento() {
  try {
    if (rastreamentoAtivo) {
      return;
    }

    const foreground = await Location.requestForegroundPermissionsAsync();

    if (foreground.status !== "granted") {
      console.log("RASTREAMENTO - Permissão de localização negada.");
      return;
    }

    const background = await Location.requestBackgroundPermissionsAsync();

    if (background.status !== "granted") {
      console.log(
        "RASTREAMENTO - Permissão de localização em segundo plano negada.",
      );
      return;
    }

    const jaEstaRodando =
      await Location.hasStartedLocationUpdatesAsync(RASTREAMENTO_TASK);

    if (!jaEstaRodando) {
      await Location.startLocationUpdatesAsync(RASTREAMENTO_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Valida Pipa",
          notificationBody: "A rota está sendo registrada.",
          notificationColor: "#1976D2",
        },
      });
    }

    rastreamentoAtivo = true;

    console.log("RASTREAMENTO - Iniciado com sucesso.");
  } catch (error) {
    console.error("RASTREAMENTO - ERRO:", error);
  }
}

export async function pararRastreamento() {
  try {
    const estaRodando =
      await Location.hasStartedLocationUpdatesAsync(RASTREAMENTO_TASK);

    if (estaRodando) {
      await Location.stopLocationUpdatesAsync(RASTREAMENTO_TASK);
    }

    rastreamentoAtivo = false;

    console.log("RASTREAMENTO - Finalizado.");
  } catch (error) {
    console.error("RASTREAMENTO - ERRO AO PARAR:", error);
  }
}

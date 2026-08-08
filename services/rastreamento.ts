import * as Location from "expo-location";

import { salvarPontoTrajeto } from "@/services/rotas";

let subscription: Location.LocationSubscription | null = null;

export async function iniciarRastreamento(rotaId: string) {
  try {
    console.log("RASTREAMENTO - função chamada:", rotaId);

    if (subscription) {
      console.log("RASTREAMENTO - já está ativo.");
      return;
    }

    console.log("RASTREAMENTO - solicitando permissão...");

    const { status } = await Location.requestForegroundPermissionsAsync();

    console.log("RASTREAMENTO - permissão:", status);

    if (status !== "granted") {
      console.log("RASTREAMENTO - permissão negada.");
      return;
    }

    console.log("RASTREAMENTO - iniciando watchPositionAsync...");

    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000,
        distanceInterval: 20,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;

        console.log("RASTREAMENTO - NOVO PONTO:", {
          latitude,
          longitude,
        });

        await salvarPontoTrajeto(rotaId, latitude, longitude);
      },
    );

    console.log("RASTREAMENTO - watchPositionAsync ativo.");
  } catch (error) {
    console.error("RASTREAMENTO - ERRO:", error);
  }
}
export function pararRastreamento() {
  if (subscription) {
    subscription.remove();
    subscription = null;

    console.log("Rastreamento finalizado.");
  }
}

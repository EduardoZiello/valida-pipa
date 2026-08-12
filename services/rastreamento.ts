import * as Location from "expo-location";

import { salvarPontoTrajeto } from "@/services/rotas";

let subscription: Location.LocationSubscription | null = null;

export async function iniciarRastreamento(rotaId: string) {
  try {
    if (subscription) {
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return;
    }

    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000,
        distanceInterval: 20,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;

        await salvarPontoTrajeto(rotaId, latitude, longitude);
      },
    );
  } catch (error) {
    console.error("RASTREAMENTO - ERRO:", error);
  }
}
export function pararRastreamento() {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { obterRotaEmAndamento, salvarPontoTrajeto } from "@/services/rotas";

export const RASTREAMENTO_TASK = "valida-pipa-background-location";

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
    const { latitude, longitude } = location.coords;

    await salvarPontoTrajeto(rota.id, latitude, longitude);

    console.log("RASTREAMENTO BACKGROUND - Ponto salvo:", latitude, longitude);
  }
});

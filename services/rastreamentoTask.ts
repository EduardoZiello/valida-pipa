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
    const { latitude, longitude, accuracy } = location.coords;

    // Ignora pontos com precisão muito ruim.
    // O ponto continua sendo solicitado pelo rastreamento,
    // mas não entra no desenho do percurso.
    if (accuracy !== null && accuracy > 50) {
      console.log(
        "RASTREAMENTO BACKGROUND - Ponto ignorado por baixa precisão:",
        accuracy,
        "metros",
      );

      continue;
    }

    await salvarPontoTrajeto(rota.id, latitude, longitude, accuracy);

    console.log(
      "RASTREAMENTO BACKGROUND - Ponto salvo:",
      latitude,
      longitude,
      "Precisão:",
      accuracy,
    );
  }
});

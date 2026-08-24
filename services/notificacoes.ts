import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CANAL_ROTAS = "alertas-rotas";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function prepararNotificacoes() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CANAL_ROTAS, {
        name: "Alertas de Rotas",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: statusAtual } = await Notifications.getPermissionsAsync();

    if (statusAtual === "granted") {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();

    return status === "granted";
  } catch (error) {
    console.error("NOTIFICAÇÕES - ERRO:", error);
    return false;
  }
}

export async function agendarAlertaRota(
  rotaId: string,
  dataHoraInicio: string,
) {
  try {
    const permitido = await prepararNotificacoes();

    if (!permitido) {
      console.log("NOTIFICAÇÕES - Permissão não concedida.");
      return;
    }

    const agora = new Date();

    // Primeiro alerta: 4 horas depois do início da rota
    const primeiroAlerta = new Date(agora.getTime() + 60 * 60 * 1000);

    const idPrimeiroAlerta = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Rota ainda em andamento",
        body: `A rota iniciada em ${dataHoraInicio} continua aberta. Verifique se você já deveria finalizá-la.`,
        data: {
          tipo: "ROTA_EM_ANDAMENTO",
          rotaId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: primeiroAlerta,
        ...(Platform.OS === "android" ? { channelId: CANAL_ROTAS } : {}),
      },
    });

    console.log("NOTIFICAÇÕES - Primeiro alerta agendado:", idPrimeiroAlerta);

    // Segundo alerta: 12 horas depois do início
    const segundoAlerta = new Date(agora.getTime() + 12 * 60 * 60 * 1000);

    const idSegundoAlerta = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔴 Atenção: rota ainda aberta",
        body: "Existe uma rota em andamento há muitas horas. Verifique o Valida Pipa para não esquecer de encerrá-la.",
        data: {
          tipo: "ROTA_EM_ANDAMENTO",
          rotaId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: segundoAlerta,
        ...(Platform.OS === "android" ? { channelId: CANAL_ROTAS } : {}),
      },
    });

    console.log("NOTIFICAÇÕES - Segundo alerta agendado:", idSegundoAlerta);

    return {
      primeiroAlerta: idPrimeiroAlerta,
      segundoAlerta: idSegundoAlerta,
    };
  } catch (error) {
    console.error("NOTIFICAÇÕES - ERRO AO AGENDAR:", error);
  }
}

export async function cancelarAlertasRota(alertas: string[] | undefined) {
  if (!alertas) {
    return;
  }

  for (const id of alertas) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.error("NOTIFICAÇÕES - ERRO AO CANCELAR:", error);
    }
  }
}

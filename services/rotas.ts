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

  status: "EM_ANDAMENTO" | "FINALIZADA";
}

export async function obterRotas(): Promise<Rota[]> {
  const json = await AsyncStorage.getItem(CHAVE_ROTAS);

  if (!json) {
    return [];
  }

  return JSON.parse(json);
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

  const novasRotas = rotas.map((rota) => {
    if (rota.id !== id) {
      return rota;
    }

    return {
      ...rota,
      ...dados,
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
}
export async function obterRotaEmAndamento(): Promise<Rota | null> {
  const rotas = await obterRotas();

  return rotas.find((rota) => rota.status === "EM_ANDAMENTO") || null;
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
) {
  const rotas = await obterRotas();

  const novasRotas = rotas.map((rota) => {
    if (rota.id !== rotaId) {
      return rota;
    }

    return {
      ...rota,
      trajeto: [
        ...(rota.trajeto ?? []),
        {
          latitude,
          longitude,
          dataHora: new Date().toLocaleString("pt-BR"),
        },
      ],
    };
  });

  await AsyncStorage.setItem(CHAVE_ROTAS, JSON.stringify(novasRotas));

  console.log("TRAJETO - ponto salvo:", rotaId);
}
export async function limparRotas() {
  await AsyncStorage.removeItem("rotas");
}
console.log("ROTAS MODULE CARREGADO");
console.log({
  obterRotas,
  salvarRota,
  obterRotaEmAndamento,
  finalizarRota,
  salvarOcorrencia,
});

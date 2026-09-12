import { collection, doc, setDoc } from "firebase/firestore";

import { db } from "./firebase";
import type { Rota } from "./rotas";

/**
 * Gera um identificador único para a validação pública.
 */
export function gerarTokenValidacao(): string {
  return doc(collection(db, "validacoesPublicas")).id;
}

/**
 * Cria o registro público usado para validar um comprovante de rota.
 *
 * Apenas informações necessárias para conferência são publicadas.
 * Dados sensíveis, fotos e o trajeto completo permanecem fora
 * deste registro público.
 */
export async function criarValidacaoPublica(rota: Rota): Promise<string> {
  if (rota.status !== "FINALIZADA") {
    throw new Error(
      "Somente rotas finalizadas podem gerar uma validação pública.",
    );
  }

  const token = gerarTokenValidacao();

  const ocorrencias = rota.ocorrencias ?? [];
  const trajeto = rota.trajeto ?? [];

  await setDoc(doc(db, "validacoesPublicas", token), {
    token,
    rotaId: rota.id,
    motorista: rota.motorista,
    placa: rota.placa,
    modelo: rota.modelo,
    dataHoraInicio: rota.dataHoraInicio,
    dataHoraFim: rota.dataHoraFim ?? null,
    distanciaPercorridaKm: rota.distanciaPercorridaKm ?? 0,
    quantidadePontosGPS: trajeto.length,
    quantidadeOcorrencias: ocorrencias.length,
    status: rota.status,
    criadoEm: new Date().toISOString(),
  });

  return token;
}

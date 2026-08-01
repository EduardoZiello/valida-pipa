export interface Evidencia {
  foto: string;
  dataHora: string;
  latitude: number;
  longitude: number;
  motorista: string;
  placa: string;
  rotaId: string;
  tipo: "INICIO" | "FINAL" | "OCORRENCIA";
}

let gerarImagem: ((dados: Evidencia) => Promise<string>) | null = null;

export function registrarGeradorEvidencia(
  callback: (dados: Evidencia) => Promise<string>,
) {
  gerarImagem = callback;
}

export async function gerarEvidencia(evidencia: Evidencia): Promise<string> {
  if (!gerarImagem) {
    return evidencia.foto;
  }

  return gerarImagem(evidencia);
}

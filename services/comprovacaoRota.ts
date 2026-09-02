import type { Rota } from "@/services/rotas";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

function escaparHtml(valor: unknown): string {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatarNumero(valor: number | undefined): string {
  if (valor === undefined || valor === null) {
    return "Não informado";
  }

  return valor.toFixed(6);
}

function formatarData(data: string | undefined): string {
  if (!data) {
    return "Não informado";
  }

  return data;
}

function identificarTipoImagem(uri: string): string {
  const uriLimpa = uri.split("?")[0].toLowerCase();

  if (uriLimpa.endsWith(".png")) {
    return "image/png";
  }

  if (uriLimpa.endsWith(".webp")) {
    return "image/webp";
  }

  if (uriLimpa.endsWith(".gif")) {
    return "image/gif";
  }

  return "image/jpeg";
}

async function imagemParaBase64(
  uri: string | undefined,
): Promise<string | null> {
  if (!uri) {
    return null;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const tipoImagem = identificarTipoImagem(uri);

    return `data:${tipoImagem};base64,${base64}`;
  } catch (error) {
    console.error("COMPROVAÇÃO - ERRO AO LER IMAGEM:", error);
    return null;
  }
}

function blocoImagem(titulo: string, imagemBase64: string | null): string {
  if (!imagemBase64) {
    return `
      <div class="imagem-container">
        <div class="imagem-indisponivel">
          ${escaparHtml(titulo)}<br />
          <span>Imagem não disponível</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="imagem-container">
      <div class="imagem-titulo">
        ${escaparHtml(titulo)}
      </div>

      <img
        src="${imagemBase64}"
        class="foto-evidencia"
      />
    </div>
  `;
}

function gerarBlocoOcorrencia(
  ocorrencia: NonNullable<Rota["ocorrencias"]>[number],
  index: number,
  fotoBase64: string | null,
): string {
  return `
    <div class="ocorrencia">

      <h3>Ocorrência ${index + 1}</h3>

      ${blocoImagem(`Foto da ocorrência ${index + 1}`, fotoBase64)}

      <table class="dados">

        <tr>
          <td>Data e hora</td>
          <td>${escaparHtml(ocorrencia.dataHora)}</td>
        </tr>

        <tr>
          <td>Observação</td>
          <td>
            ${escaparHtml(ocorrencia.observacao || "Não informada")}
          </td>
        </tr>

        <tr>
          <td>Latitude</td>
          <td>${formatarNumero(ocorrencia.latitude)}</td>
        </tr>

        <tr>
          <td>Longitude</td>
          <td>${formatarNumero(ocorrencia.longitude)}</td>
        </tr>

      </table>

    </div>
  `;
}

async function gerarHtmlComprovacao(
  rota: Rota,
  mapaUri?: string,
): Promise<string> {
  const ocorrencias = rota.ocorrencias ?? [];
  const trajeto = rota.trajeto ?? [];

  /*
   * Converte as fotos para Base64 antes de montar o HTML.
   */

  const fotoInicioBase64 = await imagemParaBase64(rota.fotoInicio);

  const fotoFimBase64 = await imagemParaBase64(rota.fotoFim);
  const mapaBase64 = await imagemParaBase64(mapaUri);

  const listaOcorrencias =
    ocorrencias.length > 0
      ? (
          await Promise.all(
            ocorrencias.map(async (ocorrencia, index) => {
              const fotoBase64 = await imagemParaBase64(ocorrencia.foto);

              return gerarBlocoOcorrencia(ocorrencia, index, fotoBase64);
            }),
          )
        ).join("")
      : `
        <p class="vazio">
          Nenhuma ocorrência registrada.
        </p>
      `;

  return `
    <!DOCTYPE html>

    <html lang="pt-BR">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>

          * {
            box-sizing: border-box;
          }

          @page {
            margin: 20px;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            padding: 20px;

            color: #1f2937;

            font-size: 12px;

            line-height: 1.5;
          }

          .cabecalho {
            text-align: center;

            border-bottom: 3px solid #1e40af;

            padding-bottom: 18px;

            margin-bottom: 24px;
          }

          .cabecalho h1 {
            margin: 0;

            color: #1e40af;

            font-size: 26px;
          }

          .cabecalho p {
            margin: 5px 0 0;

            color: #64748b;

            font-size: 13px;
          }

          .titulo-secao {
            background: #eff6ff;

            border-left: 4px solid #1e40af;

            padding: 8px 10px;

            margin-top: 20px;

            margin-bottom: 12px;

            font-size: 15px;

            font-weight: bold;

            color: #1e3a8a;
          }

          .dados {
            width: 100%;

            border-collapse: collapse;

            margin-bottom: 10px;
          }

          .dados td {
            border-bottom: 1px solid #e5e7eb;

            padding: 7px 5px;

            vertical-align: top;
          }

          .dados td:first-child {
            width: 38%;

            font-weight: bold;

            color: #475569;
          }

          .resumo {
            display: flex;

            flex-direction: row;

            gap: 12px;

            margin: 15px 0;
          }

          .card {
            flex: 1;

            border: 1px solid #dbeafe;

            background: #f8fafc;

            padding: 12px;

            text-align: center;
          }

          .card .valor {
            display: block;

            font-size: 20px;

            font-weight: bold;

            color: #1e40af;
          }

          .card .label {
            display: block;

            margin-top: 4px;

            color: #64748b;
          }

          .imagem-container {
            margin-top: 14px;

            margin-bottom: 16px;

            page-break-inside: avoid;

            text-align: center;
          }

          .imagem-titulo {
            background: #f8fafc;

            border: 1px solid #e5e7eb;

            padding: 8px;

            font-weight: bold;

            color: #475569;

            text-align: left;
          }

          .foto-evidencia {
            display: block;

            width: 100%;

            max-height: 430px;

            object-fit: contain;

            margin: 0 auto;

            border: 1px solid #d1d5db;
          }
            .mapa-evidencia {
  display: block;

  width: 100%;

  max-height: 520px;

  object-fit: contain;

  margin: 0 auto;

  border: 1px solid #d1d5db;
}

          .imagem-indisponivel {
            border: 1px dashed #cbd5e1;

            background: #f8fafc;

            padding: 30px 10px;

            color: #64748b;

            text-align: center;
          }

          .imagem-indisponivel span {
            font-size: 10px;
          }

          .ocorrencia {
            border: 1px solid #e5e7eb;

            border-radius: 6px;

            padding: 12px;

            margin-bottom: 16px;

            page-break-inside: avoid;
          }

          .ocorrencia h3 {
            margin: 0 0 10px;

            color: #1e40af;

            font-size: 14px;
          }

          .vazio {
            color: #64748b;

            font-style: italic;
          }

          .status {
            display: inline-block;

            padding: 5px 10px;

            border-radius: 5px;

            background: #dcfce7;

            color: #166534;

            font-weight: bold;
          }

          .resultado {
            background: #f0fdf4;

            border: 1px solid #bbf7d0;

            border-radius: 8px;

            padding: 14px;

            color: #166534;

            page-break-inside: avoid;
          }

          .rodape {
            margin-top: 30px;

            padding-top: 12px;

            border-top: 1px solid #d1d5db;

            text-align: center;

            color: #64748b;

            font-size: 10px;
          }

        </style>

      </head>

      <body>

        <div class="cabecalho">

          <h1>VALIDA PIPA</h1>

          <p>
            Comprovação de Execução de Rota
          </p>

        </div>

        <!-- IDENTIFICAÇÃO -->

        <div class="titulo-secao">
          1. Identificação da Rota
        </div>

        <table class="dados">

          <tr>
            <td>ID da rota</td>

            <td>
              ${escaparHtml(rota.id)}
            </td>
          </tr>

          <tr>
            <td>Motorista</td>

            <td>
              ${escaparHtml(rota.motorista)}
            </td>
          </tr>

          <tr>
            <td>Placa</td>

            <td>
              ${escaparHtml(rota.placa)}
            </td>
          </tr>

          <tr>
            <td>Modelo do caminhão</td>

            <td>
              ${escaparHtml(rota.modelo)}
            </td>
          </tr>

          <tr>
            <td>Status</td>

            <td>

              <span class="status">
                ${escaparHtml(rota.status)}
              </span>

            </td>
          </tr>

        </table>

        <!-- INÍCIO -->

        <div class="titulo-secao">
          2. Início da Rota
        </div>

        <table class="dados">

          <tr>
            <td>Data e hora</td>

            <td>
              ${formatarData(rota.dataHoraInicio)}
            </td>
          </tr>

          <tr>
            <td>Latitude</td>

            <td>
              ${formatarNumero(rota.latitudeInicio)}
            </td>
          </tr>

          <tr>
            <td>Longitude</td>

            <td>
              ${formatarNumero(rota.longitudeInicio)}
            </td>
          </tr>

        </table>

        ${blocoImagem("Foto inicial da rota", fotoInicioBase64)}

        <!-- PERCURSO -->

        <div class="titulo-secao">
          3. Percurso Registrado
        </div>

        <div class="resumo">

          <div class="card">

            <span class="valor">
              ${
                rota.distanciaPercorridaKm !== undefined
                  ? `${rota.distanciaPercorridaKm.toFixed(2)} km`
                  : "0.00 km"
              }
            </span>

            <span class="label">
              Distância percorrida
            </span>

          </div>

          <div class="card">

            <span class="valor">
              ${trajeto.length}
            </span>

            <span class="label">
              Pontos GPS
            </span>

          </div>

          <div class="card">

            <span class="valor">
              ${ocorrencias.length}
            </span>

            <span class="label">
              Ocorrências
            </span>

          </div>

        </div>

        <table class="dados">

          <tr>

            <td>
              Registro do percurso
            </td>

            <td>
              ${trajeto.length > 0 ? "Registrado" : "Nenhum ponto registrado"}
            </td>

          </tr>

          <tr>

            <td>
              Primeiro ponto GPS
            </td>

            <td>

              ${
                trajeto.length > 0
                  ? `${formatarNumero(trajeto[0].latitude)},
                     ${formatarNumero(trajeto[0].longitude)}`
                  : "Não disponível"
              }

            </td>

          </tr>

          <tr>

            <td>
              Último ponto GPS
            </td>

            <td>

              ${
                trajeto.length > 0
                  ? `${formatarNumero(trajeto[trajeto.length - 1].latitude)},
                     ${formatarNumero(trajeto[trajeto.length - 1].longitude)}`
                  : "Não disponível"
              }

            </td>

          </tr>

        </table>
        <!-- MAPA DO PERCURSO -->

        <div class="titulo-secao">
          4. Mapa do Percurso
        </div>

        ${
          mapaBase64
            ? `
              <div class="imagem-container">
                <div class="imagem-titulo">
                  Percurso registrado
                </div>

                <img
                  src="${mapaBase64}"
                  class="mapa-evidencia"
                />
              </div>
            `
            : `
              <p class="vazio">
                Mapa do percurso não disponível.
              </p>
            `
        }
        <!-- OCORRÊNCIAS -->

        <div class="titulo-secao">
          4. Ocorrências Registradas
        </div>

        ${listaOcorrencias}

        <!-- FINALIZAÇÃO -->

        <div class="titulo-secao">
          5. Finalização da Rota
        </div>

        <table class="dados">

          <tr>

            <td>
              Data e hora
            </td>

            <td>
              ${formatarData(rota.dataHoraFim)}
            </td>

          </tr>

          <tr>

            <td>
              Latitude final
            </td>

            <td>
              ${formatarNumero(rota.latitudeFim)}
            </td>

          </tr>

          <tr>

            <td>
              Longitude final
            </td>

            <td>
              ${formatarNumero(rota.longitudeFim)}
            </td>

          </tr>

        </table>

        ${blocoImagem("Foto final da rota", fotoFimBase64)}

        <!-- RESULTADO -->

        <div class="titulo-secao">
          6. Resultado da Comprovação
        </div>

        <div class="resultado">

          A rota foi registrada pelo aplicativo
          <strong>VALIDA PIPA</strong>,
          contendo dados de identificação,
          registros de localização,
          percurso,
          ocorrências e informações
          de início e finalização.

        </div>

        <div class="rodape">

          Documento gerado pelo aplicativo
          VALIDA PIPA.

          <br />

          ID da rota:
          ${escaparHtml(rota.id)}

        </div>

      </body>

    </html>
  `;
}

export async function gerarComprovacaoRota(
  rota: Rota,
  mapaUri?: string,
): Promise<string> {
  if (rota.status !== "FINALIZADA") {
    throw new Error(
      "A comprovação somente pode ser gerada para uma rota finalizada.",
    );
  }
  const html = await gerarHtmlComprovacao(rota, mapaUri);

  const resultado = await Print.printToFileAsync({
    html,
  });

  return resultado.uri;
}

export async function compartilharComprovacaoRota(
  arquivoUri: string,
): Promise<void> {
  const disponivel = await Sharing.isAvailableAsync();

  if (!disponivel) {
    throw new Error(
      "O compartilhamento de arquivos não está disponível neste dispositivo.",
    );
  }

  await Sharing.shareAsync(arquivoUri, {
    mimeType: "application/pdf",
    dialogTitle: "Compartilhar comprovante da rota",
  });
}

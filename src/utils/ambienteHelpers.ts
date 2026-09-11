import imgAreaServico from "../assets/ambientes/areadeservico.jpg";
import imgAreaExterna from "../assets/ambientes/areaexterna.jpg";
import imgBanheiro from "../assets/ambientes/banheiro.jpg";
import imgChaves from "../assets/ambientes/chaves.jpg";
import imgCorredor from "../assets/ambientes/corredor.jpg";
import imgCozinha from "../assets/ambientes/cozinha.jpg";
import imgGaragem from "../assets/ambientes/garagem.jpg";
import imgHall from "../assets/ambientes/hall.jpg";
import imgInstalacoes from "../assets/ambientes/instalacoes.jpg";
import imgMedidores from "../assets/ambientes/medidores.jpg";
import imgQuarto from "../assets/ambientes/quarto.jpg";
import imgQuintal from "../assets/ambientes/quintal.jpg";
import imgSalaDeEstar from "../assets/ambientes/saladeestar.jpg";
import imgSeguranca from "../assets/ambientes/seguranca.jpg";

export const ITENS_POR_AMBIENTE: Record<string, string[]> = {
  "sala": ["Teto", "Parede", "Piso", "Rodapé", "Porta", "Janela", "Tomadas", "Interruptores", "Iluminação"],
  "sala de estar": ["Teto", "Parede", "Piso", "Rodapé", "Porta", "Janela", "Tomadas", "Interruptores", "Iluminação"],
  "cozinha": ["Teto", "Parede", "Piso", "Bancada", "Armário", "Pia", "Torneira", "Tomadas", "Iluminação"],
  "quarto": ["Teto", "Parede", "Piso", "Rodapé", "Porta", "Janela", "Tomadas", "Interruptores", "Iluminação", "Armário"],
  "banheiro": ["Teto", "Parede", "Piso", "Box", "Vaso", "Pia", "Torneira", "Chuveiro", "Espelho", "Tomadas"],
  "lavabo": ["Teto", "Parede", "Piso", "Vaso", "Pia", "Torneira", "Espelho"],
  "area de servico": ["Teto", "Parede", "Piso", "Tanque", "Torneira", "Tomadas"],
  "corredor": ["Teto", "Parede", "Piso", "Rodapé", "Iluminação"],
  "hall": ["Teto", "Parede", "Piso", "Rodapé", "Iluminação"],
  "garagem": ["Teto", "Parede", "Piso", "Portão", "Iluminação"],
  "area externa": ["Piso", "Parede", "Iluminação"],
  "quintal": ["Piso", "Muro", "Iluminação"],
  "seguranca": ["Câmeras", "Alarme", "Cerca elétrica", "Portão eletrônico"],
  "chaves": ["Chave de entrada", "Chave de garagem", "Controle", "Tag"],
  "medidores": ["Medidor de água", "Medidor de energia", "Medidor de gás"],
  "instalacoes": ["Elétrica", "Hidráulica", "Gás", "Internet"],
};

export function getItensPadrao(nomeAmbiente: string): string[] {
  if (!nomeAmbiente) return ["Teto", "Parede", "Piso"];
  const nome = nomeAmbiente
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  if (ITENS_POR_AMBIENTE[nome]) return ITENS_POR_AMBIENTE[nome];
  for (const [chave, itens] of Object.entries(ITENS_POR_AMBIENTE)) {
    if (nome.includes(chave) || chave.includes(nome)) return itens;
  }
  return ["Teto", "Parede", "Piso"];
}

const MAPA_IMAGENS_EXATO: Record<string, string> = {
  "sala de estar": imgSalaDeEstar,
  "sala": imgSalaDeEstar,
  "saladeestar": imgSalaDeEstar,
  "cozinha": imgCozinha,
  "quarto": imgQuarto,
  "banheiro": imgBanheiro,
  "lavabo": imgBanheiro,
  "area de servico": imgAreaServico,
  "areadeservico": imgAreaServico,
  "corredor": imgCorredor,
  "hall": imgHall,
  "corredor/hall": imgCorredor,
  "garagem": imgGaragem,
  "area externa": imgAreaExterna,
  "areaexterna": imgAreaExterna,
  "quintal": imgQuintal,
  "seguranca": imgSeguranca,
  "chaves": imgChaves,
  "medidores": imgMedidores,
  "instalacoes": imgInstalacoes,
};

export function getImagemPadrao(nomeAmbiente: string): string {
  if (!nomeAmbiente) return imgSalaDeEstar;

  const nome = nomeAmbiente
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  if (MAPA_IMAGENS_EXATO[nome]) {
    return MAPA_IMAGENS_EXATO[nome];
  }

  // Busca parcial caso não encontre correspondência exata
  for (const [chave, img] of Object.entries(MAPA_IMAGENS_EXATO)) {
    if (nome.includes(chave) || chave.includes(nome)) {
      return img;
    }
  }

  return imgSalaDeEstar;
}
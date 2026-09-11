// src/types.ts

// ============================================
// IMPORTS DAS IMAGENS DOS AMBIENTES
// ============================================
import imgAreaServico from "./assets/ambientes/areadeservico.jpg";
import imgAreaExterna from "./assets/ambientes/areaexterna.jpg";
import imgBanheiro from "./assets/ambientes/banheiro.jpg";
import imgChaves from "./assets/ambientes/chaves.jpg";
import imgCorredor from "./assets/ambientes/corredor.jpg";
import imgCozinha from "./assets/ambientes/cozinha.jpg";
import imgGaragem from "./assets/ambientes/garagem.jpg";
import imgHall from "./assets/ambientes/hall.jpg";
import imgInstalacoes from "./assets/ambientes/instalacoes.jpg";
import imgMedidores from "./assets/ambientes/medidores.jpg";
import imgQuarto from "./assets/ambientes/quarto.jpg";
import imgQuintal from "./assets/ambientes/quintal.jpg";
import imgSalaDeEstar from "./assets/ambientes/saladeestar.jpg";
import imgSeguranca from "./assets/ambientes/seguranca.jpg";

// ============================================
// MAPEAMENTO DE IMAGENS POR TIPO DE AMBIENTE
// ============================================
const IMAGENS_PADRAO: Record<string, string> = {
  "sala de estar":   imgSalaDeEstar,
  "sala":            imgSalaDeEstar,
  "saladeestar":     imgSalaDeEstar,
  "cozinha":         imgCozinha,
  "quarto":          imgQuarto,
  "banheiro":        imgBanheiro,
  "lavabo":          imgBanheiro,
  "area de servico": imgAreaServico,
  "areadeservico":   imgAreaServico,
  "area externa":    imgAreaExterna,
  "areaexterna":     imgAreaExterna,
  "corredor":        imgCorredor,
  "hall":            imgHall,
  "garagem":         imgGaragem,
  "quintal":         imgQuintal,
  "seguranca":       imgSeguranca,
  "chaves":          imgChaves,
  "medidores":       imgMedidores,
  "instalacoes":     imgInstalacoes,
};

// ============================================
// FUNÇÃO PARA PEGAR A IMAGEM PADRÃO
// ============================================
export function getImagemPadrao(nomeAmbiente: string): string {
  if (!nomeAmbiente) return imgSalaDeEstar;

  const nome = nomeAmbiente
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  if (IMAGENS_PADRAO[nome]) return IMAGENS_PADRAO[nome];

  for (const [chave, url] of Object.entries(IMAGENS_PADRAO)) {
    if (nome.includes(chave) || chave.includes(nome)) return url;
  }

  return imgSalaDeEstar;
}

// ============================================
// TIPOS (interfaces)
// ============================================
export interface Ambiente {
  id: string;
  nome: string;
  itens: any[];
  fotos: any[];
}

export interface AmbientesTabProps {
  inspection: any;
  locked: boolean;
  templateOpen: boolean;
  setTemplateOpen: (v: boolean) => void;
  addAmbiente: (nome: string, itensBase?: any[]) => void;
  removeAmbiente: (id: string) => void;
  updateAmbiente: (id: string, campo: string, valor: any) => void;
  applyModel: (model: any) => void;
  customModels: any[];
}

export interface AmbienteCardProps {
  ambiente: Ambiente;
  numero: number;
  locked: boolean;
  onRemove: () => void;
  onChange: (fn: (a: any) => any) => void;
}
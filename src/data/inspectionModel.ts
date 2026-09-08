// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { todayISO } from "../utils/format";
import { normalizePhoto } from "../utils/media";
import type { Ambiente, Chaves, FieldRule, Imovel, Inspection, Item, ItemFieldDef, Medidor, Medidores, PropertyModel } from "../types/inspection";

export const TEMPLATES: Record<string, string[]> = {
  "Sala de Estar": ["Teto", "Parede", "Piso", "Rodapé", "Porta", "Janela", "Tomadas", "Interruptores", "Iluminação", "Quadro de luz"],
  "Cozinha": ["Teto", "Parede", "Piso", "Rodapé", "Porta", "Janela", "Tomadas", "Iluminação", "Pia", "Gabinete", "Azulejo", "Exaustor/Coifa", "Ponto de gás", "Ponto de água", "Eletrodomésticos"],
  "Quarto": ["Piso", "Paredes", "Teto", "Janelas", "Portas", "Armário embutido"],
  "Banheiro": ["Teto", "Parede", "Piso", "Rodapé", "Porta", "Janela", "Tomadas", "Iluminação", "Vaso sanitário", "Pia/bancada", "Box", "Registros", "Ralos", "Azulejo", "Espelho", "Ventilação"],
  "Lavabo": ["Teto", "Parede", "Piso", "Porta", "Tomadas", "Iluminação", "Vaso sanitário", "Pia", "Registros", "Azulejo"],
  "Área de Serviço": ["Teto", "Parede", "Piso", "Tomadas", "Iluminação", "Tanque", "Ponto de água", "Ponto de esgoto", "Eletrodomésticos"],
  "Corredor/Hall": ["Teto", "Parede", "Piso", "Rodapé", "Iluminação", "Tomadas"],
  "Garagem": ["Piso", "Portão", "Teto/Cobertura", "Iluminação", "Tomadas", "Estrutura"],
  "Área Externa": ["Piso", "Muros", "Portão", "Jardim", "Garagem"],
};

const ESTADOS = ["Novo", "Bom", "Regular", "Ruim", "Péssimo"];


export const ITEM_FIELD_DEFS: ItemFieldDef[] = [
  { key: "alvenaria", label: "Alvenaria" },
  { key: "revestimento", label: "Revestimento" },
  { key: "material", label: "Material" },
  { key: "acabamento", label: "Acabamento" },
  { key: "pintura", label: "Pintura" },
  { key: "sanca", label: "Sanca" },
  { key: "funcionamento", label: "Funcionamento" },
  { key: "marca", label: "Marca" },
  { key: "cor", label: "Cor" },
  { key: "quantidade", label: "Quantidade", type: "number" },
];

// Pre-filled suggestion lists per technical field, VistoHouse-style: the person
// can pick a common option, or use "+ Adicionar" to add their own (saved for
// next time), edit/remove options too.


export const FIELD_OPTIONS: Record<string, string[]> = {
  alvenaria: ["Tijolo aparente", "Reboco liso", "Reboco áspero", "Drywall (gesso acartonado)", "Bloco de concreto", "Alvenaria estrutural", "Não se aplica"],
  revestimento: ["Cerâmica", "Porcelanato", "Azulejo", "Pastilha", "Textura", "Papel de parede", "Laminado", "Granito", "Mármore", "Não se aplica"],
  material: ["Alvenaria", "Drywall (gesso acartonado)", "Madeira", "Metal", "Vidro", "PVC", "Concreto", "Cerâmica", "Porcelanato", "Granito", "Mármore", "Alumínio", "Ferro"],
  acabamento: ["Liso", "Texturizado", "Com Revestimento", "Com Azulejos", "Com Painéis", "Acabamento em Gesso", "Fosco", "Brilhante", "Semi-Brilho", "Com Grafiato", "Polido", "Encerado", "Anodizado", "Cromado", "Vitrificado", "Rústico", "Não se aplica"],
  pintura: ["Pintura Acrílica", "Pintura Lavável", "Pintura Esmalte Sintético", "Pintura Efeito Texturizado", "Pintura Antimofo", "Pintura Fosca", "Pintura Semi-Brilho", "Pintura Brilhante", "Pintura a Spray", "Pintura em Camadas", "Látex", "Epóxi", "Ecológica", "Verniz", "Não se aplica"],
  sanca: ["Sanca Reta", "Sanca Aberta", "Sanca Fechada", "Sanca de Gesso", "Sanca com Iluminação Embutida", "Sem sanca"],
  funcionamento: ["Funcionando normalmente", "Funcionando com ressalva", "Funcionamento parcial", "Não funciona", "Não testado"],
  cor: ["Branco", "Bege", "Cinza", "Preto", "Amarelo", "Azul", "Verde", "Vermelho", "Marrom", "Rosa", "Roxo", "Multicolor"],
};

// Which technical fields actually make sense for a given item — e.g. a "Pia"
// doesn't need Alvenaria/Pintura, but does need Material/Funcionamento. Matched
// by keyword against the item name so it also works for custom/renamed items;
// falls back to a small universal set when nothing matches.


export const FIELD_RULES: FieldRule[] = [
  { keywords: ["piso", "parede", "teto", "rodapé", "rodape", "alvenaria", "estrutura", "muro", "cobertura"], fields: ["alvenaria", "revestimento", "acabamento", "pintura", "cor"] },
  { keywords: ["sanca"], fields: ["sanca", "acabamento", "pintura", "cor"] },
  { keywords: ["porta", "janela", "portão", "portao", "vidro", "box"], fields: ["material", "acabamento", "pintura", "cor", "funcionamento"] },
  { keywords: ["tomada", "interruptor", "iluminação", "iluminacao", "quadro de luz"], fields: ["funcionamento", "quantidade", "marca"] },
  { keywords: ["pia", "torneira", "chuveiro", "vaso sanitário", "vaso sanitario", "registro", "ralo", "tanque", "bancada", "sifão", "sifao"], fields: ["material", "funcionamento", "marca", "cor"] },
  { keywords: ["azulejo", "pastilha"], fields: ["revestimento", "cor", "acabamento"] },
  { keywords: ["gabinete", "armário", "armario", "prateleira"], fields: ["material", "acabamento", "cor", "funcionamento", "quantidade"] },
  { keywords: ["exaustor", "coifa", "eletrodoméstico", "eletrodomestico", "ar-condicionado", "ar condicionado"], fields: ["funcionamento", "marca", "quantidade"] },
  { keywords: ["extintor", "detector", "grade"], fields: ["quantidade", "funcionamento"] },
  { keywords: ["espelho", "ventilação", "ventilacao"], fields: ["material", "acabamento", "funcionamento"] },
  { keywords: ["ponto de"], fields: ["funcionamento", "quantidade"] },
];
const DEFAULT_ITEM_FIELDS = ["material", "acabamento", "cor", "funcionamento", "marca", "quantidade"];


export function relevantFieldKeys(itemName?: string): string[] {
  const n = (itemName || "").toLowerCase();
  for (const rule of FIELD_RULES) {
    if (rule.keywords.some((k) => n.includes(k))) return rule.fields;
  }
  return DEFAULT_ITEM_FIELDS;
}


export const CHAVE_TIPOS: { key: string; label: string }[] = [
  { key: "entrada", label: "Chave de entrada" },
  { key: "garagem", label: "Garagem" },
  { key: "controle", label: "Controle" },
  { key: "tags", label: "Tags" },
];


export const PROPERTY_MODELS: Record<string, PropertyModel> = {
  Kitnet: {
    label: "Kitnet",
    descricao: "Ambiente integrado, ideal para vistorias rápidas de imóveis compactos.",
    ambientes: {
      "Ambiente Integrado (Sala/Quarto)": ["Teto", "Parede", "Piso", "Rodapé", "Porta", "Janela", "Tomadas", "Iluminação", "Armário embutido"],
      "Cozinha": TEMPLATES["Cozinha"],
      "Banheiro": TEMPLATES["Banheiro"],
    },
  },
  Casa: {
    label: "Casa",
    descricao: "Modelo completo com área externa, ideal para casas térreas ou sobrados.",
    ambientes: {
      "Sala de Estar": TEMPLATES["Sala de Estar"],
      "Cozinha": TEMPLATES["Cozinha"],
      "Quarto 1": TEMPLATES["Quarto"],
      "Quarto 2": TEMPLATES["Quarto"],
      "Banheiro": TEMPLATES["Banheiro"],
      "Lavabo": TEMPLATES["Lavabo"],
      "Área de Serviço": TEMPLATES["Área de Serviço"],
      "Corredor/Hall": TEMPLATES["Corredor/Hall"],
      "Área Externa": TEMPLATES["Área Externa"],
    },
  },
  Apartamento: {
    label: "Apartamento",
    descricao: "Modelo padrão para apartamentos residenciais.",
    ambientes: {
      "Sala de Estar": TEMPLATES["Sala de Estar"],
      "Cozinha": TEMPLATES["Cozinha"],
      "Quarto 1": TEMPLATES["Quarto"],
      "Banheiro": TEMPLATES["Banheiro"],
      "Área de Serviço": TEMPLATES["Área de Serviço"],
      "Corredor/Hall": TEMPLATES["Corredor/Hall"],
    },
  },
  Comercial: {
    label: "Comercial",
    descricao: "Modelo para salas comerciais, escritórios e lojas.",
    ambientes: {
      "Recepção": ["Teto", "Parede", "Piso", "Porta", "Iluminação", "Tomadas"],
      "Sala Principal": ["Teto", "Parede", "Piso", "Janela", "Iluminação", "Tomadas", "Ar-condicionado"],
      "Banheiro": TEMPLATES["Banheiro"],
      "Copa/Kitchenette": ["Piso", "Pia", "Bancada", "Tomadas", "Iluminação"],
      "Depósito": ["Piso", "Parede", "Teto", "Iluminação", "Prateleiras"],
    },
  },
  "Checklist Completo": {
    label: "Checklist Completo",
    descricao: "Roteiro amplo com os itens mais cobrados em vistorias — estrutura, cômodos, medidores, chaves e segurança (60 itens).",
    ambientes: {
      "Estrutura Geral": [
        "Paredes (rachaduras/trincas)", "Pintura", "Piso", "Rodapé", "Teto (infiltração/mofo)",
        "Portas", "Fechaduras e trincos", "Dobradiças", "Janelas", "Vidros",
        "Iluminação", "Tomadas", "Interruptores", "Quadro de luz",
      ],
      "Cozinha": [
        "Pia (vazamentos)", "Torneiras", "Escoamento/ralo", "Gabinete e armários", "Azulejo",
        "Exaustor/Coifa", "Ponto de gás", "Tomadas", "Piso (impermeabilização)",
      ],
      "Banheiro": [
        "Vaso sanitário (descarga)", "Vedação da base do vaso", "Box (vidro/trilho)", "Chuveiro e registro",
        "Pia/bancada", "Ralos", "Espelho", "Ventilação", "Azulejos",
      ],
      "Quartos": [
        "Armário embutido", "Portas", "Janelas (vedação)", "Piso (nivelamento/ruído)",
      ],
      "Área de Serviço": [
        "Tanque", "Torneira do tanque", "Ponto para máquina de lavar", "Ralo/esgoto",
      ],
      "Área Externa / Garagem": [
        "Portão", "Controle do portão", "Piso da garagem", "Muros", "Jardim/quintal",
      ],
      "Medidores e Instalações": [
        "Medidor de água (leitura)", "Medidor de energia (leitura)", "Medidor de gás", "Registro geral de água",
      ],
      "Chaves e Acessos": [
        "Chaves de entrada", "Chaves da garagem", "Controles", "Tags/cartões de acesso",
      ],
      "Segurança": [
        "Extintores (validade)", "Detectores de fumaça", "Grades e proteções de janelas",
      ],
    },
  },
};


export const uid = () => Math.random().toString(36).slice(2, 10);


export function makeItem(nome: string): Item {
  return {
    id: uid(), nome, estado: "Bom", semTeste: false, observacoes: "", temDano: false, descricaoDano: "", fotos: [],
    campos: Object.fromEntries(ITEM_FIELD_DEFS.map((f) => [f.key, ""])),
  };
}


export function makeAmbiente(nome: string, itensNomes: string[] = []): Ambiente {
  return { id: uid(), nome, fotos: [], itens: itensNomes.map(makeItem) };
}


export function ambientesFromModel(modelKeyOrObj: string | PropertyModel): Ambiente[] {
  const model = typeof modelKeyOrObj === "string" ? PROPERTY_MODELS[modelKeyOrObj] : modelKeyOrObj;
  if (!model || !model.ambientes) return [];
  return Object.entries(model.ambientes).map(([nome, itens]) => makeAmbiente(nome, itens));
}


export function emptyMedidor(opcional = false, unidadePadrao = ""): Medidor {
  return { ativo: !opcional, numero: "", leitura: "", unidade: unidadePadrao, concessionaria: "", marca: "", observacoes: "", fotos: [] };
}


export function emptyChave(): { quantidade: string; observacoes: string; fotos: [] } {
  return { quantidade: "", observacoes: "", fotos: [] };
}


export function emptyInspection(): Inspection {
  return {
    id: uid(),
    tipo: "Entrada",
    dataVistoria: todayISO(),
    vistoriador: "",
    imovel: {
      cep: "", endereco: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "",
      metragem: "", proprietario: "", inquilino: "", tipoImovel: "Apartamento",
    },
    mobiliario: "Vazio",
    status: "Em andamento",
    capaFoto: null,
    ambientes: [],
    medidores: { agua: emptyMedidor(false, "m³"), energia: emptyMedidor(false, "kWh"), gas: emptyMedidor(true, "m³") },
    chaves: {
      entrada: emptyChave(),
      garagem: emptyChave(),
      controle: emptyChave(),
      tags: emptyChave(),
      outras: [],
    },
    signatures: { vistoriador: null, locador: null, locatario: null },
    parecerTecnico: { texto: "", anexos: [] },
    createdAt: Date.now(),
  };
}

const STORAGE_INDEX_KEY = "insp-index";


export function withDefaults(insp: any): Inspection {
  const base = emptyInspection();
  const oldSig = insp.signatures || {};
  return {
    ...base,
    ...insp,
    imovel: { ...base.imovel, ...(insp.imovel || {}) },
    mobiliario: insp.mobiliario || base.mobiliario,
    ambientes: (insp.ambientes || []).map((amb) => ({
      ...amb,
      fotos: (amb.fotos || []).map(normalizePhoto),
      itens: (amb.itens || []).map((it) => ({ ...it, fotos: (it.fotos || []).map(normalizePhoto) })),
    })),
    medidores: {
      agua: { ...base.medidores.agua, ...(insp.medidores?.agua || {}), fotos: (insp.medidores?.agua?.fotos || []).map(normalizePhoto) },
      energia: { ...base.medidores.energia, ...(insp.medidores?.energia || {}), fotos: (insp.medidores?.energia?.fotos || []).map(normalizePhoto) },
      gas: { ...base.medidores.gas, ...(insp.medidores?.gas || {}), fotos: (insp.medidores?.gas?.fotos || []).map(normalizePhoto) },
    },
    chaves: {
      entrada: { ...base.chaves.entrada, ...(insp.chaves?.entrada || {}), fotos: (insp.chaves?.entrada?.fotos || []).map(normalizePhoto) },
      garagem: { ...base.chaves.garagem, ...(insp.chaves?.garagem || {}), fotos: (insp.chaves?.garagem?.fotos || []).map(normalizePhoto) },
      controle: { ...base.chaves.controle, ...(insp.chaves?.controle || {}), fotos: (insp.chaves?.controle?.fotos || []).map(normalizePhoto) },
      tags: { ...base.chaves.tags, ...(insp.chaves?.tags || {}), fotos: (insp.chaves?.tags?.fotos || []).map(normalizePhoto) },
      outras: (insp.chaves?.outras || []).map((o) => ({ ...o, fotos: (o.fotos || []).map(normalizePhoto) })),
    },
    signatures: {
      vistoriador: oldSig.vistoriador ?? null,
      locador: oldSig.locador ?? null,
      locatario: oldSig.locatario ?? oldSig.responsavel ?? null,
    },
    parecerTecnico: {
      texto: insp.parecerTecnico?.texto || "",
      anexos: insp.parecerTecnico?.anexos || [],
    },
  };
}


export function buildExampleInspection(): Partial<Inspection> {
  const ambientes = ambientesFromModel("Apartamento");

  const cozinha = ambientes.find((a) => a.nome === "Cozinha");
  if (cozinha) {
    const pia = cozinha.itens.find((i) => i.nome === "Pia");
    if (pia) {
      pia.estado = "Regular";
      pia.temDano = true;
      pia.descricaoDano = "Pequeno vazamento identificado no sifão.";
      pia.observacoes = "Recomenda-se reparo antes da próxima vistoria.";
    }
  }
  const sala = ambientes.find((a) => a.nome === "Sala de Estar");
  if (sala) {
    const piso = sala.itens.find((i) => i.nome === "Piso");
    if (piso) piso.observacoes = "Piso laminado em bom estado, sem riscos aparentes.";
  }

  return {
    tipo: "Entrada",
    dataVistoria: todayISO(),
    vistoriador: "Vistoriador Exemplo",
    mobiliario: "Mobiliado",
    capaFoto: null,
    ambientes,
    imovel: {
      cep: "01310-100", endereco: "Avenida Paulista", numero: "1000", bairro: "Bela Vista",
      cidade: "São Paulo", estado: "SP", complemento: "Apto 52", metragem: "68 m²",
      proprietario: "Maria Souza", inquilino: "João Pereira", tipoImovel: "Apartamento",
    },
    medidores: {
      agua: { ativo: true, numero: "883421", leitura: "1245", unidade: "m³", concessionaria: "Sabesp", observacoes: "Leitura registrada no início da vistoria.", fotos: [] },
      energia: { ativo: true, numero: "55219087", leitura: "08234", unidade: "kWh", concessionaria: "Enel", observacoes: "", fotos: [] },
      gas: { ativo: false, numero: "", leitura: "", unidade: "", concessionaria: "", marca: "", observacoes: "", fotos: [] },
    },
    chaves: {
      entrada: { quantidade: "2", observacoes: "Chaves tetra", fotos: [] },
      garagem: { quantidade: "1", observacoes: "", fotos: [] },
      controle: { quantidade: "1", observacoes: "Controle do portão da garagem", fotos: [] },
      tags: { quantidade: "2", observacoes: "Tags de acesso à portaria", fotos: [] },
      outras: [],
    },
  };
}


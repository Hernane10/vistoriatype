// Static reference data: room/item templates, technical fields, their
// pre-filled pick-list options, which fields matter per item type, key
// types, and the ready-made property models (Kitnet, Casa, Apartamento...).

export const TEMPLATES = {
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

export const ESTADOS = ["Novo", "Bom", "Regular", "Ruim", "Péssimo"];

export const ITEM_FIELD_DEFS = [
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
export const FIELD_OPTIONS = {
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
export const FIELD_RULES = [
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
export const DEFAULT_ITEM_FIELDS = ["material", "acabamento", "cor", "funcionamento", "marca", "quantidade"];

export function relevantFieldKeys(itemName) {
  const n = (itemName || "").toLowerCase();
  for (const rule of FIELD_RULES) {
    if (rule.keywords.some((k) => n.includes(k))) return rule.fields;
  }
  return DEFAULT_ITEM_FIELDS;
}

export const CHAVE_TIPOS = [
  { key: "entrada", label: "Chave de entrada" },
  { key: "garagem", label: "Garagem" },
  { key: "controle", label: "Controle" },
  { key: "tags", label: "Tags" },
];

export const PROPERTY_MODELS = {
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

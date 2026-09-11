// src/data/inspectionModel.ts

// ==========================================
// 1. UTILITÁRIOS E GERADORES DE ID
// ==========================================
export const uid = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// ==========================================
// 2. CONSTANTES E MODELOS DE AMBIENTES
// ==========================================
export const TEMPLATES: Record<string, string[]> = {
  sala: ['Paredes', 'Piso', 'Teto', 'Iluminação', 'Janela', 'Porta', 'Tomadas e Interruptores'],
  quarto: ['Paredes', 'Piso', 'Teto', 'Iluminação', 'Janela', 'Porta', 'Tomadas e Interruptores', 'Armário'],
  cozinha: ['Paredes', 'Piso', 'Teto', 'Iluminação', 'Bancada', 'Pia e Torneira', 'Armários', 'Tomadas e Interruptores'],
  banheiro: ['Paredes', 'Piso', 'Teto', 'Iluminação', 'Espelho', 'Pia e Torneira', 'Vaso Sanitário', 'Box e Chuveiro'],
  varanda: ['Paredes', 'Piso', 'Teto', 'Guarda-Corpo', 'Iluminação', 'Tomadas'],
  garagem: ['Piso', 'Paredes', 'Portão', 'Iluminação', 'Teto'],
  default: ['Paredes', 'Piso', 'Teto', 'Iluminação', 'Janela', 'Porta']
};

export const PROPERTY_MODELS = {
  apartamento: {
    label: 'Apartamento',
    ambientes: {
      'Sala': ['Paredes', 'Piso', 'Teto', 'Janela', 'Porta'],
      'Cozinha': ['Paredes', 'Piso', 'Teto', 'Pia', 'Armário'],
      'Quarto': ['Paredes', 'Piso', 'Teto', 'Janela', 'Porta', 'Armário'],
      'Banheiro': ['Paredes', 'Piso', 'Teto', 'Vaso', 'Chuveiro'],
    },
  },
  casa: {
    label: 'Casa',
    ambientes: {
      'Sala': ['Paredes', 'Piso', 'Teto', 'Janela', 'Porta'],
      'Cozinha': ['Paredes', 'Piso', 'Teto', 'Pia', 'Armário'],
      'Quarto': ['Paredes', 'Piso', 'Teto', 'Janela', 'Porta'],
      'Banheiro': ['Paredes', 'Piso', 'Teto', 'Vaso', 'Chuveiro'],
      'Quintal': ['Piso', 'Muro'],
      'Garagem': ['Piso', 'Portão'],
    },
  },
};

export const CHAVE_TIPOS: { key: string; label: string }[] = [
  { key: 'entrada', label: 'Chave de entrada' },
  { key: 'garagem', label: 'Garagem' },
  { key: 'controle', label: 'Controle' },
  { key: 'tags', label: 'Tags' },
];

export const ITEM_FIELD_DEFS: { key: string; label: string; type?: string }[] = [
  { key: 'alvenaria', label: 'Alvenaria' },
  { key: 'revestimento', label: 'Revestimento' },
  { key: 'material', label: 'Material' },
  { key: 'acabamento', label: 'Acabamento' },
  { key: 'pintura', label: 'Pintura' },
  { key: 'sanca', label: 'Sanca' },
  { key: 'funcionamento', label: 'Funcionamento' },
  { key: 'marca', label: 'Marca' },
  { key: 'cor', label: 'Cor' },
  { key: 'quantidade', label: 'Quantidade', type: 'number' },
];

export const FIELD_OPTIONS: Record<string, string[]> = {
  alvenaria: ['Alvenaria', 'Drywall', 'Madeira', 'Outro'],
  revestimento: ['Cerâmica', 'Porcelanato', 'Pintura', 'Papel de parede', 'Outro'],
  material: ['Madeira', 'Alumínio', 'PVC', 'Ferro', 'Outro'],
  acabamento: ['Bom', 'Regular', 'Ruim'],
  pintura: ['Nova', 'Usada', 'Desgastada', 'Descascando'],
  sanca: ['Sim', 'Não'],
  funcionamento: ['Sim', 'Não', 'Parcial'],
  marca: ['Branca', 'Genérica', 'Outra'],
  cor: ['Branco', 'Preto', 'Cinza', 'Bege', 'Outra'],
  status: ['BOM', 'REGULAR', 'RUIM', 'N/A'],
  conservacao: ['Novo', 'Usado - Bom Estado', 'Usado - Marcas de Uso', 'Danificado'],
};

export const relevantFieldKeys = (itemName: string): string[] => {
  const name = itemName.toLowerCase();
  const rules: string[] = ['status', 'observations'];

  if (name.includes('parede') || name.includes('teto') || name.includes('piso')) {
    rules.push('revestimento', 'pintura');
  }
  if (name.includes('porta') || name.includes('janela') || name.includes('portão')) {
    rules.push('funcionamento');
  }
  if (name.includes('torneira') || name.includes('vaso') || name.includes('chuveiro')) {
    rules.push('funcionamento');
  }
  return rules;
};

// ==========================================
// 3. INTERFACES DE DADOS
// ==========================================
export interface Photo {
  id: string;
  src: string;
  url?: string;
  caption?: string;
  date?: string;
  marcas?: any;
}

export interface Item {
  id: string;
  name?: string;
  nome?: string;
  environmentId?: string;
  environmentKey?: string;
  estado?: string;
  semTeste?: boolean;
  observacoes?: string;
  observations?: string;
  temDano?: boolean;
  descricaoDano?: string;
  campos?: Record<string, any>;
  fotos?: Photo[];
  [key: string]: any;
}

export interface Environment {
  id: string;
  key?: string;
  nome?: string;
  name?: string;
  itens?: Item[];
  items?: Item[];
  fotos?: Photo[];
}

export interface Inspection {
  id: string;
  tipo?: string;
  title?: string;
  dataVistoria?: string;
  vistoriador?: string;
  mobiliario?: string;
  status?: string;
  capaFoto?: Photo | null;
  ambientes?: Environment[];
  environments?: Environment[];
  itens?: Item[];
  items?: Item[];
  imovel?: any;
  medidores?: any;
  chaves?: any;
  parecerTecnico?: any;
  signatures?: any;
  createdAt?: string;
  [key: string]: any;
}

export interface Medidor {
  ativo: boolean;
  numero: string;
  leitura: string;
  unidade: string;
  concessionaria?: string;
  observacoes: string;
  fotos: Photo[];
}

// ==========================================
// 4. FACTORIES (criar objetos padrão)
// ==========================================
export const makeItem = (nome: string): Item => ({
  id: uid(),
  nome,
  name: nome,
  estado: 'Bom',
  semTeste: false,
  observacoes: '',
  temDano: false,
  descricaoDano: '',
  campos: Object.fromEntries(ITEM_FIELD_DEFS.map((f) => [f.key, ''])),
  fotos: [],
});

export const makeAmbiente = (nome: string, itensNomes: string[] = []): Environment => {
  const nomes = itensNomes && itensNomes.length > 0 ? itensNomes : ['Teto', 'Parede', 'Piso'];
  return {
    id: uid(),
    nome,
    name: nome,
    fotos: [],
    itens: nomes.map((n) => makeItem(n)),
  };
};

export const emptyChave = () => ({
  quantidade: 0,
  observacoes: '',
  fotos: [],
});

export const emptyMedidor = (opcional = false, unidadePadrao = ''): Medidor => ({
  ativo: !opcional,
  numero: '',
  leitura: '',
  unidade: unidadePadrao,
  concessionaria: '',
  observacoes: '',
  fotos: [],
});

// ==========================================
// 5. HELPERS
// ==========================================
export const ambientesFromModel = (modelKeyOrObj: any): Environment[] => {
  const model = typeof modelKeyOrObj === 'string' ? (PROPERTY_MODELS as any)[modelKeyOrObj] : modelKeyOrObj;
  if (!model || !model.ambientes) return [];
  return Object.entries(model.ambientes).map(([nome, itens]) =>
    makeAmbiente(nome, itens as string[])
  );
};

export const withDefaults = (data?: Partial<Inspection>): Inspection => {
  const defaultEnvId = uid();
  const ambientes = data?.ambientes && data.ambientes.length > 0
    ? data.ambientes
    : [{ id: defaultEnvId, nome: 'Sala', name: 'Sala', itens: TEMPLATES.sala.map((n) => makeItem(n)), fotos: [] }];

  return {
    id: data?.id || uid(),
    tipo: data?.tipo || 'Entrada',
    title: data?.title || 'Nova Vistoria',
    dataVistoria: data?.dataVistoria || new Date().toISOString().split('T')[0],
    vistoriador: data?.vistoriador || '',
    mobiliario: data?.mobiliario || 'Vazio',
    status: data?.status || 'Em andamento',
    capaFoto: data?.capaFoto || null,
    ambientes,
    imovel: data?.imovel || {},
    medidores: data?.medidores || {
      agua: emptyMedidor(false, 'm³'),
      energia: emptyMedidor(false, 'kWh'),
      gas: emptyMedidor(true, 'm³'),
    },
    chaves: data?.chaves || {
      entrada: emptyChave(),
      garagem: emptyChave(),
      controle: emptyChave(),
      tags: emptyChave(),
      outras: [],
    },
    parecerTecnico: data?.parecerTecnico || { texto: '', anexos: [] },
    signatures: data?.signatures || {},
    createdAt: data?.createdAt || new Date().toISOString(),
  };
};

export const emptyInspection = (): Inspection => withDefaults({});

// ==========================================
// 6. EXEMPLO DE VISTORIA (usado pelo App)
// ==========================================
export const buildExampleInspection = (): Inspection => {
  const agora = new Date();
  const data = agora.toISOString().split('T')[0];

  return withDefaults({
    tipo: 'Entrada',
    title: 'Vistoria de Exemplo',
    dataVistoria: data,
    vistoriador: 'Vistoriador Exemplo',
    mobiliario: 'Vazio',
    ambientes: [
      makeAmbiente('Sala de Estar', ['Teto', 'Parede', 'Piso', 'Porta', 'Janela']),
      makeAmbiente('Cozinha', ['Teto', 'Parede', 'Piso', 'Bancada', 'Pia']),
      makeAmbiente('Quarto', ['Teto', 'Parede', 'Piso', 'Porta', 'Janela']),
      makeAmbiente('Banheiro', ['Teto', 'Parede', 'Piso', 'Vaso', 'Chuveiro']),
    ],
    imovel: {
      cep: '00000-000',
      endereco: 'Rua Exemplo',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      complemento: '',
      metragem: '65 m²',
      proprietario: 'Proprietário Exemplo',
      inquilino: '',
      tipoImovel: 'Apartamento',
    },
  });
};
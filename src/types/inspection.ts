// Central data-model types for VistorIA.
//
// This is a PRAGMATIC typing pass: the goal is to catch real mistakes (typos
// in field names, passing the wrong shape to a function, forgetting a field)
// without being so strict that it gets in the way. Where the original data is
// genuinely open-ended (e.g. a record of arbitrary technical-field values),
// we use flexible types like `Record<string, string>` instead of forcing an
// exact shape.

export type MediaType = "image" | "video" | "audio";

export interface Marca {
  x: number;
  y: number;
}

export interface MarcasComAnotacao {
  points: Marca[];
  comentario: string;
}

// Older saved data stored `marcas` as a plain array of points (no comment).
// Newer data stores `{ points, comentario }`. Code that reads this field
// should handle both — see utils/media.ts normalizePhoto().
export type Marcas = Marca[] | MarcasComAnotacao;

export interface Foto {
  src: string;
  date: string | null;
  type: MediaType;
  marcas?: Marcas;
}

export type Estado = "Novo" | "Bom" | "Regular" | "Ruim" | "Péssimo" | string;

export interface Item {
  id: string;
  nome: string;
  estado: Estado;
  semTeste: boolean;
  observacoes: string;
  temDano: boolean;
  descricaoDano: string;
  fotos: Foto[];
  // Technical field values (Alvenaria, Pintura, Cor, Quantidade, ...) keyed by
  // field key. Left as a flexible string map since the set of fields shown
  // per item varies (see relevantFieldKeys in data/inspectionModel.ts).
  campos: Record<string, string>;
}

export interface Ambiente {
  id: string;
  nome: string;
  fotos: Foto[];
  itens: Item[];
}

export interface Medidor {
  ativo: boolean;
  numero: string;
  leitura: string;
  unidade: string;
  concessionaria: string;
  marca?: string;
  observacoes: string;
  fotos: Foto[];
}

export interface Medidores {
  agua: Medidor;
  energia: Medidor;
  gas: Medidor;
}

export interface Chave {
  quantidade: string;
  observacoes: string;
  fotos: Foto[];
}

export interface ChaveOutra extends Chave {
  id: string;
  nome: string;
}

export interface Chaves {
  entrada: Chave;
  garagem: Chave;
  controle: Chave;
  tags: Chave;
  outras: ChaveOutra[];
}

export interface Imovel {
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
  metragem: string;
  proprietario: string;
  inquilino: string;
  tipoImovel: string;
}

export interface Signatures {
  vistoriador: string | null;
  locador: string | null;
  locatario: string | null;
}

export interface Anexo {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  date: string;
}

export interface ParecerTecnico {
  texto: string;
  anexos: Anexo[];
}

export type StatusVistoria = "Em andamento" | "Finalizada" | string;
export type TipoVistoria = "Entrada" | "Saída" | "Manutenção" | "Rotina" | "Captação" | "Periódica" | string;
export type Mobiliario = "Vazio" | "Mobiliado" | "Semi-mobiliado" | string;

export interface Inspection {
  id: string;
  tipo: TipoVistoria;
  dataVistoria: string;
  vistoriador: string;
  imovel: Imovel;
  mobiliario: Mobiliario;
  status: StatusVistoria;
  capaFoto: Foto | null;
  ambientes: Ambiente[];
  medidores: Medidores;
  chaves: Chaves;
  signatures: Signatures;
  parecerTecnico: ParecerTecnico;
  createdAt: number;
}

// A "recipe" for creating a batch of ambientes at once (built-in property
// models like Casa/Apartamento, or a user-made custom model).
export interface PropertyModel {
  label: string;
  descricao: string;
  ambientes: Record<string, string[]>;
}

export interface CustomModel extends PropertyModel {
  id: string;
}

export interface Agendamento {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  titulo: string;
  observacao: string;
}

export interface ItemFieldDef {
  key: string;
  label: string;
  type?: "number" | "text";
}

export interface FieldRule {
  keywords: string[];
  fields: string[];
}

// Generic helper type for the "functional update" pattern used everywhere in
// this app: onChange(updater) where updater receives the previous value and
// returns the next one, e.g. onChange((item) => ({ ...item, estado: "Bom" })).
export type Updater<T> = (updater: (prev: T) => T) => void;

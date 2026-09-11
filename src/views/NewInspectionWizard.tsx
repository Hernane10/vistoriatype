import React, { useRef, useState } from "react";
import {
  ArrowLeft, Building2, Calendar, Camera, Check, ChevronLeft,
  ChevronRight, FileText, Gauge, KeyRound, Layers, Loader2, PenLine,
  Plus, Printer, SkipForward, X
} from "lucide-react";
import { todayISO } from "../utils/format";
import { fileToDataURL, maybeCompressImage } from "../utils/media";
import { MedidoresTab } from "./DetailView/MedidoresTab";
import { ChavesTab } from "./DetailView/ChavesTab";
import { ParecerTecnicoTab } from "./DetailView/ParecerTecnicoTab";
import { AssinaturaTab } from "./DetailView/AssinaturaTab";
import { ReportView } from "./ReportView";
import { PROPERTY_MODELS, ambientesFromModel, makeAmbiente } from "../data/inspectionModel";
import { AmbienteCard } from "./DetailView/AmbientesTab";
import { getImagemPadrao, getItensPadrao } from "../utils/ambienteHelpers";

// AMBIENTES DISPONÍVEIS PARA SELEÇÃO RÁPIDA
const AMBIENTES_DISPONIVEIS = [
  "Sala de Estar", "Cozinha", "Quarto", "Banheiro",
  "Área de Serviço", "Corredor", "Hall", "Garagem",
  "Área Externa", "Quintal", "Segurança", "Chaves",
  "Medidores", "Instalações"
].map((nome) => ({
  nome,
  label: nome,
  imagem: getImagemPadrao(nome),
}));

const ETAPAS = [
  { id: "dados", label: "Dados", icon: Calendar },
  { id: "ambientes", label: "Ambientes", icon: Layers },
  { id: "medidores", label: "Medidores", icon: Gauge },
  { id: "chaves", label: "Chaves", icon: KeyRound },
  { id: "parecer", label: "Parecer", icon: FileText },
  { id: "assinatura", label: "Assinatura", icon: PenLine },
  { id: "pdf", label: "Laudo / PDF", icon: Printer },
];

export function NewInspectionWizard({ onCancel, onCreate, initialModel, initialDate, initialEndereco }: any) {
  const [etapaAtual, setEtapaAtual] = useState(0);

  // ===== ESTADO DOS DADOS (Etapa 1) =====
  const [form, setForm] = useState({
    tipo: "Entrada",
    dataVistoria: initialDate || todayISO(),
    vistoriador: "",
    mobiliario: "Vazio",
    cep: "",
    endereco: initialEndereco || "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
    metragem: "",
    proprietario: "",
    inquilino: "",
    tipoImovel: (typeof initialModel === "string" && initialModel) || "Apartamento",
  });
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [modelKey, setModelKey] = useState(initialModel || null);
  const [capaFoto, setCapaFoto] = useState<any>(null);
  const capaFileRef = useRef<HTMLInputElement>(null);

  // ===== ESTADO DOS AMBIENTES (Etapa 2) =====
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<string[]>([]);
  const [novoAmbienteNome, setNovoAmbienteNome] = useState("");

  // TOGGLE DE AMBIENTES COM PRÉ-PREENCHIMENTO AUTOMÁTICO DE ITENS
  function toggleAmbienteSelecionado(nome: string) {
    const jaTem = ambientesSelecionados.includes(nome);
    if (jaTem) {
      setAmbientesSelecionados((s) => s.filter((n) => n !== nome));
      setAmbientes((a) => a.filter((amb) => amb.nome !== nome));
    } else {
      const itens = getItensPadrao(nome);
      setAmbientesSelecionados((s) => [...s, nome]);
      setAmbientes((a) => [...a, makeAmbiente(nome, itens)]);
    }
  }

  function adicionarAmbientePersonalizado() {
    const nome = novoAmbienteNome.trim();
    if (!nome || ambientes.some((a) => a.nome === nome)) return;
    const itens = getItensPadrao(nome);
    setAmbientes((a) => [...a, makeAmbiente(nome, itens)]);
    setAmbientesSelecionados((s) => [...s, nome]);
    setNovoAmbienteNome("");
  }

  const removeAmbiente = (id: string) => {
    const amb = ambientes.find((a) => a.id === id);
    if (amb) {
      setAmbientesSelecionados((s) => s.filter((n) => n !== amb.nome));
    }
    setAmbientes((a) => a.filter((x) => x.id !== id));
  };

  const updateAmbiente = (id: string, fn: any) => {
    setAmbientes((a) => a.map((x) => (x.id === id ? fn(x) : x)));
  };

  // ===== MEDIDORES, CHAVES, PARECER E ASSINATURA =====
  const [medidores, setMedidores] = useState<any>({
    agua: { ativo: true, numero: "", leitura: "", unidade: "m³", concessionaria: "", observacoes: "", fotos: [] },
    energia: { ativo: true, numero: "", leitura: "", unidade: "kWh", concessionaria: "", observacoes: "", fotos: [] },
    gas: { ativo: false, numero: "", leitura: "", unidade: "m³", concessionaria: "", observacoes: "", fotos: [] },
  });

  const [chaves, setChaves] = useState<any>({
    entrada: { quantidade: 0, observacoes: "", fotos: [] },
    garagem: { quantidade: 0, observacoes: "", fotos: [] },
    controle: { quantidade: 0, observacoes: "", fotos: [] },
    tags: { quantidade: 0, observacoes: "", fotos: [] },
    outras: [],
  });

  const [parecerTecnico, setParecerTecnico] = useState<any>({ texto: "", anexos: [] });
  const [signatures, setSignatures] = useState<any>({});

  const inspectionTemp = {
    id: "temp",
    tipo: form.tipo,
    dataVistoria: form.dataVistoria,
    vistoriador: form.vistoriador,
    mobiliario: form.mobiliario,
    status: "Em andamento",
    capaFoto,
    ambientes,
    medidores,
    chaves,
    parecerTecnico,
    signatures,
    imovel: { ...form },
  };

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCepBlur() {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepStatus("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { setCepStatus("error"); return; }
      setForm((f) => ({
        ...f,
        endereco: data.logradouro || f.endereco,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        estado: data.uf || f.estado,
        complemento: data.complemento || f.complemento,
      }));
      setCepStatus("ok");
    } catch {
      setCepStatus("error");
    }
  }

  async function handleCapaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await fileToDataURL(await maybeCompressImage(file));
    setCapaFoto({ src, date: new Date().toISOString() });
    e.target.value = "";
  }

  const proxima = () => setEtapaAtual((i) => Math.min(i + 1, ETAPAS.length - 1));
  const voltar = () => setEtapaAtual((i) => Math.max(i - 1, 0));

  function finalizar() {
    onCreate({
      tipo: form.tipo,
      dataVistoria: form.dataVistoria,
      vistoriador: form.vistoriador,
      mobiliario: form.mobiliario,
      capaFoto,
      ambientes: modelKey && ambientes.length === 0 ? ambientesFromModel(modelKey) : ambientes,
      medidores,
      chaves,
      parecerTecnico,
      signatures,
      imovel: { ...form },
    });
  }

  // ============================================
  // VALIDAÇÃO POR ETAPA
  // ============================================
  const canSubmitEtapa1 = form.endereco.trim() && form.vistoriador.trim();

  function podeAvancarEtapa(): boolean {
    switch (etapaAtual) {
      case 0: // Dados
        return canSubmitEtapa1;
      case 1: // Ambientes
        return ambientes.length > 0;
      case 2: // Medidores
        return medidores.agua?.numero || medidores.energia?.numero;
      case 3: // Chaves
        return Object.entries(chaves).some(([k, v]: any) => 
          k !== "outras" && v?.quantidade > 0
        );
      case 4: // Parecer
        return parecerTecnico?.texto?.trim().length > 0;
      case 5: // Assinatura
        return Object.values(signatures || {}).some((s: any) => s);
      case 6: // PDF
        return true;
      default:
        return true;
    }
  }

  const podeAvancar = podeAvancarEtapa();
  const etapa = ETAPAS[etapaAtual];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto px-6 py-6 flex-1 w-full">

        {/* ETAPA 1: DADOS */}
        {etapa.id === "dados" && (
          <>
            {modelKey && (() => {
              const modelObj = typeof modelKey === "string" ? (PROPERTY_MODELS as any)[modelKey] : modelKey;
              if (!modelObj) return null;
              return (
                <div className="rounded-xl px-4 py-3 text-xs flex items-center justify-between gap-2 mb-4" style={{ background: "var(--card-alt)", border: "1px solid var(--accent)" }}>
                  <span>Modelo <strong>{modelObj.label}</strong> — {Object.keys(modelObj.ambientes || {}).length} ambientes serão criados.</span>
                  <button onClick={() => setModelKey(null)} className="btn-ghost rounded-full px-2.5 py-1 shrink-0">Começar em branco</button>
                </div>
              );
            })()}

            <div className="card p-6 mb-4">
              <h2 className="display text-sm font-bold mb-4 flex items-center gap-2"><Camera size={15} /> Foto do imóvel</h2>
              {capaFoto ? (
                <div className="relative w-fit">
                  <img src={capaFoto.src} alt="Capa" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 12, border: "1px solid var(--line)" }} />
                  <button onClick={() => setCapaFoto(null)} className="absolute -top-2 -right-2 rounded-full bg-black/60 text-white flex items-center justify-center" style={{ width: 18, height: 18 }}><X size={11} /></button>
                </div>
              ) : (
                <button onClick={() => capaFileRef.current?.click()} className="btn-ghost rounded-2xl flex flex-col items-center justify-center gap-1 text-xs" style={{ width: 160, height: 110 }}>
                  <Camera size={18} /> Adicionar foto
                </button>
              )}
              <input ref={capaFileRef} type="file" accept="image/*" className="hidden" onChange={handleCapaUpload} />
            </div>

            <div className="card p-6 mb-4">
              <h2 className="display text-sm font-bold mb-4 flex items-center gap-2"><Calendar size={15} /> Dados gerais</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-1.5">Tipo de vistoria</label>
                  <select className="select w-full px-4 py-2.5 text-sm" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                    {["Entrada", "Saída", "Manutenção", "Rotina", "Captação", "Periódica"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label block mb-1.5">Data da vistoria</label>
                  <input type="date" className="input w-full px-4 py-2.5 text-sm" value={form.dataVistoria} onChange={(e) => set("dataVistoria", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="label block mb-1.5">Vistoriador responsável</label>
                  <input className="input w-full px-4 py-2.5 text-sm" placeholder="Nome do vistoriador" value={form.vistoriador} onChange={(e) => set("vistoriador", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="label block mb-1.5">Situação do imóvel</label>
                  <div className="flex gap-2 flex-wrap">
                    {["Vazio", "Mobiliado", "Semi-mobiliado"].map((op) => (
                      <button key={op} type="button" onClick={() => set("mobiliario", op)} className={`tab-btn px-4 py-2 text-sm ${form.mobiliario === op ? "active" : ""}`}>{op}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 mb-6">
              <h2 className="display text-sm font-bold flex items-center gap-2 mb-4"><Building2 size={15} /> Dados do imóvel</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-1.5">CEP</label>
                  <input className="input w-full px-4 py-2.5 text-sm" placeholder="00000-000" value={form.cep} onChange={(e) => set("cep", e.target.value)} onBlur={handleCepBlur} maxLength={9} />
                  {cepStatus === "loading" && <p className="text-xs mt-1 flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Buscando...</p>}
                  {cepStatus === "ok" && <p className="text-xs mt-1" style={{ color: "var(--good)" }}>Endereço preenchido</p>}
                  {cepStatus === "error" && <p className="text-xs mt-1" style={{ color: "var(--bad)" }}>CEP não encontrado</p>}
                </div>
                <div>
                  <label className="label block mb-1.5">Metragem</label>
                  <input className="input w-full px-4 py-2.5 text-sm" placeholder="Ex: 65 m²" value={form.metragem} onChange={(e) => set("metragem", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="label block mb-1.5">Endereço</label>
                  <input className="input w-full px-4 py-2.5 text-sm" value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
                </div>
                <div><label className="label block mb-1.5">Número</label><input className="input w-full px-4 py-2.5 text-sm" value={form.numero} onChange={(e) => set("numero", e.target.value)} /></div>
                <div><label className="label block mb-1.5">Complemento</label><input className="input w-full px-4 py-2.5 text-sm" value={form.complemento} onChange={(e) => set("complemento", e.target.value)} /></div>
                <div><label className="label block mb-1.5">Bairro</label><input className="input w-full px-4 py-2.5 text-sm" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} /></div>
                <div><label className="label block mb-1.5">Cidade</label><input className="input w-full px-4 py-2.5 text-sm" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} /></div>
                <div><label className="label block mb-1.5">Estado</label><input className="input w-full px-4 py-2.5 text-sm" maxLength={2} value={form.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())} /></div>
                <div>
                  <label className="label block mb-1.5">Tipo de imóvel</label>
                  <select className="select w-full px-4 py-2.5 text-sm" value={form.tipoImovel} onChange={(e) => set("tipoImovel", e.target.value)}>
                    {["Apartamento", "Casa", "Kitnet", "Comercial", "Sala comercial", "Galpão"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="label block mb-1.5">Proprietário</label><input className="input w-full px-4 py-2.5 text-sm" value={form.proprietario} onChange={(e) => set("proprietario", e.target.value)} /></div>
                <div className="col-span-2"><label className="label block mb-1.5">Inquilino / responsável</label><input className="input w-full px-4 py-2.5 text-sm" value={form.inquilino} onChange={(e) => set("inquilino", e.target.value)} /></div>
              </div>
            </div>
          </>
        )}

        {/* ETAPA 2: AMBIENTES */}
        {etapa.id === "ambientes" && (
          <div className="space-y-6">
            <div>
              <h2 className="display text-lg font-bold mb-1">Escolha os ambientes</h2>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                Clique nos ambientes que você quer adicionar à vistoria.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AMBIENTES_DISPONIVEIS.map((amb) => {
                const selecionado = ambientesSelecionados.includes(amb.nome);
                return (
                  <button
                    key={amb.nome}
                    type="button"
                    onClick={() => toggleAmbienteSelecionado(amb.nome)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      selecionado
                        ? "border-yellow-400"
                        : "border-transparent hover:border-white/30"
                    }`}
                    style={{
                      background: selecionado
                        ? "rgba(250, 204, 21, 0.15)"
                        : "var(--card-alt)",
                      borderColor: selecionado ? "#facc15" : "var(--line)",
                    }}
                  >
                    {selecionado && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                      <img src={amb.imagem} alt={amb.nome} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight" style={{ color: "var(--ink-strong)" }}>
                      {amb.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {ambientes.length > 0 && (
              <div className="card p-4">
                <h3 className="display font-bold text-sm mb-3">
                  Ambientes escolhidos ({ambientes.length})
                </h3>
                <div className="space-y-3">
                  {ambientes.map((amb, index) => (
                    <AmbienteCard
                      key={amb.id}
                      ambiente={amb}
                      numero={index + 1}
                      locked={false}
                      onRemove={() => removeAmbiente(amb.id)}
                      onChange={(fn: any) => updateAmbiente(amb.id, fn)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Adicionar ambiente personalizado..."
                value={novoAmbienteNome}
                onChange={(e) => setNovoAmbienteNome(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") adicionarAmbientePersonalizado(); }}
                className="input flex-1 px-4 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={adicionarAmbientePersonalizado}
                disabled={!novoAmbienteNome.trim()}
                className="btn-primary rounded-full px-4 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: MEDIDORES */}
        {etapa.id === "medidores" && (
          <MedidoresTab medidores={medidores} locked={false} onChange={(fn: any) => setMedidores((m: any) => fn(m))} />
        )}

        {/* ETAPA 4: CHAVES */}
        {etapa.id === "chaves" && (
          <ChavesTab chaves={chaves} locked={false} onChange={(fn: any) => setChaves((c: any) => fn(c))} />
        )}

        {/* ETAPA 5: PARECER */}
        {etapa.id === "parecer" && (
          <ParecerTecnicoTab parecerTecnico={parecerTecnico} locked={false} onChange={(fn: any) => setParecerTecnico((p: any) => fn(p))} />
        )}

        {/* ETAPA 6: ASSINATURA */}
        {etapa.id === "assinatura" && (
          <AssinaturaTab
            inspection={inspectionTemp}
            locked={false}
            onUpdate={(fn: any) => {
              const novo = fn(inspectionTemp);
              setSignatures(novo.signatures || {});
            }}
          />
        )}

        {/* ETAPA 7: PDF */}
        {etapa.id === "pdf" && (
          <ReportView inspection={inspectionTemp} onUpdate={() => {}} embedded />
        )}
      </div>

      {/* RODAPÉ DE NAVEGAÇÃO */}
      <div
        className="sticky bottom-0 left-0 right-0 border-t"
        style={{ background: "var(--card)", borderColor: "var(--line)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
          {/* BOTÃO VOLTAR */}
          <button
            type="button"
            onClick={voltar}
            disabled={etapaAtual === 0}
            className="btn-ghost rounded-full px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} /> Voltar
          </button>

          {/* BOTÕES DIREITA */}
          <div className="flex items-center gap-2">
            {/* FINALIZAR - sempre visível */}
            <button
              type="button"
              onClick={finalizar}
              className="btn-ghost rounded-full px-4 py-2 text-sm flex items-center gap-2"
              style={{ color: "var(--good)" }}
            >
              <Check size={15} /> Finalizar
            </button>

            {/* AVANÇAR - exceto na última etapa */}
            {etapaAtual < ETAPAS.length - 1 && (
              <button
                type="button"
                onClick={proxima}
                disabled={!podeAvancar}
                className="btn-primary rounded-full px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Avançar <ChevronRight size={15} />
              </button>
            )}

            {/* SALVAR - só na última etapa */}
            {etapaAtual === ETAPAS.length - 1 && (
              <button
                type="button"
                onClick={finalizar}
                className="btn-primary rounded-full px-4 py-2 text-sm flex items-center gap-2"
              >
                <Check size={15} /> Criar Vistoria
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
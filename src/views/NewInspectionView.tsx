// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useRef, useState } from "react";
import { ArrowLeft, Building2, Calendar, Camera, Loader2, X } from "lucide-react";
import { PROPERTY_MODELS, ambientesFromModel } from "../data/inspectionModel";
import { todayISO } from "../utils/format";
import { fileToDataURL, maybeCompressImage } from "../utils/media";

export function NewInspectionView({ onCancel, onCreate, initialModel, initialDate, initialEndereco }) {
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
  const [cepStatus, setCepStatus] = useState("idle"); // idle | loading | ok | error
  const [modelKey, setModelKey] = useState(initialModel || null);
  const [capaFoto, setCapaFoto] = useState(null);
  const capaFileRef = useRef(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCepBlur() {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepStatus("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepStatus("error");
        return;
      }
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

  async function handleCapaUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await fileToDataURL(await maybeCompressImage(file));
    setCapaFoto({ src, date: new Date().toISOString() });
    e.target.value = "";
  }

  function submit() {
    onCreate({
      tipo: form.tipo,
      dataVistoria: form.dataVistoria,
      vistoriador: form.vistoriador,
      mobiliario: form.mobiliario,
      capaFoto,
      ambientes: modelKey ? ambientesFromModel(modelKey) : [],
      imovel: {
        cep: form.cep,
        endereco: form.endereco,
        numero: form.numero,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        complemento: form.complemento,
        metragem: form.metragem,
        proprietario: form.proprietario,
        inquilino: form.inquilino,
        tipoImovel: form.tipoImovel,
      },
    });
  }

  const canSubmit = form.endereco.trim() && form.vistoriador.trim();

  return (
    <div className="min-h-full">
      <div className="topbar px-6 py-5 flex items-center gap-3">
        <button onClick={onCancel} className="btn-ghost rounded-full p-2">
          <ArrowLeft size={18} />
        </button>
        <h1 className="display text-lg font-bold">Nova vistoria</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {modelKey && (() => {
          const modelObj = typeof modelKey === "string" ? PROPERTY_MODELS[modelKey] : modelKey;
          if (!modelObj) return null;
          return (
            <div className="rounded-xl px-4 py-3 text-xs flex items-center justify-between gap-2 mb-4" style={{ background: "var(--card-alt)", border: "1px solid var(--accent)" }}>
              <span style={{ color: "var(--ink-strong)" }}>
                Modelo <strong>{modelObj.label}</strong> selecionado — {Object.keys(modelObj.ambientes || {}).length} ambientes serão criados automaticamente.
              </span>
              <button onClick={() => setModelKey(null)} className="btn-ghost rounded-full px-2.5 py-1 shrink-0">Começar em branco</button>
            </div>
          );
        })()}

        <div className="card p-6 mb-4">
          <h2 className="display text-sm font-bold mb-4 flex items-center gap-2">
            <Camera size={15} /> Foto do imóvel
          </h2>
          {capaFoto ? (
            <div className="relative w-fit">
              <img src={capaFoto.src} alt="Capa" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 12, border: "1px solid var(--line)" }} />
              <button onClick={() => setCapaFoto(null)} className="absolute -top-2 -right-2 rounded-full bg-black/60 text-white flex items-center justify-center" style={{ width: 18, height: 18 }}>
                <X size={11} />
              </button>
            </div>
          ) : (
            <button onClick={() => capaFileRef.current?.click()} className="btn-ghost rounded-2xl flex flex-col items-center justify-center gap-1 text-xs" style={{ width: 160, height: 110 }}>
              <Camera size={18} /> Adicionar foto
            </button>
          )}
          <input ref={capaFileRef} type="file" accept="image/*" className="hidden" onChange={handleCapaUpload} />
        </div>

        <div className="card p-6 mb-4">
          <h2 className="display text-sm font-bold mb-4 flex items-center gap-2">
            <Calendar size={15} /> Dados gerais
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Tipo de vistoria</label>
              <select className="select w-full px-4 py-2.5 text-sm" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                <option>Entrada</option>
                <option>Saída</option>
                <option>Manutenção</option>
                <option>Rotina</option>
                <option>Captação</option>
                <option>Periódica</option>
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
                  <button
                    key={op}
                    type="button"
                    onClick={() => set("mobiliario", op)}
                    className={`tab-btn px-4 py-2 text-sm ${form.mobiliario === op ? "active" : ""}`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="display text-sm font-bold flex items-center gap-2 mb-4">
            <Building2 size={15} /> Dados do imóvel
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">CEP</label>
              <input
                className="input w-full px-4 py-2.5 text-sm"
                placeholder="00000-000"
                value={form.cep}
                onChange={(e) => set("cep", e.target.value)}
                onBlur={handleCepBlur}
                maxLength={9}
              />
              {cepStatus === "loading" && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--ink-soft)" }}><Loader2 size={11} className="animate-spin" /> Buscando endereço...</p>}
              {cepStatus === "ok" && <p className="text-xs mt-1" style={{ color: "var(--good)" }}>Endereço preenchido automaticamente</p>}
              {cepStatus === "error" && <p className="text-xs mt-1" style={{ color: "var(--bad)" }}>CEP não encontrado, preencha manualmente</p>}
            </div>
            <div>
              <label className="label block mb-1.5">Metragem do imóvel</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="Ex: 65 m²" value={form.metragem} onChange={(e) => set("metragem", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label block mb-1.5">Endereço (rua/avenida)</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="Rua, avenida..." value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1.5">Número</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="Nº" value={form.numero} onChange={(e) => set("numero", e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1.5">Complemento (opcional)</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="Apto, bloco..." value={form.complemento} onChange={(e) => set("complemento", e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1.5">Bairro</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="Bairro" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1.5">Cidade</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="Cidade" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1.5">Estado</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="UF" maxLength={2} value={form.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="label block mb-1.5">Tipo de imóvel</label>
              <select className="select w-full px-4 py-2.5 text-sm" value={form.tipoImovel} onChange={(e) => set("tipoImovel", e.target.value)}>
                <option>Apartamento</option>
                <option>Casa</option>
                <option>Kitnet</option>
                <option>Comercial</option>
                <option>Sala comercial</option>
                <option>Galpão</option>
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Proprietário</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="Nome do proprietário" value={form.proprietario} onChange={(e) => set("proprietario", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label block mb-1.5">Inquilino / responsável</label>
              <input className="input w-full px-4 py-2.5 text-sm" placeholder="Nome do inquilino (opcional)" value={form.inquilino} onChange={(e) => set("inquilino", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-ghost rounded-full px-5 py-2.5 text-sm">Cancelar</button>
          <button disabled={!canSubmit} onClick={submit} className="btn-primary rounded-full px-5 py-2.5 text-sm">
            Criar vistoria e continuar
          </button>
        </div>
      </div>
    </div>
  );
}


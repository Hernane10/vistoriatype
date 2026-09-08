// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useState } from "react";
import { ArrowLeft, Layers, Plus, Trash2, Wand2 } from "lucide-react";
import { PROPERTY_MODELS, uid } from "../data/inspectionModel";

export function ModelosTab({ onUseModel, onGenerateExample, customModels, onCreateCustomModel, onDeleteCustomModel }) {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-8">
      <div className="card p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="display text-sm font-bold mb-1">Vistoria de exemplo</h3>
          <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
            Gera uma vistoria completa já preenchida (endereço, ambientes, medidores e chaves) para você ver como fica o resultado final.
          </p>
        </div>
        <button onClick={onGenerateExample} className="btn-primary rounded-full px-4 py-2.5 text-sm flex items-center gap-2 shrink-0">
          <Plus size={16} /> Gerar exemplo
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="display text-sm font-bold">Modelos por tipo de imóvel</h3>
        <button onClick={onCreateCustomModel} className="btn-secondary rounded-full px-3 py-2 text-xs flex items-center gap-1.5">
          <Wand2 size={13} /> Criar meu modelo
        </button>
      </div>
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {Object.entries(PROPERTY_MODELS).map(([key, model]) => (
          <div key={key} className="card p-4 flex flex-col">
            <h4 className="display text-sm font-bold mb-1">{model.label}</h4>
            <p className="text-xs mb-3 flex-1" style={{ color: "var(--ink-soft)" }}>{model.descricao}</p>
            <p className="text-xs mb-3 mono" style={{ color: "var(--ink-faint)" }}>
              {Object.keys(model.ambientes).join(" · ")}
            </p>
            <button onClick={() => onUseModel(key)} className="btn-secondary rounded-full px-3 py-2 text-xs w-fit">
              Usar este modelo
            </button>
          </div>
        ))}
      </div>

      {customModels.length > 0 && (
        <>
          <h3 className="display text-sm font-bold mb-3">Meus modelos</h3>
          <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {customModels.map((model) => (
              <div key={model.id} className="card p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="display text-sm font-bold">{model.label}</h4>
                  <button onClick={() => onDeleteCustomModel(model.id)} className="btn-ghost rounded-full p-1.5 shrink-0" title="Excluir modelo">
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="text-xs mb-3 flex-1" style={{ color: "var(--ink-soft)" }}>{model.descricao}</p>
                <p className="text-xs mb-3 mono" style={{ color: "var(--ink-faint)" }}>
                  {Object.keys(model.ambientes).join(" · ") || "sem ambientes"}
                </p>
                <button onClick={() => onUseModel(model)} className="btn-secondary rounded-full px-3 py-2 text-xs w-fit">
                  Usar este modelo
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>
        Ao escolher um modelo, os ambientes e itens são criados automaticamente — você ainda pode editar, adicionar ou remover qualquer um deles depois.
      </p>
    </div>
  );
}


export function ModelBuilderView({ onCancel, onSave }) {
  const [nome, setNome] = useState("");
  const [ambientes, setAmbientes] = useState([{ id: uid(), nome: "", itensTexto: "" }]);
  const [saving, setSaving] = useState(false);

  function updateAmbiente(id, field, value) {
    setAmbientes((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  function addAmbienteRow() {
    setAmbientes((prev) => [...prev, { id: uid(), nome: "", itensTexto: "" }]);
  }

  function removeAmbienteRow(id) {
    setAmbientes((prev) => prev.filter((a) => a.id !== id));
  }

  const validAmbientes = ambientes.filter((a) => a.nome.trim());
  const canSave = nome.trim() && validAmbientes.length > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const ambientesObj = {};
    validAmbientes.forEach((a) => {
      const itens = a.itensTexto.split(",").map((s) => s.trim()).filter(Boolean);
      ambientesObj[a.nome.trim()] = itens.length > 0 ? itens : ["Estado geral"];
    });
    await onSave({
      id: uid(),
      label: nome.trim(),
      descricao: "Modelo personalizado",
      ambientes: ambientesObj,
    });
    setSaving(false);
  }

  return (
    <div className="min-h-full">
      <div className="topbar px-6 py-5 flex items-center gap-3">
        <button onClick={onCancel} className="btn-ghost rounded-full p-2">
          <ArrowLeft size={18} />
        </button>
        <h1 className="display text-lg font-bold">Criar meu modelo de vistoria</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="card p-6 mb-4">
          <label className="label block mb-1.5">Nome do modelo</label>
          <input className="input w-full px-4 py-2.5 text-sm" placeholder="Ex: Sobrado duplex, Loja de rua..." value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="card p-6 mb-4">
          <h2 className="display text-sm font-bold mb-4 flex items-center gap-2">
            <Layers size={15} /> Ambientes do modelo
          </h2>
          <div className="grid gap-3">
            {ambientes.map((a) => (
              <div key={a.id} className="p-3 rounded-2xl" style={{ border: "1px solid var(--line)", background: "var(--card-alt)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="input flex-1 px-4 py-2 text-sm"
                    placeholder="Nome do ambiente (ex: Sala de Jantar)"
                    value={a.nome}
                    onChange={(e) => updateAmbiente(a.id, "nome", e.target.value)}
                  />
                  {ambientes.length > 1 && (
                    <button onClick={() => removeAmbienteRow(a.id)} className="btn-ghost rounded-full p-2 shrink-0">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <input
                  className="input w-full px-4 py-2 text-sm"
                  placeholder="Itens separados por vírgula (ex: Teto, Parede, Piso, Janela)"
                  value={a.itensTexto}
                  onChange={(e) => updateAmbiente(a.id, "itensTexto", e.target.value)}
                />
              </div>
            ))}
          </div>
          <button onClick={addAmbienteRow} className="btn-ghost rounded-full px-3 py-2 text-xs mt-3 flex items-center gap-1.5">
            <Plus size={13} /> Adicionar ambiente
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-ghost rounded-full px-5 py-2.5 text-sm">Cancelar</button>
          <button disabled={!canSave || saving} onClick={handleSave} className="btn-primary rounded-full px-5 py-2.5 text-sm">
            {saving ? "Salvando..." : "Salvar modelo"}
          </button>
        </div>
      </div>
    </div>
  );
}


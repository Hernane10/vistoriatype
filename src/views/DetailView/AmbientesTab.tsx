// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Layers, MapPin, Plus, Trash2 } from "lucide-react";
import { QuantityStepper, TechFieldPicker } from "../../components/TechField";
import { TextAreaWithDictation } from "../../components/TextAreaWithDictation";
import { PhotoPicker, PhotoThumb } from "../../components/media";
import { FIELD_OPTIONS, ITEM_FIELD_DEFS, PROPERTY_MODELS, TEMPLATES, makeItem, relevantFieldKeys } from "../../data/inspectionModel";
import { filesToPhotos } from "../../utils/media";
// ... outros imports
// ============================================
// IMAGENS PADRÃO POR TIPO DE AMBIENTE
// ============================================
const IMAGENS_PADRAO: Record<string, string> = {
  "sala de estar": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=150&auto=format&fit=crop",
  "sala": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=150&auto=format&fit=crop",
  "cozinha": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&auto=format&fit=crop",
  "quarto": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=150&auto=format&fit=crop",
  "dormitorio": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=150&auto=format&fit=crop",
  "banheiro": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=150&auto=format&fit=crop",
  "lavabo": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&auto=format&fit=crop",
  "area de serviço": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=150&auto=format&fit=crop",
  "lavanderia": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=150&auto=format&fit=crop",
  "corredor": "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=150&auto=format&fit=crop",
  "hall": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=150&auto=format&fit=crop",
  "garagem": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&auto=format&fit=crop",
  "area externa": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=150&auto=format&fit=crop",
  "quintal": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=150&auto=format&fit=crop",
  "varanda": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=150&auto=format&fit=crop",
  "segurança": "https://images.unsplash.com/photo-1558002038-1055907df827?w=150&auto=format&fit=crop",
  "chaves": "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=150&auto=format&fit=crop",
  "medidores": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150&auto=format&fit=crop",
  "instalações": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop",
  "instalacoes": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop",
  "piscina": "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=150&auto=format&fit=crop",
  "escritorio": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop",
  "sala de jantar": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=150&auto=format&fit=crop",
  "closet": "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=150&auto=format&fit=crop",
  "despensa": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=150&auto=format&fit=crop",
  "terraço": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=150&auto=format&fit=crop",
  "terraco": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=150&auto=format&fit=crop",
  "sacada": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=150&auto=format&fit=crop",
  "sotao": "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=150&auto=format&fit=crop",
  "porao": "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=150&auto=format&fit=crop",
  "jardim": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=150&auto=format&fit=crop",
  "telhado": "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=150&auto=format&fit=crop",
  "fachada": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=150&auto=format&fit=crop",
  "deposito": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=150&auto=format&fit=crop",
  "estoque": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=150&auto=format&fit=crop",
  "banheiro social": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=150&auto=format&fit=crop",
  "banheiro suite": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&auto=format&fit=crop",
};

// ============================================
// IMAGEM GENÉRICA (quando não encontra)
// ============================================
const IMAGEM_GENERICA = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop";

// ============================================
// FUNÇÃO PARA PEGAR A IMAGEM PADRÃO
// ============================================
function getImagemPadrao(nomeAmbiente: string): string {
  if (!nomeAmbiente) return IMAGEM_GENERICA;
  const nome = nomeAmbiente.toLowerCase().trim();
  
  // Procura primeiro por correspondência exata
  if (IMAGENS_PADRAO[nome]) return IMAGENS_PADRAO[nome];
  
  // Depois procura por correspondência parcial
  for (const [chave, url] of Object.entries(IMAGENS_PADRAO)) {
    if (nome.includes(chave) || chave.includes(nome)) return url;
  }
  
  // Se não encontrar, retorna a genérica
  return IMAGEM_GENERICA;
}

const ESTADOS = [
  "Novo",
  "Ótimo",
  "Bom",
  "Regular",
  "Ruim",
  "Péssimo",
  "Sem teste"
] as const;

export function AmbientesTab({ inspection, locked, templateOpen, setTemplateOpen, addAmbiente, removeAmbiente, updateAmbiente, applyModel, customModels = [] }) {
  return (
    <>
      {!locked && (
        <div className="mb-6 relative">
          <button onClick={() => setTemplateOpen((v) => !v)} className="btn-secondary rounded-full px-4 py-2.5 text-sm flex items-center gap-2">
            <Layers size={16} /> Adicionar ambiente <ChevronDown size={14} className={templateOpen ? "rotate-180" : ""} />
          </button>
          {templateOpen && (
            <div className="card absolute z-10 mt-2 p-2 w-80 shadow-lg" style={{ maxHeight: 420, overflowY: "auto" }}>
              <p className="label px-3 pt-1 pb-1.5">Ambiente único</p>
              {Object.entries(TEMPLATES).map(([nome, itens]) => (
                <button
                  key={nome}
                  onClick={() => { addAmbiente(nome, itens); setTemplateOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-white/5 flex items-center justify-between"
                  style={{ color: "var(--ink-strong)" }}
                >
                  <span>{nome}</span>
                  <span className="text-xs mono" style={{ color: "var(--ink-soft)" }}>{itens.length} itens</span>
                </button>
              ))}
              <div className="divider my-1" />
              <button
                onClick={() => {
                  const nome = prompt("Nome do ambiente personalizado:");
                  if (nome && nome.trim()) { addAmbiente(nome.trim(), []); }
                  setTemplateOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-white/5 flex items-center gap-2"
                style={{ color: "var(--accent)" }}
              >
                <Plus size={14} /> Ambiente personalizado
              </button>

              <div className="divider my-1" />
              <p className="label px-3 pt-1 pb-1.5">Aplicar modelo pronto (vários ambientes)</p>
              {Object.entries(PROPERTY_MODELS).map(([key, model]) => (
                <button
                  key={key}
                  onClick={() => { applyModel(key); setTemplateOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-white/5 flex items-center justify-between"
                  style={{ color: "var(--ink-strong)" }}
                >
                  <span>{model.label}</span>
                  <span className="text-xs mono" style={{ color: "var(--ink-soft)" }}>{Object.keys(model.ambientes).length} ambientes</span>
                </button>
              ))}
              {customModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => { applyModel(model); setTemplateOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-white/5 flex items-center justify-between"
                  style={{ color: "var(--ink-strong)" }}
                >
                  <span>{model.label} <span style={{ color: "var(--ink-faint)" }}>(meu modelo)</span></span>
                  <span className="text-xs mono" style={{ color: "var(--ink-soft)" }}>{Object.keys(model.ambientes).length} ambientes</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

{inspection.ambientes.length === 0 ? (
  <div className="card p-10 text-center rounded-2xl" style={{ background: "#252836", border: "1px solid #323546" }}>
    <MapPin size={30} className="mx-auto mb-2 text-gray-400" />
    <p className="text-sm text-gray-400">
      Nenhum ambiente adicionado. Use um modelo pronto ou crie um ambiente personalizado.
    </p>
  </div>
) : (
  <div className="flex flex-col gap-3">
    {inspection.ambientes.map((amb, idx) => (
      <AmbienteCard
        key={amb.id}
        ambiente={amb}
        numero={idx + 1}
        locked={locked}
        onRemove={() => removeAmbiente(amb.id)}
        onChange={(fn) => updateAmbiente(amb.id, fn)}
      />
    ))}
  </div>
)}    </>
  );
}


export function AmbienteCard({ ambiente, numero, locked, onRemove, onChange }) {
  const [open, setOpen] = useState(false);
  const fotosAmbiente = ambiente.fotos || [];
const fotoCapa = fotosAmbiente[0]?.src || getImagemPadrao(ambiente.nome);
  function addItem() {
    const nome = prompt("Nome do item:");
    if (!nome || !nome.trim()) return;
    onChange((a) => ({ ...a, itens: [...a.itens, makeItem(nome.trim())] }));
  }

  function updateItem(itemId, fn) {
    onChange((a) => ({ ...a, itens: a.itens.map((it) => (it.id === itemId ? fn(it) : it)) }));
  }

  function removeItem(itemId) {
    onChange((a) => ({ ...a, itens: a.itens.filter((it) => it.id !== itemId) }));
  }

  async function handleAddFotosAmbiente(files) {
    const photos = await filesToPhotos(files);
    onChange((a) => ({ ...a, fotos: [...(a.fotos || []), ...photos] }));
  }

  function removeFotoAmbiente(idx) {
    onChange((a) => ({ ...a, fotos: (a.fotos || []).filter((_, i) => i !== idx) }));
  }

  const avariasAmb = ambiente.itens.filter((i) => i.temDano).length;

  return (
    <div 
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "#252A34", border: "1px solid #2E3440" }}
    >
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-800">
          <img 
            src={fotoCapa} 
            alt={ambiente.nome} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">
            Ambiente {numero} {ambiente.nome}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">
            {ambiente.itens.length} {ambiente.itens.length === 1 ? "item" : "itens"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {avariasAmb > 0 && (
            <span className="badge badge-bad px-2 py-0.5 text-xs rounded-full">
              {avariasAmb} avaria(s)
            </span>
          )}

          <span className="text-white font-semibold text-sm px-1">
            {ambiente.itens.length}
          </span>

          {!locked && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }} 
              className="p-1.5 text-gray-400 hover:text-red-400 rounded-full transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}

          {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="p-4 border-t border-[#2E3440]" style={{ background: "#1E222B" }}>
          <div className="mb-4 p-3 rounded-xl border border-dashed border-gray-700">
            <p className="label mb-2 text-xs text-gray-400">Fotos e vídeos gerais do ambiente</p>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {fotosAmbiente.map((foto, idx) => (
                <PhotoThumb
                  key={idx}
                  foto={foto}
                  onRemove={!locked ? () => removeFotoAmbiente(idx) : null}
                  onUpdate={!locked ? (marcas) => onChange((a) => ({ ...a, fotos: (a.fotos || []).map((f, i) => (i === idx ? { ...f, marcas } : f)) })) : null}
                />
              ))}
            </div>
            {!locked && <PhotoPicker onAdd={handleAddFotosAmbiente} small />}
          </div>

          <div className="grid gap-3">
            {ambiente.itens.map((item) => (
              <ItemRow key={item.id} item={item} locked={locked} onChange={(fn) => updateItem(item.id, fn)} onRemove={() => removeItem(item.id)} />
            ))}
          </div>
          {!locked && (
            <button onClick={addItem} className="btn-ghost rounded-full px-3 py-2 text-xs mt-3 flex items-center gap-1.5 text-gray-300">
              <Plus size={13} /> Adicionar item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
// A technical field shown minimized (label + current value in one row) with a
// button/chevron that opens a picker of pre-filled options (or a custom text
// input if nothing listed fits) — instead of an always-open input.
// Persists custom additions/removals to a field's pick-list so "+ Adicionar"
// and deleting an option are remembered across the whole app (not just this item).


export function ItemRow({ item, locked, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const campos = item.campos || Object.fromEntries(ITEM_FIELD_DEFS.map((f) => [f.key, ""]));
  const camposPreenchidos = ITEM_FIELD_DEFS.filter((f) => campos[f.key]).length;
  const estadoLabel = item.semTeste ? "Sem teste" : item.estado;
  const relevantKeys = relevantFieldKeys(item.nome);
  const visibleFields = showAllFields ? ITEM_FIELD_DEFS : ITEM_FIELD_DEFS.filter((f) => relevantKeys.includes(f.key));
  const hiddenCount = ITEM_FIELD_DEFS.length - visibleFields.length;

  async function handleAddPhotos(files) {
    const photos = await filesToPhotos(files);
    onChange((it) => ({ ...it, fotos: [...it.fotos, ...photos] }));
  }

  function removePhoto(idx) {
    onChange((it) => ({ ...it, fotos: it.fotos.filter((_, i) => i !== idx) }));
  }

return (
  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--card-alt)" }}>
    <div className="flex items-center gap-2 px-4 py-3 cursor-pointer" onClick={() => setOpen((v) => !v)}>
      {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      <span className="font-semibold text-sm flex-1" style={{ color: "var(--item-name)" }}>{item.nome}</span>
      
      <span className={`badge px-2.5 py-1 text-xs rounded-full font-semibold ${
  item.semTeste ? "bg-white text-gray-700 border border-gray-300" :
  item.estado === "Novo" ? "bg-black text-white" :
  item.estado === "Ótimo" ? "bg-green-600 text-white" :
  item.estado === "Bom" ? "bg-blue-600 text-white" :
  item.estado === "Regular" ? "bg-yellow-500 text-black" :
  item.estado === "Ruim" ? "bg-red-600 text-white" :
  item.estado === "Péssimo" ? "bg-red-900 text-white" :
  "bg-gray-400 text-white"
}`}>
  {estadoLabel}
</span>

      {item.temDano && <AlertTriangle size={14} style={{ color: "var(--bad)" }} />}
      {item.fotos.length > 0 && <span className="text-xs mono" style={{ color: "var(--ink-soft)" }}>{item.fotos.length} mídia(s)</span>}
      {!locked && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="btn-ghost rounded-full p-1.5">
          <Trash2 size={13} />
        </button>
      )}
    </div>

    {!open && camposPreenchidos > 0 && (
      <p className="text-xs px-4 pb-3 pt-2" style={{ color: "var(--ink-soft)", borderTop: "1px solid var(--line)" }}>
        {ITEM_FIELD_DEFS.filter((f) => campos[f.key]).map((f) => `${f.label}: ${campos[f.key]}`).join(" · ")}
      </p>
    )}

    {open && (
      <div className="px-4 pb-4">
        {/* ===== BOTÕES DE ESTADO ===== */}
        <div className="flex gap-2 flex-wrap mb-2">
          {ESTADOS.map((e) => {
            const isSelected = e === "Sem teste" ? item.semTeste : (!item.semTeste && item.estado === e);
            let corClasse = "bg-white/10 text-white/70 hover:bg-white/20 border-transparent";

            if (isSelected) {
              switch (e) {
                case "Novo": corClasse = "bg-black text-white border-black"; break;
                case "Ótimo": corClasse = "bg-green-600 text-white border-green-600"; break;
                case "Bom": corClasse = "bg-blue-600 text-white border-blue-600"; break;
                case "Regular": corClasse = "bg-yellow-500 text-black border-yellow-500"; break;
                case "Ruim": corClasse = "bg-red-600 text-white border-red-600"; break;
                case "Péssimo": corClasse = "bg-red-900 text-white border-red-900"; break;
                case "Sem teste": corClasse = "bg-white text-gray-700 border-gray-300"; break;
              }
            }

            return (
              <button
                key={e}
                disabled={locked}
                onClick={() => {
                  if (e === "Sem teste") {
                    onChange((it) => ({ ...it, semTeste: true, estado: null }));
                  } else {
                    onChange((it) => ({ ...it, estado: e, semTeste: false }));
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap shrink-0 transition-all border ${corClasse}`}
              >
                {e}
              </button>
            );
          })}
        </div>

        {/* ===== CAMPOS ===== */}
        <div className="grid gap-2 mb-2">
          {visibleFields.map((f) =>
            f.type === "number" ? (
              <QuantityStepper
                key={f.key}
                label={f.label}
                value={campos[f.key]}
                disabled={locked}
                onChange={(val) => onChange((it) => ({ ...it, campos: { ...(it.campos || {}), [f.key]: val } }))}
              />
            ) : (
              <TechFieldPicker
                key={f.key}
                fieldKey={f.key}
                label={f.label}
                value={campos[f.key]}
                options={FIELD_OPTIONS[f.key]}
                disabled={locked}
                onChange={(val) => onChange((it) => ({ ...it, campos: { ...(it.campos || {}), [f.key]: val } }))}
              />
            )
          )}
        </div>

        {!locked && hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAllFields((v) => !v)}
            className="btn-ghost rounded-full px-3 py-1.5 text-xs mb-3 flex items-center gap-1.5"
          >
            {showAllFields ? <><ChevronDown size={12} className="rotate-180" /> Mostrar só os campos relevantes</> : <><Plus size={12} /> Mostrar mais {hiddenCount} campo(s)</>}
          </button>
        )}

        <TextAreaWithDictation
          disabled={locked}
          className="px-4 py-2.5"
          rows={2}
          placeholder="Observação..."
          value={item.observacoes}
          onChange={(val) => onChange((it) => ({ ...it, observacoes: val }))}
        />

        <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={locked}
            checked={item.temDano}
            onChange={(e) => onChange((it) => ({ ...it, temDano: e.target.checked }))}
          />
          <span className="flex items-center gap-1" style={{ color: item.temDano ? "var(--bad)" : "var(--ink-soft)" }}>
            <AlertTriangle size={13} /> Registrar avaria
          </span>
        </label>

        {item.temDano && (
          <div className="mt-2">
            <TextAreaWithDictation
              disabled={locked}
              className="px-4 py-2.5"
              rows={2}
              placeholder="Descreva a avaria encontrada..."
              style={{ borderColor: "var(--bad)" }}
              value={item.descricaoDano}
              onChange={(val) => onChange((it) => ({ ...it, descricaoDano: val }))}
            />
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {item.fotos.map((foto, idx) => (
            <PhotoThumb
              key={idx}
              foto={foto}
              onRemove={!locked ? () => removePhoto(idx) : null}
              onUpdate={!locked ? (marcas) => onChange((it) => ({ ...it, fotos: it.fotos.map((f, i) => (i === idx ? { ...f, marcas } : f)) })) : null}
            />
          ))}
        </div>
        {!locked && <div className="mt-2"><PhotoPicker onAdd={handleAddPhotos} small /></div>}
      </div>
    )}
  </div>
);
}
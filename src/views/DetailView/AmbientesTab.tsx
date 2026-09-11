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
// IMPORTS DAS IMAGENS DOS AMBIENTES
// ============================================
import imgAreaServico from "../../assets/ambientes/areadeservico.jpg";
import imgAreaExterna from "../../assets/ambientes/areaexterna.jpg";
import imgBanheiro from "../../assets/ambientes/banheiro.jpg";
import imgChaves from "../../assets/ambientes/chaves.jpg";
import imgCorredor from "../../assets/ambientes/corredor.jpg";
import imgCozinha from "../../assets/ambientes/cozinha.jpg";
import imgGaragem from "../../assets/ambientes/garagem.jpg";
import imgHall from "../../assets/ambientes/hall.jpg";
import imgInstalacoes from "../../assets/ambientes/instalacoes.jpg";
import imgMedidores from "../../assets/ambientes/medidores.jpg";
import imgQuarto from "../../assets/ambientes/quarto.jpg";
import imgQuintal from "../../assets/ambientes/quintal.jpg";
import imgSalaDeEstar from "../../assets/ambientes/saladeestar.jpg";
import imgSeguranca from "../../assets/ambientes/seguranca.jpg";

// ============================================
// MAPEAMENTO DE IMAGENS POR TIPO DE AMBIENTE
// ============================================
const IMAGENS_PADRAO: Record<string, string> = {
  "area de servico": imgAreaServico,
  "areadeservico": imgAreaServico,
  "area externa": imgAreaExterna,
  "areaexterna": imgAreaExterna,
  "banheiro": imgBanheiro,
  "chaves": imgChaves,
  "corredor": imgCorredor,
  "cozinha": imgCozinha,
  "garagem": imgGaragem,
  "hall": imgHall,
  "instalacoes": imgInstalacoes,
  "medidores": imgMedidores,
  "quarto": imgQuarto,
  "quintal": imgQuintal,
  "sala de estar": imgSalaDeEstar,
  "saladeestar": imgSalaDeEstar,
  "sala": imgSalaDeEstar,
  "seguranca": imgSeguranca,
};

// ============================================
// IMAGEM GENÉRICA (quando não encontra)
// ============================================
const IMAGEM_GENERICA = imgSalaDeEstar;
 
// ============================================
// FUNÇÃO PARA PEGAR A IMAGEM PADRÃO (MAIS PRECISA)
// ============================================
function getImagemPadrao(nomeAmbiente: string): string {
  if (!nomeAmbiente) return IMAGEM_GENERICA;
  
  // Normaliza: minúsculo, sem acentos, sem espaços extras
  const nome = nomeAmbiente
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ");            // normaliza espaços

  // ===== CORRESPONDÊNCIA EXATA (prioridade máxima) =====
  const mapaExato: Record<string, string> = {
    "sala de estar": imgSalaDeEstar,
    "sala": imgSalaDeEstar,
    "saladeestar": imgSalaDeEstar,
    "cozinha": imgCozinha,
    "quarto": imgQuarto,
    "banheiro": imgBanheiro,
    "lavabo": imgBanheiro,        // lavabo usa imagem de banheiro
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

  // ===== 1. TENTA CORRESPONDÊNCIA EXATA =====
  if (mapaExato[nome]) return mapaExato[nome];

  // ===== 2. TENTA CORRESPONDÊNCIA PARCIAL (COM PRIORIDADE POR PALAVRA-CHAVE) =====
  // Ordem importa: palavras mais específicas primeiro
  const palavrasChave: [string, string][] = [
    ["area de servico", imgAreaServico],
    ["area externa", imgAreaExterna],
    ["sala de estar", imgSalaDeEstar],
    ["sala", imgSalaDeEstar],
    ["cozinha", imgCozinha],
    ["quarto", imgQuarto],
    ["dormitorio", imgQuarto],
    ["banheiro", imgBanheiro],
    ["lavabo", imgBanheiro],
    ["corredor", imgCorredor],
    ["hall", imgHall],
    ["garagem", imgGaragem],
    ["quintal", imgQuintal],
    ["seguranca", imgSeguranca],
    ["chaves", imgChaves],
    ["medidores", imgMedidores],
    ["instalacoes", imgInstalacoes],
  ];

  for (const [chave, url] of palavrasChave) {
    if (nome.includes(chave)) return url;
  }

  // ===== 3. SE NÃO ENCONTROU, USA GENÉRICA =====
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
{/* Header do Card */}
<div 
  className="flex items-center gap-3 p-3 cursor-pointer select-none"
  onClick={() => setOpen((v) => !v)}
>
  {/* Thumbnail da foto com número em cima */}
  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-800">
    <img 
      src={fotoCapa} 
      alt={ambiente.nome} 
      className="w-full h-full object-cover"
    />
    {/* Número do ambiente como ícone em cima da imagem */}
    <div 
      className="absolute top-1 left-1 flex items-center justify-center rounded-full font-bold text-white"
      style={{
        width: 22,
        height: 22,
        background: "var(--accent, #e11d48)",
        fontSize: 11,
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
      }}
    >
      {String(numero).padStart(2, "0")}
    </div>
  </div>

  {/* Nome do ambiente (sem "Ambiente X") */}
  <div className="flex-1 min-w-0">
    <h3 className="text-white font-medium text-sm truncate">
      {ambiente.nome}
    </h3>
  </div>

  {/* Lado Direito: quantidade de itens, avarias e ações */}
  <div className="flex items-center gap-3 shrink-0">
    {avariasAmb > 0 && (
      <span className="badge badge-bad px-2 py-0.5 text-xs rounded-full">
        {avariasAmb} avaria(s)
      </span>
    )}

    {/* Quantidade de itens no final */}
    <span className="text-gray-300 text-xs">
      {ambiente.itens.length} {ambiente.itens.length === 1 ? "item" : "itens"}
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
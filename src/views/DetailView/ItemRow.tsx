import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { QuantityStepper, TechFieldPicker } from "../../components/TechField";
import { TextAreaWithDictation } from "../../components/TextAreaWithDictation";
import { PhotoPicker, PhotoThumb } from "../../components/media";
import { FIELD_OPTIONS, ITEM_FIELD_DEFS, relevantFieldKeys } from "../../data/inspectionModel";
import { filesToPhotos } from "../../utils/media";

const ESTADOS = [
  "Novo", "Ótimo", "Bom", "Regular", "Ruim", "Péssimo", "Sem teste"
] as const;

export function ItemRow({ item, locked, onChange, onRemove }: any) {
  const [open, setOpen] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);

  const campos = item.campos || Object.fromEntries(ITEM_FIELD_DEFS.map((f: any) => [f.key, ""]));
  const camposPreenchidos = ITEM_FIELD_DEFS.filter((f: any) => campos[f.key]).length;
  const estadoLabel = item.semTeste ? "Sem teste" : item.estado;
  const relevantKeys = relevantFieldKeys(item.nome || "");
  const visibleFields = showAllFields
    ? ITEM_FIELD_DEFS
    : ITEM_FIELD_DEFS.filter((f: any) => relevantKeys.includes(f.key));
  const hiddenCount = ITEM_FIELD_DEFS.length - visibleFields.length;

  async function handleAddPhotos(files: any) {
    const photos = await filesToPhotos(files);
    onChange((it: any) => ({ ...it, fotos: [...(it.fotos || []), ...photos] }));
  }

  function removePhoto(idx: number) {
    onChange((it: any) => ({ ...it, fotos: (it.fotos || []).filter((_: any, i: number) => i !== idx) }));
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--line)", background: "var(--card)" }}
    >
      {/* CABEÇALHO */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        <span 
  className="font-semibold text-sm flex-1 min-w-0 break-words" 
  style={{ color: "var(--ink-strong)", wordBreak: "break-word" }}
>
  {item.nome}
</span>

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
        {item.fotos && item.fotos.length > 0 && (
          <span className="text-xs mono" style={{ color: "var(--ink-soft)" }}>
            {item.fotos.length} mídia(s)
          </span>
        )}
        {!locked && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="btn-ghost rounded-full p-1.5"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* CAMPOS PREENCHIDOS (fechado) */}
      {!open && camposPreenchidos > 0 && (
        <p className="text-xs px-4 pb-3 pt-2" style={{ color: "var(--ink-soft)", borderTop: "1px solid var(--line)" }}>
          {ITEM_FIELD_DEFS.filter((f: any) => campos[f.key]).map((f: any) => `${f.label}: ${campos[f.key]}`).join(" · ")}
        </p>
      )}

      {/* CONTEÚDO EXPANDIDO */}
      {open && (
        <div className="px-4 pb-4">
          {/* BOTÕES DE ESTADO */}
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 mb-2">
            {ESTADOS.map((e) => {
              const isSelected = e === "Sem teste" ? item.semTeste : (!item.semTeste && item.estado === e);
              let corClasse = "border-transparent";
              let corFundo = "rgba(128,128,128,0.15)";
              let corTexto = "var(--ink-soft)";

              if (isSelected) {
                switch (e) {
                  case "Novo":     corFundo = "#000"; corTexto = "#fff"; break;
                  case "Ótimo":    corFundo = "#16a34a"; corTexto = "#fff"; break;
                  case "Bom":      corFundo = "#2563eb"; corTexto = "#fff"; break;
                  case "Regular":  corFundo = "#eab308"; corTexto = "#000"; break;
                  case "Ruim":     corFundo = "#dc2626"; corTexto = "#fff"; break;
                  case "Péssimo":  corFundo = "#7f1d1d"; corTexto = "#fff"; break;
                  case "Sem teste":corFundo = "#fff"; corTexto = "#333"; break;
                }
              }

              return (
                <button
                  key={e}
                  disabled={locked}
                  onClick={() => {
                    if (e === "Sem teste") {
                      onChange((it: any) => ({ ...it, semTeste: true, estado: null }));
                    } else {
                      onChange((it: any) => ({ ...it, estado: e, semTeste: false }));
                    }
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap shrink-0 transition-all border ${corClasse}`}
                  style={{
                    background: corFundo,
                    color: corTexto,
                    borderColor: isSelected ? corFundo : "var(--line)",
                  }}
                >
                  {e}
                </button>
              );
            })}
          </div>

          {/* CAMPOS */}
          <div className="grid gap-2 mb-2">
            {visibleFields.map((f: any) =>
              f.type === "number" ? (
                <QuantityStepper
                  key={f.key}
                  label={f.label}
                  value={campos[f.key]}
                  disabled={locked}
                  onChange={(val: any) => onChange((it: any) => ({ ...it, campos: { ...(it.campos || {}), [f.key]: val } }))}
                />
              ) : (
                <TechFieldPicker
                  key={f.key}
                  fieldKey={f.key}
                  label={f.label}
                  value={campos[f.key]}
                  options={FIELD_OPTIONS[f.key]}
                  disabled={locked}
                  onChange={(val: any) => onChange((it: any) => ({ ...it, campos: { ...(it.campos || {}), [f.key]: val } }))}
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
              {showAllFields ? (
                <><ChevronDown size={12} className="rotate-180" /> Mostrar só os campos relevantes</>
              ) : (
                <><Plus size={12} /> Mostrar mais {hiddenCount} campo(s)</>
              )}
            </button>
          )}

          <TextAreaWithDictation
            disabled={locked}
            className="px-4 py-2.5"
            rows={2}
            placeholder="Observação..."
            value={item.observacoes}
            onChange={(val: any) => onChange((it: any) => ({ ...it, observacoes: val }))}
          />

          <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer select-none" style={{ color: "var(--ink-soft)" }}>
            <input
              type="checkbox"
              disabled={locked}
              checked={item.temDano || false}
              onChange={(e) => onChange((it: any) => ({ ...it, temDano: e.target.checked }))}
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
                onChange={(val: any) => onChange((it: any) => ({ ...it, descricaoDano: val }))}
              />
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {(item.fotos || []).map((foto: any, idx: number) => (
              <PhotoThumb
                key={idx}
                foto={foto}
                onRemove={!locked ? () => removePhoto(idx) : null}
                onUpdate={!locked ? (marcas: any) => onChange((it: any) => ({
                  ...it,
                  fotos: it.fotos.map((f: any, i: number) => (i === idx ? { ...f, marcas } : f))
                })) : null}
              />
            ))}
          </div>
          {!locked && <div className="mt-2"><PhotoPicker onAdd={handleAddPhotos} small /></div>}
        </div>
      )}
    </div>
  );
}
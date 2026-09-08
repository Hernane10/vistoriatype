// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useEffect, useState, type MouseEvent } from "react";
import { ChevronDown, Pencil, Plus, X } from "lucide-react";
import { storage } from "../lib/storage";
import { PromptModal } from "./PromptModal";

export function useFieldOptionsStore(fieldKey: string) {
  const [added, setAdded] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!fieldKey) return;
    (async () => {
      try {
        const r = await storage.get(`field-opts:${fieldKey}`);
        if (r) {
          const data = JSON.parse(r.value);
          setAdded(data.added || []);
          setRemoved(data.removed || []);
        }
      } catch {
        // no custom options saved yet
      }
      setLoaded(true);
    })();
  }, [fieldKey]);

  function persist(nextAdded: string[], nextRemoved: string[]) {
    storage.set(`field-opts:${fieldKey}`, JSON.stringify({ added: nextAdded, removed: nextRemoved })).catch(() => {});
  }

  function addOption(text: string) {
    setAdded((prev) => {
      if (prev.includes(text)) return prev;
      const next = [...prev, text];
      persist(next, removed);
      return next;
    });
  }

  function removeOption(text: string) {
    setRemoved((prev) => {
      if (prev.includes(text)) return prev;
      const next = [...prev, text];
      persist(added, next);
      return next;
    });
    setAdded((prev) => prev.filter((o) => o !== text));
  }

  function renameOption(oldText: string | null, newText: string) {
    const clean = newText.trim();
    if (!clean || clean === oldText || oldText === null) return;
    const nextRemoved = removed.includes(oldText) ? removed : [...removed, oldText];
    const nextAdded = [...added.filter((o) => o !== oldText), clean];
    setRemoved(nextRemoved);
    setAdded(nextAdded);
    persist(nextAdded, nextRemoved);
  }

  return { added, removed, addOption, removeOption, renameOption, loaded };
}

interface TechFieldPickerProps {
  fieldKey: string;
  label: string;
  value: string;
  options?: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}

export function TechFieldPicker({ fieldKey, label, value, options, disabled, onChange }: TechFieldPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const { added, removed, addOption, removeOption, renameOption } = useFieldOptionsStore(fieldKey);

  const allOptions = [...(options || []).filter((o) => !removed.includes(o)), ...added];

  function handleAddOption(e: MouseEvent) {
    e.stopPropagation();
    setAddModalOpen(true);
  }

  function submitAddOption(texto: string) {
    addOption(texto);
    setAddModalOpen(false);
    setExpanded(true);
  }

  function submitRenameOption(texto: string) {
    if (texto !== renameTarget) {
      renameOption(renameTarget, texto);
      if (value === renameTarget) onChange(texto);
    }
    setRenameTarget(null);
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--card)" }}>
      <div className="flex items-center justify-between gap-2 px-3 pt-2.5" style={{ minHeight: 30 }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left min-w-0"
        >
          {!disabled && <ChevronDown size={13} className={expanded ? "rotate-180" : ""} style={{ color: "var(--accent)", flexShrink: 0 }} />}
          <span className="text-xs font-bold uppercase tracking-wide truncate" style={{ color: "var(--field-label)" }}>Detalhes {label}</span>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          {!disabled && allOptions.length > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); setEditMode((v) => !v); }} className="btn-ghost rounded-full p-1" title="Editar opções">
              <Pencil size={11} />
            </button>
          )}
          {!disabled && (
            <button type="button" onClick={handleAddOption} className="btn-secondary rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
              <Plus size={11} /> Adicionar
            </button>
          )}
        </div>
      </div>
      <div className="px-3 pb-2.5 pt-1">
        {value ? (
          <p className="text-xs">
            <span style={{ color: "var(--ink-soft)" }}>Valor: </span>
            <span className="font-semibold" style={{ color: "var(--ink-strong)" }}>{value}</span>
          </p>
        ) : (
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Nenhum valor selecionado</p>
        )}
      </div>
      {expanded && !disabled && (
        <div className="px-3 pb-3">
          {allOptions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allOptions.map((o) => (
                <div key={o} className="relative">
                  <button
                    type="button"
                    onClick={() => { if (editMode) { setRenameTarget(o); } else { onChange(o); setExpanded(false); } }}
                    className={`estado-btn px-2.5 py-1.5 text-xs ${value === o ? "active-Bom" : ""}`}
                    style={editMode ? { paddingRight: 20 } : undefined}
                  >
                    {o}
                    {editMode && <Pencil size={9} className="inline-block ml-1" style={{ verticalAlign: "middle" }} />}
                  </button>
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => { removeOption(o); if (value === o) onChange(""); }}
                      className="absolute rounded-full flex items-center justify-center"
                      style={{ top: -5, right: -5, width: 16, height: 16, background: "var(--bad)", color: "#fff" }}
                    >
                      <X size={9} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <input
            className="input w-full px-3 py-1.5 text-xs"
            placeholder="Ou digite outro valor..."
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {addModalOpen && (
        <PromptModal
          title={`Nova opção para ${label}`}
          placeholder="Digite a nova opção..."
          confirmLabel="Adicionar"
          onSubmit={submitAddOption}
          onCancel={() => setAddModalOpen(false)}
        />
      )}
      {renameTarget && (
        <PromptModal
          title="Editar opção"
          defaultValue={renameTarget}
          confirmLabel="Salvar"
          onSubmit={submitRenameOption}
          onCancel={() => setRenameTarget(null)}
        />
      )}
    </div>
  );
}

// Numeric field with a +/- stepper, defaulting to 0 ("nenhum") instead of blank.

interface QuantityStepperProps {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function QuantityStepper({ label, value, disabled, onChange }: QuantityStepperProps) {
  const n = value === "" || value === undefined || value === null ? 0 : Number(value) || 0;

  function set(next: number) {
    onChange(String(Math.max(0, next)));
  }

  return (
    <div className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 flex-wrap" style={{ border: "1px solid var(--line)", background: "var(--card)" }}>
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--ink-strong)" }}>{label}</span>
      <div className="flex items-center gap-2">
        {!disabled && n !== 0 && (
          <button type="button" onClick={() => set(0)} className="btn-ghost rounded-full px-2 py-0.5 text-[10px]" title="Zerar (nenhum)">0 / Nenhum</button>
        )}
        <button type="button" disabled={disabled || n <= 0} onClick={() => set(n - 1)} className="btn-ghost rounded-full flex items-center justify-center" style={{ width: 26, height: 26 }}>−</button>
        <span className="text-sm font-semibold mono" style={{ minWidth: 22, textAlign: "center", color: "var(--ink-strong)" }}>{n}</span>
        <button type="button" disabled={disabled} onClick={() => set(n + 1)} className="btn-ghost rounded-full flex items-center justify-center" style={{ width: 26, height: 26 }}>+</button>
      </div>
    </div>
  );
}


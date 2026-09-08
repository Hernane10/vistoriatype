// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useState } from "react";

interface PromptModalProps {
  title: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({ title, placeholder = "", defaultValue = "", confirmLabel = "Salvar", onSubmit, onCancel }: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div
      className="no-print modal-fade"
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(10,11,16,0.85)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div className="card modal-pop p-5" style={{ maxWidth: 360, width: "100%" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="display text-sm font-bold mb-3">{title}</h3>
        <input
          autoFocus
          className="input w-full px-4 py-2.5 text-sm mb-4"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
            if (e.key === "Escape") onCancel();
          }}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost rounded-full px-4 py-2 text-sm">Cancelar</button>
          <button disabled={!value.trim()} onClick={() => onSubmit(value.trim())} className="btn-primary rounded-full px-4 py-2 text-sm">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}


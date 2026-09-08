// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { PenLine } from "lucide-react";
import { SignaturePad } from "../../components/SignaturePad";

export function AssinaturaTab({ inspection, locked, onUpdate }) {
  return (
    <div className="card p-5">
      <h3 className="display text-sm font-bold mb-1 flex items-center gap-2"><PenLine size={15} /> Assinatura digital</h3>
      <p className="text-xs mb-4" style={{ color: "var(--ink-soft)" }}>
        Vistoriador, locador e locatário podem assinar direto na tela — com o dedo ou o mouse. Se preferir, deixe em branco para assinar à caneta depois de imprimir.
      </p>
      <div className="flex gap-6 flex-wrap">
        <SignaturePad
          label="Assinatura do vistoriador"
          value={inspection.signatures?.vistoriador}
          locked={locked}
          onSave={(dataUrl) => onUpdate((insp) => ({ ...insp, signatures: { ...insp.signatures, vistoriador: dataUrl } }))}
        />
        <SignaturePad
          label="Assinatura do locador"
          value={inspection.signatures?.locador}
          locked={locked}
          onSave={(dataUrl) => onUpdate((insp) => ({ ...insp, signatures: { ...insp.signatures, locador: dataUrl } }))}
        />
        <SignaturePad
          label="Assinatura do locatário"
          value={inspection.signatures?.locatario}
          locked={locked}
          onSave={(dataUrl) => onUpdate((insp) => ({ ...insp, signatures: { ...insp.signatures, locatario: dataUrl } }))}
        />
      </div>
    </div>
  );
}


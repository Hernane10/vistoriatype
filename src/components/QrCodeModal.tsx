// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { QrCode, X } from "lucide-react";
import { fichaText, qrCodeUrl } from "../utils/format";
import type { Inspection } from "../types/inspection";

interface QrCodeModalProps {
  inspection: Inspection;
  onClose: () => void;
}

export function QrCodeModal({ inspection, onClose }: QrCodeModalProps) {
  const text = fichaText(inspection);
  return (
    <div
      className="no-print"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(10,11,16,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div className="card p-5" style={{ maxWidth: 320, width: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="display text-sm font-bold flex items-center gap-1.5"><QrCode size={16} /> QR do imóvel</h3>
          <button onClick={onClose} className="btn-ghost rounded-full p-1.5"><X size={14} /></button>
        </div>
        <div className="flex justify-center mb-3">
          <img src={qrCodeUrl(text)} alt="QR code do imóvel" style={{ width: 200, height: 200, borderRadius: 8, background: "#fff", padding: 8 }} />
        </div>
        <p className="text-xs mb-3" style={{ color: "var(--ink-soft)", whiteSpace: "pre-line" }}>{text}</p>
        <p className="text-[10px]" style={{ color: "var(--ink-faint)" }}>
          Ao escanear, aparece a ficha resumida deste imóvel como texto. Cole esse QR no imóvel ou salve a imagem para consulta rápida.
        </p>
      </div>
    </div>
  );
}


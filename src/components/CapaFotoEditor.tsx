// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { fmtDateTime } from "../utils/format";
import { fileToDataURL, maybeCompressImage } from "../utils/media";

export function CapaFotoEditor({ capaFoto, locked, onChange }) {
  const fileRef = useRef(null);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await fileToDataURL(await maybeCompressImage(file));
    onChange({ src, date: new Date().toISOString() });
    e.target.value = "";
  }

  return (
    <div className="mb-4 no-print">
      {capaFoto ? (
        <div className="relative w-fit">
          <img src={capaFoto.src} alt="Foto do imóvel" style={{ width: 140, height: 95, objectFit: "cover", borderRadius: 12, border: "1px solid var(--line)" }} />
          {capaFoto.date && <span className="photo-date" style={{ borderRadius: "0 0 12px 12px" }}>{fmtDateTime(capaFoto.date)}</span>}
          {!locked && (
            <button onClick={() => onChange(null)} className="absolute -top-2 -right-2 rounded-full bg-black/60 text-white flex items-center justify-center" style={{ width: 18, height: 18 }}>
              <X size={11} />
            </button>
          )}
        </div>
      ) : (
        !locked && (
          <button onClick={() => fileRef.current?.click()} className="btn-ghost rounded-2xl flex items-center justify-center gap-1.5 text-xs px-4 py-3">
            <Camera size={15} /> Adicionar foto do imóvel
          </button>
        )
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}


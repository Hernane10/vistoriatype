// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useRef } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { TextAreaWithDictation } from "../../components/TextAreaWithDictation";
import { uid } from "../../data/inspectionModel";
import { fmtDateTime, fmtFileSize } from "../../utils/format";
import { fileToDataURL } from "../../utils/media";

export function ParecerTecnicoTab({ parecerTecnico, locked, onChange }) {
  const fileRef = useRef(null);
  const anexos = parecerTecnico?.anexos || [];

  async function handleAttach(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const novos = await Promise.all(
      files.map(async (f) => ({
        id: uid(),
        nome: f.name,
        tipo: f.type || "arquivo",
        tamanho: f.size,
        data: new Date().toISOString(),
        src: await fileToDataURL(f),
      }))
    );
    onChange((p) => ({ ...p, anexos: [...(p.anexos || []), ...novos] }));
    e.target.value = "";
  }

  function removeAnexo(id) {
    onChange((p) => ({ ...p, anexos: (p.anexos || []).filter((a) => a.id !== id) }));
  }

  return (
    <div className="grid gap-4">
      <div className="card p-5">
        <h3 className="display text-sm font-bold mb-1 flex items-center gap-2"><FileText size={15} /> Parecer técnico</h3>
        <p className="text-xs mb-3" style={{ color: "var(--ink-soft)" }}>
          Escreva uma avaliação técnica geral do imóvel — conclusões, recomendações ou observações que não se encaixam em um item específico.
        </p>
        <TextAreaWithDictation
          disabled={locked}
          className="px-4 py-2.5"
          rows={6}
          placeholder="Escreva aqui o parecer técnico da vistoria..."
          value={parecerTecnico?.texto || ""}
          onChange={(val) => onChange((p) => ({ ...p, texto: val }))}
        />
      </div>

      <div className="card p-5">
        <h3 className="display text-sm font-bold mb-1 flex items-center gap-2"><Upload size={15} /> Anexos</h3>
        <p className="text-xs mb-3" style={{ color: "var(--ink-soft)" }}>
          Anexe qualquer tipo de arquivo — laudos anteriores, plantas, orçamentos, PDFs, planilhas, etc.
        </p>

        {anexos.length > 0 && (
          <div className="grid gap-2 mb-3">
            {anexos.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ border: "1px solid var(--line)", background: "var(--card-alt)" }}>
                <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 34, height: 34, background: "var(--card)" }}>
                  <FileText size={15} style={{ color: "var(--accent)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <a href={a.src} download={a.nome} className="text-sm font-medium truncate block" style={{ color: "var(--ink-strong)" }}>{a.nome}</a>
                  <p className="text-xs mono" style={{ color: "var(--ink-soft)" }}>{fmtFileSize(a.tamanho)} · {fmtDateTime(a.data)}</p>
                </div>
                {!locked && (
                  <button onClick={() => removeAnexo(a.id)} className="btn-ghost rounded-full p-2 shrink-0"><Trash2 size={13} /></button>
                )}
              </div>
            ))}
          </div>
        )}

        {!locked && (
          <>
            <button onClick={() => fileRef.current?.click()} className="btn-ghost rounded-full px-4 py-2.5 text-sm flex items-center gap-2 w-fit">
              <Upload size={14} /> Anexar arquivo
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleAttach} />
          </>
        )}
      </div>
    </div>
  );
}


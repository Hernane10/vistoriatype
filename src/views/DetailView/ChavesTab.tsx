// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { KeyRound, Plus, Trash2 } from "lucide-react";
import { QuantityStepper } from "../../components/TechField";
import { PhotoPicker, PhotoThumb } from "../../components/media";
import { CHAVE_TIPOS, emptyChave, uid } from "../../data/inspectionModel";
import { filesToPhotos } from "../../utils/media";

export function ChaveRow({ label, data, locked, onChange, onRemove }) {
  const fotos = data.fotos || [];

  async function handleAddPhotos(files) {
    const photos = await filesToPhotos(files);
    onChange((d) => ({ ...d, fotos: [...(d.fotos || []), ...photos] }));
  }

  function removePhoto(idx) {
    onChange((d) => ({ ...d, fotos: (d.fotos || []).filter((_, i) => i !== idx) }));
  }

  return (
    <div className="card p-4 flex flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <KeyRound size={15} style={{ color: "var(--accent)" }} />
        <span className="font-medium text-sm" style={{ color: "var(--ink-strong)" }}>{label}</span>
      </div>
      <div style={{ width: 150 }}>
        <QuantityStepper label="Qtd." value={data.quantidade} disabled={locked} onChange={(val) => onChange((d) => ({ ...d, quantidade: val }))} />
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="label block mb-1">Observação</label>
        <input disabled={locked} className="input w-full px-4 py-2 text-sm" placeholder="—" value={data.observacoes} onChange={(e) => onChange((d) => ({ ...d, observacoes: e.target.value }))} />
      </div>
      {onRemove && !locked && (
        <button onClick={onRemove} className="btn-ghost rounded-full p-2 self-end">
          <Trash2 size={14} />
        </button>
      )}
      <div className="w-full flex items-center gap-2 flex-wrap">
        {fotos.map((foto, idx) => (
          <PhotoThumb
            key={idx}
            foto={foto}
            size={50}
            onRemove={!locked ? () => removePhoto(idx) : null}
            onUpdate={!locked ? (marcas) => onChange((d) => ({ ...d, fotos: (d.fotos || []).map((f, i) => (i === idx ? { ...f, marcas } : f)) })) : null}
          />
        ))}
        {!locked && <PhotoPicker onAdd={handleAddPhotos} small />}
      </div>
    </div>
  );
}


export function ChavesTab({ chaves, locked, onChange }) {
  function addOutra() {
    const nome = prompt("Nome da chave/item:");
    if (!nome || !nome.trim()) return;
    onChange((c) => ({ ...c, outras: [...c.outras, { id: uid(), nome: nome.trim(), ...emptyChave() }] }));
  }

  function updateOutra(id, fn) {
    onChange((c) => ({ ...c, outras: c.outras.map((o) => (o.id === id ? fn(o) : o)) }));
  }

  function removeOutra(id) {
    onChange((c) => ({ ...c, outras: c.outras.filter((o) => o.id !== id) }));
  }

  return (
    <div className="grid gap-3">
      {CHAVE_TIPOS.map((t) => (
        <ChaveRow
          key={t.key}
          label={t.label}
          data={chaves[t.key]}
          locked={locked}
          onChange={(fn) => onChange((c) => ({ ...c, [t.key]: fn(c[t.key]) }))}
        />
      ))}

      {chaves.outras.map((o) => (
        <ChaveRow
          key={o.id}
          label={o.nome}
          data={o}
          locked={locked}
          onChange={(fn) => updateOutra(o.id, fn)}
          onRemove={() => removeOutra(o.id)}
        />
      ))}

      {!locked && (
        <button onClick={addOutra} className="btn-ghost rounded-full px-4 py-2.5 text-sm flex items-center gap-2 w-fit">
          <Plus size={14} /> Outras chaves
        </button>
      )}
    </div>
  );
}


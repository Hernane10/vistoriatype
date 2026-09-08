// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { Droplet, Flame, Zap } from "lucide-react";
import { TextAreaWithDictation } from "../../components/TextAreaWithDictation";
import { PhotoPicker, PhotoThumb } from "../../components/media";
import { filesToPhotos } from "../../utils/media";

export function MedidorCard({ icon, title, data, locked, opcional, unidades, onChange }) {
  const ativo = data.ativo;

  async function handleAddPhotos(files) {
    const photos = await filesToPhotos(files);
    onChange((d) => ({ ...d, fotos: [...d.fotos, ...photos] }));
  }

  function removePhoto(idx) {
    onChange((d) => ({ ...d, fotos: d.fotos.filter((_, i) => i !== idx) }));
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="display font-semibold text-sm flex items-center gap-2">
          {icon} {title} {opcional && <span className="badge badge-neutral">Opcional</span>}
        </h3>
        {opcional && (
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: "var(--ink-soft)" }}>
            <input
              type="checkbox"
              disabled={locked}
              checked={ativo}
              onChange={(e) => onChange((d) => ({ ...d, ativo: e.target.checked }))}
            />
            Este imóvel possui
          </label>
        )}
      </div>

      {!ativo ? (
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Não aplicável a este imóvel.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label block mb-1">Número / código</label>
              <input disabled={locked} className="input w-full px-4 py-2 text-sm" placeholder="—" value={data.numero} onChange={(e) => onChange((d) => ({ ...d, numero: e.target.value }))} />
            </div>
            <div>
              <label className="label block mb-1">Leitura atual</label>
              <input disabled={locked} className="input w-full px-4 py-2 text-sm" placeholder="—" value={data.leitura} onChange={(e) => onChange((d) => ({ ...d, leitura: e.target.value }))} />
            </div>
            <div>
              <label className="label block mb-1">Unidade</label>
              <select disabled={locked} className="select w-full px-4 py-2 text-sm" value={data.unidade} onChange={(e) => onChange((d) => ({ ...d, unidade: e.target.value }))}>
                {(unidades || ["m³", "kWh"]).map((u) => <option key={u} value={u}>{u}</option>)}
                <option value="">Outra / não informar</option>
              </select>
            </div>
            <div>
              <label className="label block mb-1">Concessionária</label>
              <input disabled={locked} className="input w-full px-4 py-2 text-sm" placeholder="Ex: Sabesp, Enel, Comgás..." value={data.concessionaria || ""} onChange={(e) => onChange((d) => ({ ...d, concessionaria: e.target.value }))} />
            </div>
          </div>
          <TextAreaWithDictation
            disabled={locked}
            className="px-4 py-2.5 mb-3"
            rows={2}
            placeholder="Observação..."
            value={data.observacoes}
            onChange={(val) => onChange((d) => ({ ...d, observacoes: val }))}
          />
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {data.fotos.map((foto, idx) => (
              <PhotoThumb
                key={idx}
                foto={foto}
                size={56}
                onRemove={!locked ? () => removePhoto(idx) : null}
                onUpdate={!locked ? (marcas) => onChange((d) => ({ ...d, fotos: d.fotos.map((f, i) => (i === idx ? { ...f, marcas } : f)) })) : null}
              />
            ))}
          </div>
          {!locked && <PhotoPicker onAdd={handleAddPhotos} small />}
        </>
      )}
    </div>
  );
}


export function MedidoresTab({ medidores, locked, onChange }) {
  return (
    <div className="grid gap-4">
      <MedidorCard
        icon={<Droplet size={15} style={{ color: "var(--accent)" }} />}
        title="Água"
        data={medidores.agua}
        locked={locked}
        opcional={false}
        unidades={["m³"]}
        onChange={(fn) => onChange((m) => ({ ...m, agua: fn(m.agua) }))}
      />
      <MedidorCard
        icon={<Zap size={15} style={{ color: "var(--accent)" }} />}
        title="Energia"
        data={medidores.energia}
        locked={locked}
        opcional={false}
        unidades={["kWh"]}
        onChange={(fn) => onChange((m) => ({ ...m, energia: fn(m.energia) }))}
      />
      <MedidorCard
        icon={<Flame size={15} style={{ color: "var(--accent)" }} />}
        title="Gás"
        data={medidores.gas}
        locked={locked}
        opcional={true}
        unidades={["m³", "kg"]}
        onChange={(fn) => onChange((m) => ({ ...m, gas: fn(m.gas) }))}
      />
    </div>
  );
}


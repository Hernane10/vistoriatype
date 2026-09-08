// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Download, FileText, Gauge, GitCompare, KeyRound, Layers, Lock, PenLine, Printer, QrCode, Unlock } from "lucide-react";
import { CapaFotoEditor } from "../../components/CapaFotoEditor";
import { QrCodeModal } from "../../components/QrCodeModal";
import { ambientesFromModel, makeAmbiente } from "../../data/inspectionModel";
import { enderecoCompleto, fmtDate } from "../../utils/format";
import { AmbientesTab } from "./AmbientesTab";
import { AssinaturaTab } from "./AssinaturaTab";
import { ChavesTab } from "./ChavesTab";
import { ComparacaoTab } from "./ComparacaoTab";
import { MedidoresTab } from "./MedidoresTab";
import { ParecerTecnicoTab } from "./ParecerTecnicoTab";
import { ReportView } from "../ReportView";

export function DetailView({ inspection, onBack, onUpdate, customModels = [], allInspections = [], onExport }) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [tab, setTab] = useState("ambientes");
  const [showQr, setShowQr] = useState(false);
  const locked = inspection.status === "Finalizada";

  function addAmbiente(nome, itensBase = []) {
    onUpdate((insp) => ({
      ...insp,
      ambientes: [...insp.ambientes, makeAmbiente(nome, itensBase)],
    }));
  }

  function applyModel(modelKeyOrObj) {
    const novos = ambientesFromModel(modelKeyOrObj);
    onUpdate((insp) => ({ ...insp, ambientes: [...insp.ambientes, ...novos] }));
  }

  function removeAmbiente(ambId) {
    onUpdate((insp) => ({ ...insp, ambientes: insp.ambientes.filter((a) => a.id !== ambId) }));
  }

  function updateAmbiente(ambId, fn) {
    onUpdate((insp) => ({
      ...insp,
      ambientes: insp.ambientes.map((a) => (a.id === ambId ? fn(a) : a)),
    }));
  }

  function toggleStatus() {
    onUpdate((insp) => ({ ...insp, status: insp.status === "Finalizada" ? "Em andamento" : "Finalizada" }));
  }

  const totalItens = inspection.ambientes.reduce((a, amb) => a + amb.itens.length, 0);
  const avarias = inspection.ambientes.reduce((a, amb) => a + amb.itens.filter((it) => it.temDano).length, 0);

  return (
    <div className="min-h-full">
      <div className="topbar px-6 py-4 flex items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="btn-ghost rounded-full p-2 shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="display text-base font-bold truncate">{enderecoCompleto(inspection.imovel) || "Vistoria sem endereço"}</h1>
            <p className="text-xs mono" style={{ color: "var(--ink-soft)" }}>{inspection.tipo} · {fmtDate(inspection.dataVistoria)} · {inspection.vistoriador}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onExport} className="btn-ghost rounded-full p-2" title="Exportar esta vistoria (com fotos, vídeos e anexos)">
            <Download size={16} />
          </button>
          <button onClick={() => setShowQr(true)} className="btn-ghost rounded-full p-2" title="QR do imóvel">
            <QrCode size={16} />
          </button>
          <button onClick={toggleStatus} className="btn-primary rounded-full px-3 py-2 text-xs flex items-center gap-1.5">
            {locked ? <Unlock size={14} /> : <Lock size={14} />}
            {locked ? "Reabrir" : "Finalizar"}
          </button>
        </div>
      </div>

      {showQr && <QrCodeModal inspection={inspection} onClose={() => setShowQr(false)} />}

      <div className={tab === "pdf" ? "max-w-6xl mx-auto px-4 py-6" : "max-w-4xl mx-auto px-6 py-6"}>
        <CapaFotoEditor
          capaFoto={inspection.capaFoto}
          locked={locked}
          onChange={(foto) => onUpdate((insp) => ({ ...insp, capaFoto: foto }))}
        />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="badge badge-neutral">{inspection.imovel.tipoImovel}</span>
          <span className="badge badge-neutral">{inspection.mobiliario}</span>
          <span className="badge badge-neutral">{inspection.ambientes.length} ambientes</span>
          <span className="badge badge-neutral">{totalItens} itens</span>
          {avarias > 0 && <span className="badge badge-bad">{avarias} avarias registradas</span>}
          {locked && <span className="badge badge-good flex items-center gap-1"><CheckCircle2 size={11} /> Finalizada</span>}
        </div>

        <div className="flex items-center gap-2 mb-6 no-print flex-wrap">
          <button onClick={() => setTab("ambientes")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "ambientes" ? "active" : ""}`}>
            <Layers size={14} /> Ambientes
          </button>
          <button onClick={() => setTab("medidores")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "medidores" ? "active" : ""}`}>
            <Gauge size={14} /> Medidores
          </button>
          <button onClick={() => setTab("chaves")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "chaves" ? "active" : ""}`}>
            <KeyRound size={14} /> Chaves
          </button>
          <button onClick={() => setTab("comparar")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "comparar" ? "active" : ""}`}>
            <GitCompare size={14} /> Comparar
          </button>
          <button onClick={() => setTab("parecer")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "parecer" ? "active" : ""}`}>
            <FileText size={14} /> Parecer Técnico
          </button>
          <button onClick={() => setTab("assinatura")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "assinatura" ? "active" : ""}`}>
            <PenLine size={14} /> Assinatura Digital
          </button>
          <button onClick={() => setTab("pdf")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "pdf" ? "active" : ""}`}>
            <Printer size={14} /> PDF
          </button>
        </div>

        {tab === "ambientes" && (
          <AmbientesTab
            inspection={inspection}
            locked={locked}
            templateOpen={templateOpen}
            setTemplateOpen={setTemplateOpen}
            addAmbiente={addAmbiente}
            removeAmbiente={removeAmbiente}
            updateAmbiente={updateAmbiente}
            applyModel={applyModel}
            customModels={customModels}
          />
        )}

        {tab === "medidores" && (
          <MedidoresTab
            medidores={inspection.medidores}
            locked={locked}
            onChange={(fn) => onUpdate((insp) => ({ ...insp, medidores: fn(insp.medidores) }))}
          />
        )}

        {tab === "chaves" && (
          <ChavesTab
            chaves={inspection.chaves}
            locked={locked}
            onChange={(fn) => onUpdate((insp) => ({ ...insp, chaves: fn(insp.chaves) }))}
          />
        )}

        {tab === "comparar" && (
          <ComparacaoTab inspection={inspection} allInspections={allInspections} />
        )}

        {tab === "parecer" && (
          <ParecerTecnicoTab
            parecerTecnico={inspection.parecerTecnico}
            locked={locked}
            onChange={(fn) => onUpdate((insp) => ({ ...insp, parecerTecnico: fn(insp.parecerTecnico || { texto: "", anexos: [] }) }))}
          />
        )}

        {tab === "assinatura" && (
          <AssinaturaTab inspection={inspection} locked={locked} onUpdate={onUpdate} />
        )}

        {tab === "pdf" && (
          <ReportView inspection={inspection} onUpdate={onUpdate} embedded />
        )}
      </div>
    </div>
  );
}


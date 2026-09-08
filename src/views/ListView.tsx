// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useRef, useState } from "react";
import { Building2, ClipboardList, Download, Eye, HelpCircle, Layers, Loader2, Moon, Plus, Search, Sun, Trash2, Upload } from "lucide-react";
import { CalendarWidget } from "../components/CalendarWidget";
import CloudSyncWidget from "../components/CloudSyncWidget";
import { SaveIndicator } from "../components/SaveIndicator";
import { enderecoCompleto, fmtDate } from "../utils/format";
import { AjudaTab } from "./AjudaTab";
import { ModelosTab } from "./ModelosTab";

export function ListView({ inspections, allInspections, query, setQuery, dateFilter, setDateFilter, calendarVisible, toggleCalendar, onOpen, onNew, onUseModel, onGenerateExample, onDelete, saveState, customModels, onCreateCustomModel, onDeleteCustomModel, theme, toggleTheme, agendamentos, onAddAgendamento, onRemoveAgendamento, onStartFromAgendamento, onExport, onImport }) {
  const [tab, setTab] = useState("vistorias");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const importFileRef = useRef(null);

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    setImportMsg("");
    try {
      const count = await onImport(file);
      setImportMsg(`${count} vistoria(s) importada(s) com sucesso.`);
    } catch (err) {
      setImportMsg(err.message || "Não foi possível importar este arquivo.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-full">
      <div className="topbar px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList size={26} strokeWidth={2} style={{ color: "var(--accent)" }} />
          <div>
            <h1 className="display text-xl font-bold leading-none">Vistor<span style={{ color: "var(--accent)" }}>IA</span></h1>
            <p className="text-xs mt-1 font-semibold" style={{ color: "var(--ink-soft)" }}>PEREIRA Gestão Imobiliária</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SaveIndicator state={saveState} />
          <CloudSyncWidget inspections={inspections} onImportInspections={onImport} />
          <button onClick={toggleTheme} className="btn-ghost rounded-full p-2.5" title="Alternar tema claro/escuro">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => onExport()} disabled={inspections.length === 0} className="btn-ghost rounded-full px-3 py-2.5 text-xs flex items-center gap-1.5" title="Exportar todas as vistorias (com fotos, vídeos e anexos) para um arquivo">
            <Download size={14} /> Exportar tudo
          </button>
          <button onClick={() => importFileRef.current?.click()} disabled={importing} className="btn-ghost rounded-full px-3 py-2.5 text-xs flex items-center gap-1.5" title="Importar vistorias de um arquivo exportado antes">
            {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Importar
          </button>
          <input ref={importFileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportFile} />
          <button onClick={onNew} className="btn-primary rounded-full px-4 py-2.5 flex items-center gap-2 text-sm">
            <Plus size={17} /> Nova vistoria
          </button>
        </div>
      </div>

      {importMsg && (
        <div className="max-w-5xl mx-auto px-6 pt-4">
          <p className="text-xs rounded-xl px-4 py-2.5" style={{ background: "var(--card-alt)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>{importMsg}</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button onClick={() => setTab("vistorias")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "vistorias" ? "active" : ""}`}>
            <ClipboardList size={14} /> Minhas vistorias
          </button>
          <button onClick={() => setTab("modelos")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "modelos" ? "active" : ""}`}>
            <Layers size={14} /> Vistorias pré-prontas
          </button>
          <button onClick={() => setTab("ajuda")} className={`tab-btn px-4 py-2 text-sm flex items-center gap-1.5 ${tab === "ajuda" ? "active" : ""}`}>
            <HelpCircle size={14} /> Como usar
          </button>
        </div>
      </div>

      {tab === "ajuda" && <AjudaTab />}

      {tab === "modelos" && (
        <ModelosTab
          onUseModel={onUseModel}
          onGenerateExample={onGenerateExample}
          customModels={customModels}
          onCreateCustomModel={onCreateCustomModel}
          onDeleteCustomModel={onDeleteCustomModel}
        />
      )}
      {tab === "vistorias" && (
      <div className="max-w-5xl mx-auto px-6 pb-8">
        {calendarVisible ? (
          <CalendarWidget
            inspections={allInspections}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onHide={toggleCalendar}
            agendamentos={agendamentos}
            onAddAgendamento={onAddAgendamento}
            onRemoveAgendamento={onRemoveAgendamento}
            onStartFromAgendamento={onStartFromAgendamento}
          />
        ) : (
          <button onClick={toggleCalendar} className="btn-ghost rounded-full px-4 py-2 text-xs flex items-center gap-2 mb-6">
            <Eye size={13} /> Mostrar calendário
          </button>
        )}

        {dateFilter && (
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: "var(--ink-soft)" }}>
            <span>Filtrando por {fmtDate(dateFilter)}</span>
            <button onClick={() => setDateFilter(null)} className="underline" style={{ color: "var(--accent)" }}>limpar</button>
          </div>
        )}

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-soft)" }} />
          <input
            className="input w-full pl-10 pr-3 py-2.5 text-sm"
            placeholder="Buscar por endereço, proprietário ou vistoriador..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {inspections.length === 0 ? (
          <div className="card p-12 text-center">
            <Building2 size={36} className="mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
            <h3 className="display text-lg font-semibold mb-1">Nenhuma vistoria ainda</h3>
            <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
              Crie sua primeira vistoria para começar a registrar ambientes, itens e avarias.
            </p>
            <button onClick={onNew} className="btn-primary rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2">
              <Plus size={16} /> Nova vistoria
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {inspections.map((insp) => {
              const totalItens = insp.ambientes.reduce((a, amb) => a + amb.itens.length, 0);
              const avarias = insp.ambientes.reduce(
                (a, amb) => a + amb.itens.filter((it) => it.temDano).length, 0
              );
              return (
                <div key={insp.id} className="card p-4 flex items-center gap-4">
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0 overflow-hidden"
                    style={{ width: 46, height: 46, background: "var(--card-alt)" }}
                  >
                    {insp.capaFoto ? (
                      <img src={insp.capaFoto.src} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={20} style={{ color: "var(--accent)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpen(insp.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate" style={{ color: "var(--ink-strong)" }}>
                        {enderecoCompleto(insp.imovel) || "Endereço não informado"}
                      </h3>
                      <span className={`badge ${insp.status === "Finalizada" ? "badge-good" : "badge-neutral"}`}>
                        {insp.status}
                      </span>
                      <span className="badge badge-neutral">{insp.tipo}</span>
                    </div>
                    <p className="text-xs mt-1 mono" style={{ color: "var(--ink-soft)" }}>
                      {fmtDate(insp.dataVistoria)} · {insp.vistoriador || "sem vistoriador"} · {insp.ambientes.length} ambientes · {totalItens} itens
                      {avarias > 0 && <span style={{ color: "var(--bad)" }}> · {avarias} avarias</span>}
                    </p>
                  </div>
                  <button onClick={() => onDelete(insp.id)} className="btn-ghost rounded-full p-2" title="Excluir">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => onOpen(insp.id)} className="btn-secondary rounded-full px-3 py-2 text-xs">
                    Abrir
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
    </div>
  );
}


// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { LightboxContext } from "./context/LightboxContext";
import { storage } from "./lib/storage";
import { Lightbox } from "./components/Lightbox";
import { buildExampleInspection, emptyInspection, uid, withDefaults } from "./data/inspectionModel";
import { storageDeleteInspection, storageLoadAll, storageSaveIndex, storageSaveInspection } from "./lib/inspectionStorage";
import { todayISO } from "./utils/format";
import { DetailView } from "./views/DetailView";
import { ListView } from "./views/ListView";
import { ModelBuilderView } from "./views/ModelosTab";
import { NewInspectionWizard } from "./views/NewInspectionWizard";
import type { Agendamento, CustomModel, Inspection } from "./types/inspection";
import { TesteCalendario } from "./TesteCalendario";


type ViewName = "list" | "new" | "buildModel" | "detail";
type Theme = "dark" | "light";
type SaveState = "idle" | "saving" | "saved" | "error";

export default function App() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [view, setView] = useState<ViewName>("list");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [pendingModel, setPendingModel] = useState<string | CustomModel | null>(null);
  const [pendingPrefill, setPendingPrefill] = useState<{ date?: string; endereco?: string } | null>(null);
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = inspections.find((i) => i.id === currentId) || null;

  useEffect(() => {
    (async () => {
      const all = await storageLoadAll();
      setInspections(all.map(withDefaults));
      try {
        const pref = await storage.get("ui-show-calendar");
        if (pref) setCalendarVisible(JSON.parse(pref.value));
      } catch {
        // default stays visible
      }
      try {
        const th = await storage.get("ui-theme");
        if (th) setTheme(JSON.parse(th.value));
      } catch {
        // default stays dark
      }
      try {
        const cm = await storage.get("custom-models");
        if (cm) setCustomModels(JSON.parse(cm.value));
      } catch {
        // no custom models yet
      }
      try {
        const ag = await storage.get("agendamentos");
        if (ag) setAgendamentos(JSON.parse(ag.value));
      } catch {
        // no agendamentos yet
      }
      setLoaded(true);
    })();
  }, []);

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      storage.set("ui-theme", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  async function saveCustomModel(model) {
    setCustomModels((prev) => {
      const next = [...prev, model];
      storage.set("custom-models", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  async function deleteCustomModel(id) {
    setCustomModels((prev) => {
      const next = prev.filter((m) => m.id !== id);
      storage.set("custom-models", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function addAgendamento(date: string, titulo: string, observacao: string) {
    setAgendamentos((prev) => {
      const next = [...prev, { id: uid(), date, titulo, observacao }];
      storage.set("agendamentos", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function removeAgendamento(id: string) {
    setAgendamentos((prev) => {
      const next = prev.filter((a) => a.id !== id);
      storage.set("agendamentos", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function toggleCalendar() {
    setCalendarVisible((v) => {
      const next = !v;
      storage.set("ui-show-calendar", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  const persist = useCallback((insp: Inspection) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await storageSaveInspection(insp);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 500);
  }, []);

  function updateInspection(id: string, updater: (insp: Inspection) => Inspection) {
    setInspections((prev) => {
      const next = prev.map((i) => (i.id === id ? updater(i) : i));
      const changed = next.find((i) => i.id === id);
      if (changed) persist(changed);
      return next;
    });
  }

  async function createInspection(data: Partial<Inspection>) {
    const insp: Inspection = { ...emptyInspection(), ...data };
    const next = [insp, ...inspections];
    setInspections(next);
    setCurrentId(insp.id);
    setView("detail");
    setSaveState("saving");
    try {
      await storageSaveInspection(insp);
      await storageSaveIndex(next.map((i) => i.id));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function deleteInspection(id: string) {
    const next = inspections.filter((i) => i.id !== id);
    setInspections(next);
    if (currentId === id) {
      setCurrentId(null);
      setView("list");
    }
    setSaveState("saving");
    try {
      await storageDeleteInspection(id, next.map((i) => i.id));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function startNew(modelKey: string | CustomModel | null = null) {
    setPendingModel(modelKey);
    setPendingPrefill(null);
    setView("new");
  }

  function startNewFromAgendamento(agendamento: Agendamento) {
    setPendingModel(null);
    setPendingPrefill({ date: agendamento.date, endereco: agendamento.titulo });
    setView("new");
    // The agendamento's purpose (remind + kick off the vistoria) is done once
    // the person acts on it, so we clear it to avoid a stale duplicate reminder.
    removeAgendamento(agendamento.id);
  }

  async function generateExample() {
    await createInspection(buildExampleInspection());
  }

  // Export: bundles inspection(s) — including every embedded photo/video/audio
  // and anexo, since those are already stored as base64 data URLs inside the
  // inspection object — into one portable .json file the user can back up or
  // move to another device/browser.
  function exportInspections(ids?: string[]) {
    const toExport = ids ? inspections.filter((i) => ids.includes(i.id)) : inspections;
    const payload = {
      app: "VistorIA", exportedAt: new Date().toISOString(), version: 1,
      inspections: toExport,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = todayISO();
    a.href = url;
    a.download = toExport.length === 1
      ? `vistoria-${(toExport[0].imovel.endereco || "sem-endereco").replace(/[^a-z0-9]+/gi, "-")}-${stamp}.json`
      : `vistorias-vistoria-ia-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function importInspections(file: File): Promise<number> {
    const text = await file.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Arquivo inválido: não é um JSON de exportação do VistorIA.");
    }
    const list = Array.isArray(data) ? data : data.inspections;
    if (!Array.isArray(list)) throw new Error("Arquivo inválido: nenhuma vistoria encontrada dentro dele.");

    // Give imported inspections fresh ids so they never collide with existing
    // ones (e.g. importing the same backup twice, or into another browser
    // that already has vistorias with those same ids).
    const imported: Inspection[] = list.map((insp: any) => withDefaults({ ...insp, id: uid(), createdAt: Date.now() }));
    const next = [...imported, ...inspections];
    setInspections(next);
    setSaveState("saving");
    try {
      await Promise.all(imported.map((insp) => storageSaveInspection(insp)));
      await storageSaveIndex(next.map((i) => i.id));
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
    return imported.length;
  }

  const filtered = inspections.filter((i) => {
    const q = query.toLowerCase();
    const matchesText = (
      i.imovel.endereco.toLowerCase().includes(q) ||
      i.imovel.bairro.toLowerCase().includes(q) ||
      i.imovel.cidade.toLowerCase().includes(q) ||
      i.imovel.proprietario.toLowerCase().includes(q) ||
      i.vistoriador.toLowerCase().includes(q)
    );
    const matchesDate = !dateFilter || i.dataVistoria === dateFilter;
    return matchesText && matchesDate;
  });

  return (
    <div className={`app-root ${theme === "light" ? "theme-light" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .app-root {
          --bg: #14161F;
          --card: #1C1F2B;
          --card-alt: #232637;
          --line: #343953;
          --ink: #C98A96;
          --ink-strong: #E3AEB8;
          --ink-soft: #8C6670;
          --ink-faint: #6B5058;
          --accent: #A23A4C;
          --accent-hover: #8A2F3F;
          --good: #3FA76B;
          --good-bg: rgba(63,167,107,0.16);
          --warn: #D4A13A;
          --warn-bg: rgba(212,161,58,0.16);
          --bad: #D3564A;
          --bad-bg: rgba(211,86,74,0.16);
          --worse: #8E2E3D;
          --worse-bg: rgba(142,46,61,0.28);
          --neutral: #6B7280;
          --neutral-bg: rgba(107,114,128,0.18);
          --field-label: #E8C34D;
          --item-name: #E8C34D;
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
        }
        .app-root h1, .app-root h2, .app-root h3, .app-root .display {
          font-family: 'Space Grotesk', sans-serif;
          color: var(--ink-strong);
        }
        .app-root.theme-light {
          --bg: #F4EFEA;
          --card: #FFFFFF;
          --card-alt: #F7F0EC;
          --line: #E3D6CE;
          --ink: #7A3040;
          --ink-strong: #4E1B26;
          --ink-soft: #93636D;
          --ink-faint: #B08D93;
          --accent: #A23A4C;
          --accent-hover: #8A2F3F;
          --field-label: #A8790E;
          --item-name: #A8790E;
        }
        .app-root.theme-light .input, .app-root.theme-light .select, .app-root.theme-light .textarea {
          background: #FFFFFF;
        }
        .app-root.theme-light .estado-btn { background: #FFFFFF; }
        .app-root .mono { font-family: 'JetBrains Mono', monospace; }

        .topbar {
          background: var(--card);
          color: var(--ink-strong);
          border-bottom: 1px solid var(--line);
        }
        .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          color: #F3E4E7;
          border: none;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(162,58,76,0.35), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .btn-primary:hover { box-shadow: 0 4px 14px rgba(162,58,76,0.45), inset 0 1px 0 rgba(255,255,255,0.14); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; }
        .btn-secondary {
          background: var(--card);
          color: var(--ink-strong);
          border: 1.5px solid var(--accent);
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .btn-secondary:hover { background: var(--accent); color: #F3E4E7; box-shadow: 0 3px 10px rgba(162,58,76,0.3); transform: translateY(-1px); }
        .btn-ghost {
          background: var(--card);
          border: 1px solid var(--line);
          color: var(--ink-soft);
        }
        .btn-ghost:hover { border-color: var(--accent); color: var(--ink-strong); background: var(--card-alt); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
        .input, .textarea, .select {
          background: #1A1D28;
          border: 1.5px solid var(--line);
          border-radius: 999px;
          color: var(--ink-strong);
        }
        .textarea { border-radius: 22px; }
        .input::placeholder, .textarea::placeholder { color: var(--ink-faint); }
        .input:focus, .textarea:focus, .select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(162,58,76,0.15);
        }
        .label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-soft);
        }
        .badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .badge-good { background: var(--good-bg); color: var(--good); }
        .badge-warn { background: var(--warn-bg); color: var(--warn); }
        .badge-bad { background: var(--bad-bg); color: var(--bad); }
        .badge-worse { background: var(--worse-bg); color: #E38E9A; }
        .badge-neutral { background: var(--neutral-bg); color: #A6ACB8; }
        .estado-btn {
          border: 1.5px solid var(--line);
          background: #1A1D28;
          font-weight: 600;
          font-size: 13px;
          color: var(--ink-soft);
          border-radius: 999px;
        }
        .estado-btn.active-Novo { background: var(--neutral); border-color: var(--neutral); color: #fff; box-shadow: 0 2px 6px rgba(107,114,128,0.35); }
        .estado-btn.active-Bom { background: var(--good); border-color: var(--good); color: #fff; box-shadow: 0 2px 6px rgba(63,167,107,0.35); }
        .estado-btn.active-Regular { background: var(--warn); border-color: var(--warn); color: #1B1500; box-shadow: 0 2px 6px rgba(212,161,58,0.35); }
        .estado-btn.active-Ruim { background: var(--bad); border-color: var(--bad); color: #fff; box-shadow: 0 2px 6px rgba(211,86,74,0.35); }
        .estado-btn.active-Péssimo { background: var(--worse); border-color: var(--worse); color: #fff; box-shadow: 0 2px 6px rgba(142,46,61,0.35); }
        .estado-btn.active-semteste { background: var(--ink-faint); border-color: var(--ink-faint); color: #fff; }

        .tab-btn {
          border: 1.5px solid var(--line);
          background: var(--card);
          color: var(--ink-soft);
          font-weight: 600;
          border-radius: 999px;
        }
        .tab-btn.active { background: var(--accent); border-color: var(--accent); color: #F3E4E7; box-shadow: 0 3px 10px rgba(162,58,76,0.3); }

        .stamp {
          border: 2.5px solid var(--good);
          color: var(--good);
          border-radius: 999px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          transform: rotate(-8deg);
          letter-spacing: 0.06em;
        }
        .photo-thumb {
          border: 1px solid var(--line);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }
        .photo-date {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          font-size: 8.5px;
          text-align: center;
          padding: 1px 2px;
          background: rgba(0,0,0,0.65);
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
        }
        .divider { border-top: 1px dashed var(--line); }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(162,58,76,0.45); }
          70% { box-shadow: 0 0 0 12px rgba(162,58,76,0); }
          100% { box-shadow: 0 0 0 0 rgba(162,58,76,0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .view-enter { animation: fadeSlideUp 0.32s ease both; }
        .card {
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.14); }
        .btn-primary, .btn-secondary, .btn-ghost, .tab-btn, .estado-btn {
          transition: all 0.15s ease;
        }
        .btn-primary:active, .btn-secondary:active, .btn-ghost:active, .tab-btn:active, .estado-btn:active { transform: scale(0.96); }
        .tab-btn:hover:not(.active) { border-color: var(--accent); color: var(--ink-strong); transform: translateY(-1px); }
        .estado-btn:hover:not([class*="active-"]) { border-color: var(--accent); transform: translateY(-1px); }
        .tab-btn.active { animation: popIn 0.2s ease; }
        .badge { transition: all 0.15s ease; }
        .modal-pop { animation: popIn 0.22s cubic-bezier(0.2,0.8,0.3,1) both; }
        .modal-fade { animation: fadeIn 0.2s ease both; }
        .assistant-fab {
          animation: pulseRing 2.4s infinite;
          transition: transform 0.2s ease;
        }
        .assistant-fab:hover { transform: scale(1.08); }
        .assistant-panel { animation: slideInRight 0.28s cubic-bezier(0.2,0.8,0.3,1) both; }
        .spin-slow { animation: spinSlow 6s linear infinite; }
        .chat-bubble-in { animation: fadeSlideUp 0.22s ease both; }

        @media print {
          @page { margin: 14mm 12mm; }
          .no-print { display: none !important; }
          .app-root { background: #fff !important; color: #1E2723 !important; }
          .app-root h1, .app-root h2, .app-root h3, .app-root .display { color: #1E2723 !important; }
          .print-area { max-width: 100% !important; padding: 0 !important; margin: 0 !important; color: #1E2723 !important; }
          .print-area .card { border: 1px solid #ccc !important; border-radius: 4px !important; box-shadow: none !important; background: #fff !important; }
          .print-ambiente, .print-block { break-inside: avoid; page-break-inside: avoid; }
          .stamp, .badge { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <LightboxContext.Provider value={setLightboxSrc}>
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {!loaded && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin" style={{ color: "var(--ink-soft)" }} />
        </div>
      )}

      {loaded && view === "list" && (
        <div key="list" className="view-enter">
        <ListView
          inspections={filtered}
          allInspections={inspections}
          query={query}
          setQuery={setQuery}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          calendarVisible={calendarVisible}
          toggleCalendar={toggleCalendar}
          onOpen={(id) => { setCurrentId(id); setView("detail"); }}
          onNew={() => startNew(null)}
          onUseModel={(key) => startNew(key)}
          onGenerateExample={generateExample}
          onDelete={deleteInspection}
          saveState={saveState}
          customModels={customModels}
          onCreateCustomModel={() => setView("buildModel")}
          onDeleteCustomModel={deleteCustomModel}
          theme={theme}
          toggleTheme={toggleTheme}
          onStartFromAgendamento={startNewFromAgendamento}
          onExport={exportInspections}
          onImport={importInspections}
          onUpdateInspections={setInspections}
        
        />
        </div>
      )}

      {view === "new" && (
  <div key="new" className="view-enter">
    <NewInspectionWizard
      onCancel={() => setView("list")}
      onCreate={createInspection}
      initialModel={pendingModel}
      initialDate={pendingPrefill?.date}
      initialEndereco={pendingPrefill?.endereco}
    />
  </div>
)}

      {view === "buildModel" && (
        <div key="buildModel" className="view-enter">
        <ModelBuilderView
          onCancel={() => setView("list")}
          onSave={async (model) => { await saveCustomModel(model); setView("list"); }}
        />
        </div>
      )}

      {view === "detail" && current && (
        <div key="detail" className="view-enter">
        <DetailView
          inspection={current}
          onBack={() => { setView("list"); setCurrentId(null); }}
          onUpdate={(updater) => updateInspection(current.id, updater)}
          customModels={customModels}
          allInspections={inspections}
          onExport={() => exportInspections([current.id])}
        />
        </div>
      )}
      </LightboxContext.Provider>
    </div>
  );
}


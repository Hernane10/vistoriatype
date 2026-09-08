// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useState } from "react";
import { Calendar, ChevronRight, EyeOff, X } from "lucide-react";
import { DIAS_SEMANA, fmtDate, MESES, todayISO } from "../utils/format";
import type { Agendamento, Inspection } from "../types/inspection";

interface CalendarWidgetProps {
  inspections: Inspection[];
  dateFilter: string | null;
  setDateFilter: (date: string | null) => void;
  onHide: () => void;
  agendamentos: Agendamento[];
  onAddAgendamento: (date: string, titulo: string, observacao: string) => void;
  onRemoveAgendamento: (id: string) => void;
  onStartFromAgendamento: (agendamento: Agendamento) => void;
}

export function CalendarWidget({ inspections, dateFilter, setDateFilter, onHide, agendamentos, onAddAgendamento, onRemoveAgendamento, onStartFromAgendamento }: CalendarWidgetProps) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [schedulingDate, setSchedulingDate] = useState<string | null>(null);

  const countsByDate: Record<string, number> = {};
  inspections.forEach((i) => {
    if (!i.dataVistoria) return;
    countsByDate[i.dataVistoria] = (countsByDate[i.dataVistoria] || 0) + 1;
  });

  const agendaByDate: Record<string, Agendamento[]> = {};
  (agendamentos || []).forEach((a) => {
    (agendaByDate[a.date] = agendaByDate[a.date] || []).push(a);
  });

  const firstOfMonth = new Date(cursor.year, cursor.month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const todayIso = todayISO();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function isoFor(day: number) {
    return `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function changeMonth(delta: number) {
    setCursor((c) => {
      let m = c.month + delta;
      let y = c.year;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      return { year: y, month: m };
    });
  }

  // Clicking a day with nothing on it schedules a vistoria there (that's now
  // the calendar's only "click a date" behavior worth showing a picker for).
  // Clicking a day that already has vistorias or an agendamento toggles the
  // list filter instead, since there's already something to look at.
  function handleDayClick(iso: string, hasContent: boolean, isSelected: boolean) {
    if (hasContent) {
      setDateFilter(isSelected ? null : iso);
    } else {
      setSchedulingDate(iso);
    }
  }

  const proximos = (agendamentos || [])
    .filter((a) => a.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="card p-4 mb-6 no-print">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="btn-ghost rounded-full p-1.5">
            <ChevronRight size={14} className="rotate-180" />
          </button>
          <h3 className="display text-sm font-bold" style={{ minWidth: 130, textAlign: "center" }}>
            {MESES[cursor.month]} {cursor.year}
          </h3>
          <button onClick={() => changeMonth(1)} className="btn-ghost rounded-full p-1.5">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {dateFilter && (
            <button onClick={() => setDateFilter(null)} className="btn-ghost rounded-full px-2.5 py-1 text-xs">
              Limpar filtro
            </button>
          )}
          <button onClick={onHide} className="btn-ghost rounded-full px-2.5 py-1 text-xs flex items-center gap-1">
            <EyeOff size={12} /> Ocultar
          </button>
        </div>
      </div>

      <p className="text-xs mb-2" style={{ color: "var(--ink-soft)" }}>
        Toque num dia livre para agendar uma vistoria, ou num dia marcado para ver os detalhes.
      </p>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold" style={{ color: "var(--ink-soft)" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const iso = isoFor(day);
          const count = countsByDate[iso] || 0;
          const agenda = agendaByDate[iso] || [];
          const hasContent = count > 0 || agenda.length > 0;
          const isToday = iso === todayIso;
          const isSelected = dateFilter === iso;
          return (
            <button
              key={idx}
              onClick={() => handleDayClick(iso, hasContent, isSelected)}
              className="w-full rounded-lg flex flex-col items-center justify-center gap-0.5 py-1.5 text-xs"
              title={hasContent ? "Ver vistorias/agendamento deste dia" : "Agendar vistoria neste dia"}
              style={{
                background: isSelected ? "var(--accent)" : agenda.length > 0 ? "var(--warn-bg)" : "transparent",
                color: isSelected ? "#F3E4E7" : "var(--ink-strong)",
                border: agenda.length > 0 && !isSelected ? "1.5px solid var(--warn)" : isToday && !isSelected ? "1.5px solid var(--accent)" : "1px solid transparent",
              }}
            >
              <span>{day}</span>
              <span className="flex items-center gap-0.5" style={{ height: 6 }}>
                {count > 0 && <span className="rounded-full" style={{ width: 4, height: 4, background: isSelected ? "#F3E4E7" : "var(--good)" }} />}
                {agenda.length > 0 && <Calendar size={9} style={{ color: isSelected ? "#F3E4E7" : "var(--warn)" }} />}
              </span>
            </button>
          );
        })}
      </div>

      {proximos.length > 0 && (
        <div className="mt-4 pt-3" style={{ borderTop: "1px dashed var(--line)" }}>
          <p className="label mb-2">Próximos agendamentos — toque para iniciar a vistoria</p>
          <div className="grid gap-1.5">
            {proximos.map((a) => (
              <div
                key={a.id}
                onClick={() => onStartFromAgendamento(a)}
                className="flex items-start gap-2 text-xs px-3 py-2.5 rounded-xl cursor-pointer"
                style={{ background: "var(--warn-bg)" }}
                title="Iniciar uma nova vistoria com esta data e título já preenchidos"
              >
                <Calendar size={13} style={{ color: "var(--warn)" }} className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold mono">{fmtDate(a.date)}</span>
                    <span className="font-medium truncate" style={{ color: "var(--ink-strong)" }}>{a.titulo}</span>
                  </p>
                  {a.observacao && (
                    <p className="mt-0.5" style={{ color: "var(--ink-soft)" }}>{a.observacao}</p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveAgendamento(a.id); }}
                  className="btn-ghost rounded-full p-1 shrink-0"
                  title="Remover agendamento"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {schedulingDate && (
        <AgendarModal
          date={schedulingDate}
          onClose={() => setSchedulingDate(null)}
          onSave={(data, titulo, observacao) => { onAddAgendamento(data, titulo, observacao); setSchedulingDate(null); }}
        />
      )}
    </div>
  );
}

interface AgendarModalProps {
  date: string;
  onClose: () => void;
  onSave: (date: string, titulo: string, observacao: string) => void;
}

export function AgendarModal({ date, onClose, onSave }: AgendarModalProps) {
  const [dataAgendamento, setDataAgendamento] = useState(date);
  const [titulo, setTitulo] = useState("");
  const [observacao, setObservacao] = useState("");

  return (
    <div className="no-print modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(10,11,16,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="card modal-pop p-5" style={{ maxWidth: 360, width: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="display text-sm font-bold flex items-center gap-1.5"><Calendar size={15} /> Agendar vistoria</h3>
          <button onClick={onClose} className="btn-ghost rounded-full p-1.5"><X size={14} /></button>
        </div>
        <label className="label block mb-1.5">Data</label>
        <input type="date" className="input w-full px-4 py-2.5 text-sm mb-3" value={dataAgendamento} onChange={(e) => setDataAgendamento(e.target.value)} />
        <label className="label block mb-1.5">Título / endereço</label>
        <input autoFocus className="input w-full px-4 py-2.5 text-sm mb-3" placeholder="Ex: Vistoria de saída - Rua X, 123" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <label className="label block mb-1.5">Observação (opcional)</label>
        <textarea className="textarea w-full px-4 py-2.5 text-sm mb-4" rows={2} placeholder="Detalhes do agendamento..." value={observacao} onChange={(e) => setObservacao(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost rounded-full px-4 py-2 text-sm">Cancelar</button>
          <button disabled={!titulo.trim() || !dataAgendamento} onClick={() => onSave(dataAgendamento, titulo.trim(), observacao.trim())} className="btn-primary rounded-full px-4 py-2 text-sm">Agendar</button>
        </div>
      </div>
    </div>
  );
}

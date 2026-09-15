import { useState } from "react";
import {
  Plus, Trash2, MapPin, ChevronDown, ChevronRight,
  HelpCircle, Sparkles, X,
} from "lucide-react";
import { getImagemPadrao } from "../../types";
import { ItemRow } from "./ItemRow";
import { getItensPadrao } from "../../utils/ambienteHelpers";
import { makeItem, uid } from "../../data/inspectionModel";
import { getPerguntasAmbiente } from "../../data/perguntasAmbientes";

// ============================================
// CARD DO AMBIENTE
// ============================================
export function AmbienteCard({ ambiente, numero, locked, onRemove, onChange }: any) {
  const [open, setOpen] = useState(false);
  const [mostrarPerguntas, setMostrarPerguntas] = useState(false);

  const fotoCapa = ambiente.foto || ambiente.fotos?.[0]?.src || getImagemPadrao(ambiente.nome);
  const totalAvarias = (ambiente.itens || []).filter((i: any) => i.temDano).length;
  const perguntas = getPerguntasAmbiente(ambiente.nome);

  const responderPergunta = (key: string, valor: string | null) => {
    onChange((a: any) => {
      const checklist = a.checklist || {};
      const valorAtual = checklist[key];
      const novoValor = valorAtual === valor ? null : valor;
      return {
        ...a,
        checklist: { ...checklist, [key]: novoValor },
      };
    });
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "var(--card)", border: "1px solid var(--line)" }}
    >
      {/* CABEÇALHO DO CARD */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div
          className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"
          style={{ background: "var(--card-alt)" }}
        >
          <img src={fotoCapa} alt={ambiente.nome} className="w-full h-full object-cover" />
          <div
            className="absolute top-1 left-1 flex items-center justify-center rounded-full font-bold"
            style={{
              width: 22,
              height: 22,
              background: "var(--accent)",
              color: "#F3E4E7",
              fontSize: 11,
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            {String(numero).padStart(2, "0")}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-sm"
            style={{ color: "var(--ink-strong)", wordBreak: "break-word", lineHeight: "1.3" }}
          >
            {ambiente.nome}
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {totalAvarias > 0 && (
            <span className="badge badge-bad px-2 py-0.5 text-xs rounded-full">
              {totalAvarias} avaria(s)
            </span>
          )}
          <span className="text-xs" style={{ color: "var(--ink-soft)" }}>
            {ambiente.itens?.length || 0} {ambiente.itens?.length === 1 ? "item" : "itens"}
          </span>
          {!locked && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="btn-ghost rounded-full p-1.5"
              style={{ color: "var(--bad)" }}
            >
              <Trash2 size={15} />
            </button>
          )}
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {/* CONTEÚDO EXPANDIDO */}
      {open && (
        <div className="p-4" style={{ background: "var(--card-alt)", borderTop: "1px solid var(--line)" }}>
          {/* ITENS */}
          <div className="grid gap-3">
            {(ambiente.itens || []).map((item: any) => (
              <ItemRow
                key={item.id}
                item={item}
                locked={locked}
                onChange={(fn: any) => onChange((a: any) => ({
                  ...a,
                  itens: a.itens.map((it: any) => (it.id === item.id ? fn(it) : it)),
                }))}
                onRemove={() => onChange((a: any) => ({
                  ...a,
                  itens: a.itens.filter((it: any) => it.id !== item.id),
                }))}
              />
            ))}
          </div>

          {/* BOTÃO ADICIONAR ITEM */}
          {!locked && (
            <button
              onClick={() => {
                const nome = window.prompt("Nome do item:");
                if (nome && nome.trim()) {
                  onChange((a: any) => ({
                    ...a,
                    itens: [...(a.itens || []), makeItem(nome.trim())],
                  }));
                }
              }}
              className="btn-ghost rounded-full px-3 py-2 text-xs mt-3 flex items-center gap-1.5"
              style={{ color: "var(--accent)" }}
            >
              <Plus size={13} /> Adicionar item
            </button>
          )}

          {/* BOTÃO MOSTRAR PERGUNTAS */}
          {perguntas.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px dashed var(--line)" }}>
              <button
                onClick={() => setMostrarPerguntas((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all"
                style={{
                  background: mostrarPerguntas ? "var(--accent)" : "var(--card)",
                  color: mostrarPerguntas ? "#fff" : "var(--ink-strong)",
                  border: "1px solid var(--line)",
                }}
              >
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <HelpCircle size={14} />
                  Perguntas de Verificação — {ambiente.nome}
                </span>
                <span className="text-xs">
                  {mostrarPerguntas ? "▲ Fechar" : "▼ Mostrar"}
                </span>
              </button>

              {mostrarPerguntas && (
                <div className="mt-3 space-y-2 p-3 rounded-xl" style={{ background: "var(--card)" }}>
                  {perguntas.map((p: any) => {
                    const resposta = ambiente.checklist?.[p.key];
                    return (
                      <div
                        key={p.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2"
                        style={{ borderBottom: "1px dashed var(--line)" }}
                      >
                        <span className="text-xs font-medium flex-1" style={{ color: "var(--ink-strong)" }}>
                          {p.label}
                        </span>
                        <div className="flex gap-1.5 shrink-0 flex-wrap">
{[
  { label: "Sim", valor: "Sim", cor: "#16a34a" },
  { label: "Não", valor: "Não", cor: "#dc2626" },
  { label: "Nulo", valor: "Nulo", cor: "#6b7280" },
].map((opt: any) => {
  const isSelected = resposta === opt.valor;
  return (
    <button
      key={opt.label}
      type="button"
      disabled={locked}
      onClick={() => responderPergunta(p.key, opt.valor)}
      className="px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all"
      style={{
        background: isSelected ? opt.cor : "var(--card-alt)",
        color: isSelected ? "#fff" : "var(--ink-soft)",
        border: isSelected ? `1px solid ${opt.cor}` : "1px solid var(--line)",
        fontWeight: isSelected ? 700 : 500,
      }}
    >
      {opt.label}
    </button>
  );
})}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: AmbientesTab
// ============================================
export function AmbientesTab({
  inspection,
  locked,
  onAddAmbiente,
  onRemoveAmbiente,
  onUpdateAmbiente,
}: any) {
  const [ambienteAtivoId, setAmbienteAtivoId] = useState<string>(
    inspection.ambientes?.[0]?.id || ""
  );
  const [novoAmbienteNome, setNovoAmbienteNome] = useState("");
  const [mostrarAdicionar, setMostrarAdicionar] = useState(false);

  const ambienteAtivo =
    inspection.ambientes?.find((a: any) => a.id === ambienteAtivoId) ||
    inspection.ambientes?.[0];

  function adicionarAmbiente(nome: string) {
    if (!nome.trim()) return;
    const existe = inspection.ambientes.some(
      (a: any) => a.nome.toLowerCase() === nome.trim().toLowerCase()
    );
    if (existe) {
      alert("Já existe um ambiente com este nome.");
      return;
    }
    const itens = getItensPadrao(nome, inspection.mobiliario).map((n: string) =>
      makeItem(n)
    );
    const novo = {
      id: uid(),
      nome: nome.trim(),
      foto: getImagemPadrao(nome),
      fotos: [],
      itens,
      checklist: {},
    };
    onAddAmbiente(novo);
    setAmbienteAtivoId(novo.id);
    setNovoAmbienteNome("");
    setMostrarAdicionar(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* MENU LATERAL */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>
            Ambientes ({inspection.ambientes?.length || 0})
          </h3>
          {!locked && (
            <button
              onClick={() => setMostrarAdicionar(true)}
              className="btn-ghost rounded-full p-1"
              title="Adicionar ambiente"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        {mostrarAdicionar && (
          <div className="card p-3 space-y-2">
            <input
              type="text"
              placeholder="Nome do ambiente..."
              value={novoAmbienteNome}
              onChange={(e) => setNovoAmbienteNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarAmbiente(novoAmbienteNome)}
              className="input w-full text-xs px-3 py-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => adicionarAmbiente(novoAmbienteNome)}
                className="btn-primary rounded-lg text-xs py-1.5 px-3 flex-1"
              >
                Adicionar
              </button>
              <button
                onClick={() => setMostrarAdicionar(false)}
                className="btn-ghost rounded-lg text-xs py-1.5 px-3"
              >
                X
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {inspection.ambientes?.map((amb: any) => {
            const isSelected = amb.id === ambienteAtivo?.id;
            return (
              <button
                key={amb.id}
                onClick={() => setAmbienteAtivoId(amb.id)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-all"
                style={{
                  background: isSelected ? "var(--accent)" : "var(--card)",
                  color: isSelected ? "#fff" : "var(--ink-strong)",
                  border: "1px solid var(--line)",
                }}
              >
                <span className="truncate">{amb.nome}</span>
                <span className="text-xs opacity-70">{amb.itens?.length || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CARDS (COLUNA DIREITA) */}
      <div className="lg:col-span-3 space-y-3">
        {inspection.ambientes?.length === 0 ? (
          <div className="card p-10 text-center rounded-2xl">
            <MapPin size={30} className="mx-auto mb-2" style={{ color: "var(--ink-soft)" }} />
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Nenhum ambiente adicionado.
            </p>
          </div>
        ) : (
          inspection.ambientes?.map((amb: any, idx: number) => (
            <AmbienteCard
              key={amb.id}
              ambiente={amb}
              numero={idx + 1}
              locked={locked}
              onRemove={() => onRemoveAmbiente(amb.id)}
              onChange={(fn: any) => onUpdateAmbiente(amb.id, fn)}
            />
          ))
        )}
      </div>
    </div>
  );
}
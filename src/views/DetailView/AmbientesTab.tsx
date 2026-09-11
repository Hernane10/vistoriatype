import { useState, useCallback, useMemo } from "react";
import { Plus, Trash2, MapPin, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { getImagemPadrao } from "../../types";
import { ItemRow } from "./ItemRow";
import { TEMPLATES, makeItem, makeAmbiente } from "../../data/inspectionModel";

// ============================================
// CARD DO AMBIENTE
// ============================================
export function AmbienteCard({ ambiente, numero, locked, onRemove, onChange }: any) {
  const [open, setOpen] = useState(false);

  const fotoCapa = useMemo(() => {
    const fotoCadastrada = ambiente.fotos?.[0]?.src;
    return fotoCadastrada || getImagemPadrao(ambiente.nome);
  }, [ambiente.fotos, ambiente.nome]);

  const totalAvarias = useMemo(() => {
    return (ambiente.itens || []).reduce((acc: number, item: any) => {
      return acc + (item.temDano ? 1 : 0);
    }, 0);
  }, [ambiente.itens]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "var(--card)", border: "1px solid var(--line)" }}
    >
      {/* CABEÇALHO */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        {/* FOTO + NÚMERO */}
        <div
          className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"
          style={{ background: "var(--card-alt)" }}
        >
          <img
            src={fotoCapa}
            alt={ambiente.nome}
            className="w-full h-full object-cover"
          />
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

        {/* NOME */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-sm"
            style={{
              color: "var(--ink-strong)",
              whiteSpace: "normal",
              wordBreak: "break-word",
              lineHeight: "1.3",
            }}
          >
            {ambiente.nome}
          </h3>
        </div>

        {/* LADO DIREITO */}
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
              onClick={handleRemove}
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
  templateOpen,
  setTemplateOpen,
  addAmbiente,
  removeAmbiente,
  updateAmbiente,
  applyModel,
  customModels,
}: any) {
  const [novoNome, setNovoNome] = useState("");
  const [showModal, setShowModal] = useState(false);

  if (!inspection) return null;
  const ambientes = inspection.ambientes || [];

  const handleConfirmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    addAmbiente(novoNome.trim());
    setNovoNome("");
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* BOTÃO ADICIONAR AMBIENTE */}
      {!locked && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary rounded-full px-4 py-2 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Adicionar Ambiente
          </button>
        </div>
      )}

      {/* LISTA DE AMBIENTES */}
      {ambientes.length === 0 ? (
        <div className="card p-10 text-center rounded-2xl" style={{ background: "#252836", border: "1px solid #323546" }}>
          <MapPin size={30} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-400">
            Nenhum ambiente adicionado. Clique em "Adicionar Ambiente" para começar.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ambientes.map((amb: any, idx: number) => (
            <AmbienteCard
              key={amb.id}
              ambiente={amb}
              numero={idx + 1}
              locked={locked}
              onRemove={() => removeAmbiente(amb.id)}
              onChange={(fn: any) => updateAmbiente(amb.id, fn)}
            />
          ))}
        </div>
      )}

      {/* MODAL DE ADICIONAR AMBIENTE */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <form
            onSubmit={handleConfirmAdd}
            className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
              Novo Ambiente
            </h3>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nome do ambiente
            </label>
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Sala de Estar, Cozinha..."
              autoFocus
              className="w-full border rounded-md p-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-md text-zinc-600 hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!novoNome.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
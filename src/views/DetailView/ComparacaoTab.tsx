// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useState } from "react";
import { CheckCircle2, ChevronRight, GitCompare } from "lucide-react";
import { enderecoCompleto, fmtDate } from "../../utils/format";

export function ComparacaoTab({ inspection, allInspections }) {
  const candidatas = allInspections.filter((i) => i.id !== inspection.id);
  const mesmoEndereco = candidatas.filter(
    (i) => i.imovel.endereco && i.imovel.endereco === inspection.imovel.endereco && i.imovel.numero === inspection.imovel.numero
  );
  const lista = mesmoEndereco.length > 0 ? mesmoEndereco : candidatas;

  const [compareId, setCompareId] = useState("");
  const outra = lista.find((i) => i.id === compareId) || null;

  if (candidatas.length === 0) {
    return (
      <div className="card p-8 text-center">
        <GitCompare size={28} className="mx-auto mb-2" style={{ color: "var(--ink-soft)" }} />
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Você ainda não tem outra vistoria para comparar com esta.</p>
      </div>
    );
  }

  // A (mais antiga) -> B (mais recente), pela data
  const [A, B] = outra
    ? [outra, inspection].sort((x, y) => new Date(x.dataVistoria) - new Date(y.dataVistoria))
    : [null, null];

  const linhas = [];
  if (A && B) {
    A.ambientes.forEach((ambA) => {
      const ambB = B.ambientes.find((a) => a.nome === ambA.nome);
      ambA.itens.forEach((itA) => {
        const itB = ambB?.itens.find((it) => it.nome === itA.nome);
        if (!itB) {
          linhas.push({ ambiente: ambA.nome, item: itA.nome, tipo: "removido", estadoA: itA.estado, estadoB: null });
          return;
        }
        const mudouEstado = itA.estado !== itB.estado || itA.semTeste !== itB.semTeste;
        const mudouDano = itA.temDano !== itB.temDano || (itA.temDano && itB.temDano && itA.descricaoDano !== itB.descricaoDano);
        if (mudouEstado || mudouDano) {
          linhas.push({
            ambiente: ambA.nome, item: itA.nome, tipo: "mudou",
            estadoA: itA.semTeste ? "Sem teste" : itA.estado, estadoB: itB.semTeste ? "Sem teste" : itB.estado,
            danoA: itA.temDano ? (itA.descricaoDano || "avaria registrada") : null,
            danoB: itB.temDano ? (itB.descricaoDano || "avaria registrada") : null,
          });
        }
      });
      ambB?.itens.forEach((itB) => {
        if (!ambA.itens.find((it) => it.nome === itB.nome)) {
          linhas.push({ ambiente: ambA.nome, item: itB.nome, tipo: "novo", estadoA: null, estadoB: itB.estado });
        }
      });
    });
    B.ambientes.forEach((ambB) => {
      if (!A.ambientes.find((a) => a.nome === ambB.nome)) {
        linhas.push({ ambiente: ambB.nome, item: null, tipo: "ambiente_novo" });
      }
    });
  }

  return (
    <div>
      <div className="card p-4 mb-4">
        <label className="label block mb-1.5">Comparar com</label>
        <select className="select w-full px-4 py-2.5 text-sm" value={compareId} onChange={(e) => setCompareId(e.target.value)}>
          <option value="">Selecione uma vistoria...</option>
          {lista.map((i) => (
            <option key={i.id} value={i.id}>{i.tipo} · {fmtDate(i.dataVistoria)} · {enderecoCompleto(i.imovel) || "sem endereço"}</option>
          ))}
        </select>
        {mesmoEndereco.length === 0 && (
          <p className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>Nenhuma outra vistoria encontrada com o mesmo endereço — mostrando todas as vistorias.</p>
        )}
      </div>

      {A && B && (
        <>
          <div className="flex items-center gap-2 mb-4 text-xs flex-wrap" style={{ color: "var(--ink-soft)" }}>
            <span className="badge badge-neutral">{A.tipo} — {fmtDate(A.dataVistoria)}</span>
            <ChevronRight size={13} />
            <span className="badge badge-neutral">{B.tipo} — {fmtDate(B.dataVistoria)}</span>
          </div>

          {linhas.length === 0 ? (
            <div className="card p-6 text-center">
              <CheckCircle2 size={22} className="mx-auto mb-2" style={{ color: "var(--good)" }} />
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Nenhuma diferença encontrada entre as duas vistorias.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {linhas.map((l, i) => (
                <div key={i} className="card p-3">
                  <p className="text-xs mb-1" style={{ color: "var(--ink-soft)" }}>{l.ambiente}</p>
                  {l.tipo === "ambiente_novo" ? (
                    <p className="text-sm"><span className="badge badge-warn">Ambiente novo</span> adicionado na vistoria mais recente</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium mb-1" style={{ color: "var(--ink-strong)" }}>{l.item}</p>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {l.tipo === "novo" && <span className="badge badge-warn">Item novo</span>}
                        {l.tipo === "removido" && <span className="badge badge-neutral">Item removido</span>}
                        {l.estadoA && <span className="badge badge-neutral">{l.estadoA}</span>}
                        {l.estadoA && l.estadoB && <ChevronRight size={12} />}
                        {l.estadoB && <span className={`badge ${l.estadoB === "Bom" || l.estadoB === "Novo" ? "badge-good" : l.estadoB === "Regular" ? "badge-warn" : "badge-bad"}`}>{l.estadoB}</span>}
                      </div>
                      {(l.danoA || l.danoB) && (
                        <p className="text-xs mt-1" style={{ color: "var(--bad)" }}>
                          {l.danoA ? `Antes: ${l.danoA}` : "Sem avaria antes"} → {l.danoB ? `Agora: ${l.danoB}` : "Sem avaria agora"}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


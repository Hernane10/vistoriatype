// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Camera, Info, Printer, Share2, X } from "lucide-react";
import { LightboxContext } from "../../context/LightboxContext";
import { storage } from "../../lib/storage";
import { SignaturePad } from "../../components/SignaturePad";
import { CHAVE_TIPOS, ITEM_FIELD_DEFS } from "../../data/inspectionModel";
import { enderecoCompleto, fmtDate, fmtDateTime } from "../../utils/format";
import { fileToDataURL, maybeCompressImage } from "../../utils/media";
import { buildReportHTML } from "./buildReportHTML";

export function ReportView({ inspection, onUpdate, onClose, embedded = false }) {
  const openLightbox = useContext(LightboxContext);
  const [printHint, setPrintHint] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoFileRef = useRef(null);
  const totalItens = inspection.ambientes.reduce((a, amb) => a + amb.itens.length, 0);
  const avarias = inspection.ambientes.reduce((a, amb) => a + amb.itens.filter((it) => it.temDano).length, 0);

  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get("app-logo");
        if (r) setLogo(r.value);
      } catch {
        // no logo saved yet
      } finally {
        setLogoLoaded(true);
      }
    })();
  }, []);

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(await maybeCompressImage(file));
    setLogo(dataUrl);
    try {
      await storage.set("app-logo", dataUrl);
    } catch {
      // ignore save failure, logo still shown for this session
    }
    e.target.value = "";
  }

  async function handleRemoveLogo() {
    setLogo(null);
    try {
      await storage.delete("app-logo");
    } catch {
      // ignore
    }
  }

  function handlePrint() {
    const html = buildReportHTML(inspection, logo);
    try {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) {
        setPrintHint(true);
      }
    } catch {
      setPrintHint(true);
    }
  }

  function buildShareText() {
    const totalItensLocal = inspection.ambientes.reduce((a, amb) => a + amb.itens.length, 0);
    const avariasLocal = inspection.ambientes.reduce((a, amb) => a + amb.itens.filter((it) => it.temDano).length, 0);
    return [
      `📋 Laudo de Vistoria — VistorIA`,
      `PEREIRA Gestão Imobiliária`,
      ``,
      `Tipo: ${inspection.tipo}`,
      `Data: ${fmtDate(inspection.dataVistoria)}`,
      `Vistoriador: ${inspection.vistoriador || "—"}`,
      `Endereço: ${enderecoCompleto(inspection.imovel) || "—"}`,
      `Status: ${inspection.status}`,
      ``,
      `Resumo: ${inspection.ambientes.length} ambientes, ${totalItensLocal} itens, ${avariasLocal} avarias`,
      ``,
      `Gere o PDF completo pelo botão "Imprimir / salvar PDF" no VistorIA e anexe aqui.`,
    ].join("\n");
  }

  async function handleShare() {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Laudo de Vistoria — VistorIA", text });
        return;
      } catch {
        // fell through to WhatsApp link below if share was cancelled/unsupported
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const medidoresList = [
    { label: "Água", d: inspection.medidores.agua },
    { label: "Energia", d: inspection.medidores.energia },
    { label: "Gás", d: inspection.medidores.gas },
  ].filter((m) => m.d.ativo);

  const chavesList = [
    ...CHAVE_TIPOS.map((t) => ({ label: t.label, ...inspection.chaves[t.key] })),
    ...inspection.chaves.outras.map((o) => ({ label: o.nome, ...o })),
  ].filter((c) => c.quantidade || c.observacoes);

  return (
    <div className={embedded ? "" : "min-h-full"}>
      <div className={`topbar px-6 py-4 flex items-center justify-between no-print flex-wrap gap-2 ${embedded ? "rounded-2xl mb-4" : ""}`}>
        <div className="flex items-center gap-3">
          {!embedded && (
            <button onClick={onClose} className="btn-ghost rounded-full p-2">
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="display text-base font-bold">Laudo de vistoria</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="btn-secondary rounded-full px-4 py-2 text-sm flex items-center gap-2">
            <Share2 size={15} /> Compartilhar
          </button>
          <button onClick={handlePrint} className="btn-primary rounded-full px-4 py-2 text-sm flex items-center gap-2">
            <Printer size={15} /> Imprimir / salvar PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-3 no-print">
        <div className="rounded-xl px-4 py-3 text-xs flex items-start gap-2" style={{ background: "var(--card-alt)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>
          <Info size={14} className="shrink-0 mt-0.5" />
          <span>
            O botão abre o laudo pronto em uma nova aba, já formatado para leitura e impressão — use o botão
            "Imprimir / salvar como PDF" dentro dessa aba. {printHint && (
              <>Se a aba não abriu, seu navegador pode ter bloqueado o pop-up: permita pop-ups para este site e toque no botão novamente.</>
            )}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 print-area">
        <div className="card p-10">
          <div className="flex items-start justify-between mb-6 pb-4 divider">
            <div className="flex items-start gap-4">
              {logoLoaded && (
                logo ? (
                  <div className="relative group">
                    <img src={logo} alt="Logo" style={{ height: 52, maxWidth: 140, objectFit: "contain" }} />
                    <button
                      onClick={handleRemoveLogo}
                      className="no-print absolute -top-2 -right-2 rounded-full bg-black/60 text-white flex items-center justify-center"
                      style={{ width: 16, height: 16 }}
                      title="Remover logo"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => logoFileRef.current?.click()}
                    className="btn-ghost rounded-xl px-3 py-2 text-xs flex flex-col items-center justify-center gap-1 no-print"
                    style={{ width: 90, height: 52 }}
                  >
                    <Camera size={14} />
                    Add. logo
                  </button>
                )
              )}
              <input ref={logoFileRef} type="file" accept="image/*" className="hidden no-print" onChange={handleLogoUpload} />
              <div>
                <h1 className="display text-2xl font-bold">Vistor<span style={{ color: "var(--accent)" }}>IA</span> — Laudo de Vistoria</h1>
                <p className="text-sm mono mt-1" style={{ color: "var(--ink-soft)" }}>Vistoria de {inspection.tipo.toLowerCase()}</p>
              </div>
            </div>
            {inspection.status === "Finalizada" && (
              <div className="stamp px-4 py-2 text-xs">FINALIZADA<br />{fmtDate(inspection.dataVistoria)}</div>
            )}
          </div>

          {inspection.capaFoto && (
            <div className="mb-6 print-block">
              <img
                src={inspection.capaFoto.src}
                alt="Foto do imóvel"
                loading="lazy"
                className="cursor-zoom-in"
                style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)" }}
                onClick={() => openLightbox(inspection.capaFoto.src)}
              />
              {inspection.capaFoto.date && (
                <p className="text-[10px] mono mt-1" style={{ color: "var(--ink-soft)" }}>Foto registrada em {fmtDateTime(inspection.capaFoto.date)}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="label block mb-0.5">Data</span>{fmtDate(inspection.dataVistoria)}</div>
            <div><span className="label block mb-0.5">Vistoriador</span>{inspection.vistoriador || "—"}</div>
            <div className="col-span-2"><span className="label block mb-0.5">Endereço</span>{enderecoCompleto(inspection.imovel) || "—"}</div>
            {inspection.imovel.cep && <div><span className="label block mb-0.5">CEP</span>{inspection.imovel.cep}</div>}
            <div><span className="label block mb-0.5">Tipo de imóvel</span>{inspection.imovel.tipoImovel}</div>
            <div><span className="label block mb-0.5">Situação (mobiliário)</span>{inspection.mobiliario}</div>
            {inspection.imovel.metragem && <div><span className="label block mb-0.5">Metragem</span>{inspection.imovel.metragem}</div>}
            <div><span className="label block mb-0.5">Proprietário</span>{inspection.imovel.proprietario || "—"}</div>
            <div><span className="label block mb-0.5">Inquilino</span>{inspection.imovel.inquilino || "—"}</div>
            <div className="col-span-2"><span className="label block mb-0.5">Resumo</span>{inspection.ambientes.length} ambientes, {totalItens} itens, {avarias} avarias</div>
          </div>

          {inspection.ambientes.map((amb, ambIdx) => (
            <div key={amb.id} className="mb-6 print-ambiente">
              <h2 className="display text-base font-bold mb-2 pb-1 divider flex items-center gap-2">
                <span className="mono font-bold flex items-center justify-center rounded-full" style={{ width: 20, height: 20, fontSize: 10, background: "var(--accent)", color: "#F3E4E7" }}>
                  {String(ambIdx + 1).padStart(2, "0")}
                </span>
                {amb.nome}
              </h2>
              {(amb.fotos || []).length > 0 && (
                <div className="mb-3">
                  <p className="label mb-1.5">Fotos/vídeos gerais do ambiente</p>
                  <div className="flex gap-2 flex-wrap">
                    {amb.fotos.map((foto, fi) => (
                      <div key={fi} className="text-center">
                        <img
                          src={foto.src}
                          alt=""
                          loading="lazy"
                          className="rounded-md object-cover cursor-zoom-in"
                          style={{ width: 70, height: 70, border: "1px solid var(--line)" }}
                          onClick={() => openLightbox(foto.src)}
                        />
                        {foto.date && <p className="text-[9px] mono mt-0.5" style={{ color: "var(--ink-soft)" }}>{fmtDateTime(foto.date)}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid gap-3">
                {amb.itens.map((item) => {
                  const camposPreenchidos = ITEM_FIELD_DEFS.filter((f) => (item.campos || {})[f.key]);
                  return (
                    <div key={item.id} className="text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{item.nome}</span>
                        {item.semTeste ? (
                          <span className="badge badge-neutral">Sem teste</span>
                        ) : (
                          <span className={`badge ${item.estado === "Bom" || item.estado === "Novo" ? "badge-good" : item.estado === "Regular" ? "badge-warn" : item.estado === "Péssimo" ? "badge-worse" : "badge-bad"}`}>
                            {item.estado}
                          </span>
                        )}
                        {item.temDano && <span className="badge badge-bad flex items-center gap-1"><AlertTriangle size={10} /> Avaria</span>}
                      </div>
                      {camposPreenchidos.length > 0 && (
                        <p className="mt-1 text-xs" style={{ color: "var(--ink-soft)" }}>
                          {camposPreenchidos.map((f) => `${f.label}: ${item.campos[f.key]}`).join(" · ")}
                        </p>
                      )}
                      {item.observacoes && <p className="mt-1" style={{ color: "var(--ink-soft)" }}>{item.observacoes}</p>}
                      {item.temDano && item.descricaoDano && (
                        <p className="mt-1" style={{ color: "var(--bad)" }}>Avaria: {item.descricaoDano}</p>
                      )}
                      {item.fotos.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {item.fotos.map((foto, i) => {
                            const marcasObj = foto.marcas || null;
                            const pontos = Array.isArray(marcasObj) ? marcasObj : (marcasObj?.points || []);
                            const comentarioMarcacao = Array.isArray(marcasObj) ? "" : (marcasObj?.comentario || "");
                            return (
                              <div key={i} className="text-center" style={{ maxWidth: 90 }}>
                                <div className="relative inline-block" style={{ width: 70, height: 70 }}>
                                  <img
                                    src={foto.src}
                                    alt=""
                                    loading="lazy"
                                    className="rounded-md object-cover cursor-zoom-in"
                                    style={{ width: 70, height: 70, border: "1px solid var(--line)" }}
                                    onClick={() => openLightbox(foto.src)}
                                  />
                                  {pontos.map((p, mi) => (
                                    <div
                                      key={mi}
                                      style={{
                                        position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)",
                                        width: 13, height: 13, borderRadius: "50%", border: "2px solid #E23B3B", background: "rgba(226,59,59,0.3)",
                                        color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                                      }}
                                    >
                                      {mi + 1}
                                    </div>
                                  ))}
                                </div>
                                {foto.date && <p className="text-[9px] mono mt-0.5" style={{ color: "var(--ink-soft)" }}>{fmtDateTime(foto.date)}</p>}
                                {comentarioMarcacao && <p className="text-[9px] mt-0.5" style={{ color: "var(--bad)" }}>{comentarioMarcacao}</p>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {medidoresList.length > 0 && (
            <div className="mb-6 print-block">
              <h2 className="display text-base font-bold mb-2 pb-1 divider">Medidores</h2>
              <div className="grid gap-2 text-sm">
                {medidoresList.map((m) => (
                  <div key={m.label}>
                    <span className="font-medium">{m.label}</span>
                    <span style={{ color: "var(--ink-soft)" }}>
                      {" — "}{m.d.numero ? `nº ${m.d.numero}` : ""}{m.d.leitura ? ` · leitura ${m.d.leitura}${m.d.unidade ? " " + m.d.unidade : ""}` : ""}{m.d.concessionaria ? ` · ${m.d.concessionaria}` : ""}{m.d.observacoes ? ` · ${m.d.observacoes}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chavesList.length > 0 && (
            <div className="mb-6 print-block">
              <h2 className="display text-base font-bold mb-2 pb-1 divider">Chaves</h2>
              <div className="grid gap-1 text-sm">
                {chavesList.map((c, i) => (
                  <div key={i}>
                    <span className="font-medium">{c.label}</span>
                    <span style={{ color: "var(--ink-soft)" }}>
                      {c.quantidade ? ` — qtd. ${c.quantidade}` : ""}{c.observacoes ? ` · ${c.observacoes}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="divider pt-6 mt-8 flex gap-6 flex-wrap">
            <SignaturePad
              label="Assinatura do vistoriador"
              value={inspection.signatures?.vistoriador}
              locked={inspection.status === "Finalizada"}
              onSave={(dataUrl) => onUpdate((insp) => ({ ...insp, signatures: { ...insp.signatures, vistoriador: dataUrl } }))}
            />
            <SignaturePad
              label="Assinatura do locador"
              value={inspection.signatures?.locador}
              locked={inspection.status === "Finalizada"}
              onSave={(dataUrl) => onUpdate((insp) => ({ ...insp, signatures: { ...insp.signatures, locador: dataUrl } }))}
            />
            <SignaturePad
              label="Assinatura do locatário"
              value={inspection.signatures?.locatario}
              locked={inspection.status === "Finalizada"}
              onSave={(dataUrl) => onUpdate((insp) => ({ ...insp, signatures: { ...insp.signatures, locatario: dataUrl } }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { CHAVE_TIPOS, ITEM_FIELD_DEFS } from "../../data/inspectionModel";
import { enderecoCompleto, escapeHtml, fmtDate, fmtDateTime } from "../../utils/format";

export function mediaHtml(foto) {
  const cap = foto.date ? `<p style="font-size:10px;color:#a8828a;margin:5px 0 0;font-family:'JetBrains Mono',monospace">${escapeHtml(fmtDateTime(foto.date))}</p>` : "";
  if (foto.type === "video") {
    return `<div class="media-card"><video src="${foto.src}" controls style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;background:#000;display:block"></video><div style="padding:6px 8px">${cap || '<span style="font-size:10px;color:#a8828a">Vídeo</span>'}</div></div>`;
  }
  if (foto.type === "audio") {
    return `<div class="media-card" style="width:180px"><div style="padding:10px 10px 4px"><audio src="${foto.src}" controls style="width:100%"></audio></div><div style="padding:0 10px 8px">${cap || '<span style="font-size:10px;color:#a8828a">Áudio</span>'}</div></div>`;
  }
  const marcas = foto.marcas || null;
  const pontos = Array.isArray(marcas) ? marcas : (marcas?.points || []);
  const comentarioMarcacao = Array.isArray(marcas) ? "" : (marcas?.comentario || "");
  const marcasHtml = pontos.map((p, i) => `<div style="position:absolute;left:${p.x}%;top:${p.y}%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 2px #E23B3B;background:#E23B3B;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${i + 1}</div>`).join("");
  const comentarioHtml = comentarioMarcacao ? `<p style="font-size:10.5px;color:#b23e2a;margin:4px 0 0;font-weight:600">⚠ ${escapeHtml(comentarioMarcacao)}</p>` : "";
  return `<div class="media-card"><div style="position:relative;width:100%;height:120px"><img src="${foto.src}" class="zoomable-photo" loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;cursor:zoom-in;display:block" />${marcasHtml}</div><div style="padding:6px 8px">${cap}${comentarioHtml}</div></div>`;
}

// Builds a fully standalone, self-contained HTML document (light theme, print-ready)
// so the report can be opened in a real new browser tab — this avoids relying on
// window.print() inside the sandboxed artifact iframe, which some browsers block.


export function buildReportHTML(inspection, logo) {
  const totalItens = inspection.ambientes.reduce((a, amb) => a + amb.itens.length, 0);
  const avarias = inspection.ambientes.reduce((a, amb) => a + amb.itens.filter((it) => it.temDano).length, 0);

  const medidoresList = [
    { label: "Água", d: inspection.medidores.agua },
    { label: "Energia", d: inspection.medidores.energia },
    { label: "Gás", d: inspection.medidores.gas },
  ].filter((m) => m.d.ativo);

  const chavesList = [
    ...CHAVE_TIPOS.map((t) => ({ label: t.label, ...inspection.chaves[t.key] })),
    ...inspection.chaves.outras.map((o) => ({ label: o.nome, ...o })),
  ].filter((c) => c.quantidade || c.observacoes || (c.fotos || []).length);

  const estadoColors = {
    "Novo": ["#e5f6ec", "#2e8f57"], "Bom": ["#e5f6ec", "#2e8f57"],
    "Regular": ["#fdf1dc", "#a97a1f"], "Ruim": ["#fbe4e1", "#b23e2a"],
    "Péssimo": ["#f5d9dd", "#8e2e3d"], "Sem teste": ["#eef0f2", "#6b7280"],
  };

  const ambientesHtml = inspection.ambientes.map((amb, ambIdx) => {
    const fotosAmbienteHtml = (amb.fotos || []).length
      ? `<div style="margin-bottom:14px"><p class="eyebrow">Fotos/vídeos gerais do ambiente</p><div class="media-grid">${amb.fotos.map(mediaHtml).join("")}</div></div>` : "";
    const itensHtml = amb.itens.map((item) => {
      const camposPreenchidos = ITEM_FIELD_DEFS.filter((f) => (item.campos || {})[f.key]);
      const estadoLabel = item.semTeste ? "Sem teste" : item.estado;
      const [bg, fg] = estadoColors[estadoLabel] || estadoColors["Sem teste"];
      const camposLine = camposPreenchidos.length
        ? `<p class="meta-line">${camposPreenchidos.map((f) => `<strong>${f.label}:</strong> ${escapeHtml(item.campos[f.key])}`).join(" &nbsp;·&nbsp; ")}</p>` : "";
      const obsLine = item.observacoes ? `<p class="obs-line">${escapeHtml(item.observacoes)}</p>` : "";
      const danoLine = item.temDano && item.descricaoDano ? `<p class="dano-line">⚠ Avaria: ${escapeHtml(item.descricaoDano)}</p>` : "";
      const fotosHtml = (item.fotos || []).length ? `<div class="media-grid" style="margin-top:8px">${item.fotos.map(mediaHtml).join("")}</div>` : "";
      return `
        <div class="item-card">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
            <strong style="font-size:14px">${escapeHtml(item.nome)}</strong>
            <span class="pill" style="background:${bg};color:${fg}">${escapeHtml(estadoLabel)}</span>
            ${item.temDano ? `<span class="pill" style="background:#fbe4e1;color:#b23e2a">Avaria</span>` : ""}
          </div>
          ${camposLine}${obsLine}${danoLine}${fotosHtml}
        </div>`;
    }).join("");
    return `
      <div class="section-card">
        <h2 class="section-title"><span class="section-num">${String(ambIdx + 1).padStart(2, "0")}</span>${escapeHtml(amb.nome)}</h2>
        ${fotosAmbienteHtml}
        ${itensHtml}
      </div>`;
  }).join("");

  const medidoresHtml = medidoresList.length ? `
    <div class="section-card">
      <h2 class="section-title"><span class="section-num" style="background:#3d7a57">💧</span>Medidores</h2>
      ${medidoresList.map((m) => `
        <div class="item-card">
          <strong style="font-size:14px">${m.label}</strong>
          <p class="meta-line">${[
            m.d.numero && `<strong>Nº:</strong> ${m.d.numero}`,
            m.d.leitura && `<strong>Leitura:</strong> ${m.d.leitura}${m.d.unidade ? " " + m.d.unidade : ""}`,
            m.d.concessionaria && `<strong>Concessionária:</strong> ${m.d.concessionaria}`,
          ].filter(Boolean).join(" &nbsp;·&nbsp; ")}</p>
          ${m.d.observacoes ? `<p class="obs-line">${escapeHtml(m.d.observacoes)}</p>` : ""}
          ${(m.d.fotos || []).length ? `<div class="media-grid" style="margin-top:8px">${m.d.fotos.map(mediaHtml).join("")}</div>` : ""}
        </div>
      `).join("")}
    </div>` : "";

  const chavesHtml = chavesList.length ? `
    <div class="section-card">
      <h2 class="section-title"><span class="section-num" style="background:#a97a1f">🔑</span>Chaves e acessos</h2>
      ${chavesList.map((c) => `
        <div class="item-card">
          <strong style="font-size:14px">${escapeHtml(c.label)}</strong>
          <p class="meta-line">${[c.quantidade && `<strong>Qtd.:</strong> ${c.quantidade}`, c.observacoes && escapeHtml(c.observacoes)].filter(Boolean).join(" &nbsp;·&nbsp; ")}</p>
          ${(c.fotos || []).length ? `<div class="media-grid" style="margin-top:8px">${c.fotos.map(mediaHtml).join("")}</div>` : ""}
        </div>
      `).join("")}
    </div>` : "";

  const capaHtml = inspection.capaFoto ? `
    <div style="margin-bottom:22px">
      <img src="${inspection.capaFoto.src}" class="zoomable-photo" style="width:100%;max-height:300px;object-fit:cover;border-radius:14px;cursor:zoom-in;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.12)" />
    </div>` : "";

  const sigHtml = (label, src) => `
    <div style="flex:1;min-width:200px">
      <p class="eyebrow">${label}</p>
      ${src ? `<img src="${src}" style="width:100%;height:90px;object-fit:contain;border:1px solid #e7dcd6;border-radius:10px;background:#fff" />` : `<div style="width:100%;height:90px;border:1.5px dashed #d9cec7;border-radius:10px"></div>`}
      <div style="border-top:1px solid #e7dcd6;margin-top:36px;padding-top:4px;font-size:10px;text-align:center;color:#a8828a">Assinatura manual (se necessário)</div>
    </div>`;

  const logoHtml = logo ? `<img src="${logo}" style="height:56px;max-width:150px;object-fit:contain;border-radius:8px" />` : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Laudo de Vistoria — ${escapeHtml(enderecoCompleto(inspection.imovel) || "VistorIA")}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #2a1c20; margin: 0; padding: 24px; background: #f4efea; }
  .toolbar { position: sticky; top: 0; background: #f4efea; padding: 10px 0 16px; display: flex; justify-content: flex-end; gap: 8px; z-index: 10; }
  .toolbar button { background: #A23A4C; color: #fff; border: none; border-radius: 999px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(162,58,76,0.25); }
  .wrap { max-width: 780px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 32px; box-shadow: 0 8px 30px rgba(40,20,25,0.08); }

  .eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #93636d; margin: 0 0 4px; }

  .section-card {
    background: #fbf8f6; border: 1px solid #eee0da; border-radius: 16px;
    padding: 18px 20px; margin-bottom: 18px; break-inside: avoid; page-break-inside: avoid;
  }
  .section-title {
    display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700;
    margin: 0 0 14px; padding-bottom: 10px; border-bottom: 2px solid #eee0da; color: #4e1b26;
  }
  .section-num {
    display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px;
    border-radius: 999px; background: #A23A4C; color: #fff; font-size: 11px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
  }

  .item-card {
    background: #fff; border: 1px solid #f0e6e1; border-radius: 12px;
    padding: 12px 14px; margin-bottom: 10px; break-inside: avoid; page-break-inside: avoid;
  }
  .item-card:last-child { margin-bottom: 0; }

  .pill {
    display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.03em; padding: 3px 10px; border-radius: 999px;
  }

  .meta-line { font-size: 12px; color: #7a5a60; margin: 4px 0; line-height: 1.5; }
  .obs-line { font-size: 12.5px; color: #3a2a2e; margin: 6px 0; line-height: 1.5; }
  .dano-line { font-size: 12.5px; color: #b23e2a; font-weight: 600; margin: 6px 0; line-height: 1.5; }

  .media-grid { display: flex; gap: 10px; flex-wrap: wrap; }
  .media-card {
    width: 130px; border: 1px solid #eee0da; border-radius: 10px; overflow: hidden;
    background: #fff; box-shadow: 0 2px 6px rgba(40,20,25,0.06); break-inside: avoid;
  }

  #photo-lightbox { display: none; position: fixed; inset: 0; background: rgba(10,11,16,0.92); z-index: 1000; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  #photo-lightbox.open { display: flex; }
  #photo-lightbox img { max-width: 94vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
  #photo-lightbox button { position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border-radius: 999px; background: rgba(255,255,255,0.15); color: #fff; border: none; font-size: 18px; cursor: pointer; }

  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none; }
    #photo-lightbox { display: none !important; }
    .wrap { box-shadow: none; border-radius: 0; padding: 12px; max-width: 100%; }
    .section-card { background: #fff; border: 1px solid #eee; }
  }
</style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimir / salvar como PDF</button></div>
  <div id="photo-lightbox" onclick="this.classList.remove('open')">
    <button onclick="event.stopPropagation();document.getElementById('photo-lightbox').classList.remove('open')">✕</button>
    <img id="photo-lightbox-img" src="" alt="" />
  </div>
  <div class="wrap">
    <div style="height:6px;background:linear-gradient(90deg,#A23A4C,#c96a7a);border-radius:999px;margin-bottom:20px"></div>
    <div style="display:flex;align-items:flex-start;gap:16px;justify-content:space-between;margin-bottom:20px">
      <div style="display:flex;align-items:flex-start;gap:14px">
        ${logoHtml}
        <div>
          <h1 style="font-size:24px;margin:0;color:#4e1b26">VistorIA <span style="color:#A23A4C">—</span> Laudo de Vistoria</h1>
          <p style="font-size:12px;color:#93636d;margin:4px 0 0;font-weight:700">PEREIRA Gestão Imobiliária</p>
          <p style="font-size:12px;color:#93636d;margin:2px 0 0">Vistoria de ${escapeHtml(inspection.tipo.toLowerCase())}</p>
        </div>
      </div>
      ${inspection.status === "Finalizada" ? `<div style="border:2.5px solid #3fa76b;color:#3fa76b;border-radius:999px;padding:8px 16px;font-weight:700;font-size:12px;transform:rotate(-6deg);white-space:nowrap">✓ FINALIZADA<br/>${escapeHtml(fmtDate(inspection.dataVistoria))}</div>` : ""}
    </div>

    ${capaHtml}

    <div class="section-card" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:13.5px">
      <div><p class="eyebrow">Data</p>${escapeHtml(fmtDate(inspection.dataVistoria))}</div>
      <div><p class="eyebrow">Vistoriador</p>${escapeHtml(inspection.vistoriador || "—")}</div>
      <div style="grid-column:1 / -1"><p class="eyebrow">Endereço</p>${escapeHtml(enderecoCompleto(inspection.imovel) || "—")}</div>
      ${inspection.imovel.cep ? `<div><p class="eyebrow">CEP</p>${escapeHtml(inspection.imovel.cep)}</div>` : ""}
      <div><p class="eyebrow">Tipo de imóvel</p>${escapeHtml(inspection.imovel.tipoImovel)}</div>
      <div><p class="eyebrow">Situação (mobiliário)</p>${escapeHtml(inspection.mobiliario)}</div>
      ${inspection.imovel.metragem ? `<div><p class="eyebrow">Metragem</p>${escapeHtml(inspection.imovel.metragem)}</div>` : ""}
      <div><p class="eyebrow">Proprietário</p>${escapeHtml(inspection.imovel.proprietario || "—")}</div>
      <div><p class="eyebrow">Inquilino</p>${escapeHtml(inspection.imovel.inquilino || "—")}</div>
      <div style="grid-column:1 / -1;padding-top:6px;border-top:1px dashed #eee0da"><p class="eyebrow">Resumo</p><strong>${inspection.ambientes.length}</strong> ambientes &nbsp;·&nbsp; <strong>${totalItens}</strong> itens ${avarias > 0 ? `&nbsp;·&nbsp; <span style="color:#b23e2a;font-weight:700">${avarias} avarias</span>` : ""}</div>
    </div>

    ${ambientesHtml}
    ${medidoresHtml}
    ${chavesHtml}

    <div style="display:flex;gap:20px;flex-wrap:wrap;border-top:1px dashed #ddd;padding-top:20px;margin-top:20px">
      ${sigHtml("Assinatura do vistoriador", inspection.signatures?.vistoriador)}
      ${sigHtml("Assinatura do locador", inspection.signatures?.locador)}
      ${sigHtml("Assinatura do locatário", inspection.signatures?.locatario)}
    </div>
  </div>
  <script>
    document.addEventListener('click', function (e) {
      var img = e.target.closest('.zoomable-photo');
      if (!img) return;
      var lightbox = document.getElementById('photo-lightbox');
      document.getElementById('photo-lightbox-img').src = img.src;
      lightbox.classList.add('open');
    });
  </script>
</body>
</html>`;
}


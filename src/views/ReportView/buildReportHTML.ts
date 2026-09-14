// Builds a fully standalone, self-contained HTML "report site" (not just a
// static document) so it can be opened in a real new browser tab and printed
// to PDF from there — this avoids relying on window.print() inside the
// sandboxed artifact iframe, which some browsers block.
//
// Interactive features (all plain HTML/CSS/JS, no framework, since this has
// to run as a standalone document): collapsible sections per ambiente, a jump
// navigation bar, a text search box, a "mostrar só avarias" filter, and a
// click-to-zoom lightbox on every photo — similar in spirit to how apps like
// Bsoft present a finished vistoria.

import { CHAVE_TIPOS, ITEM_FIELD_DEFS } from "../../data/inspectionModel";
import { enderecoCompleto, escapeHtml, fmtDate, fmtDateTime } from "../../utils/format";
import type { Chave, Foto, Inspection, Item } from "../../types/inspection";

export function mediaHtml(foto: Foto, caption = ""): string {
  const cap = foto.date
    ? `<p style="font-size:10px;color:#a8828a;margin:5px 0 0;font-family:'JetBrains Mono',monospace">${escapeHtml(fmtDateTime(foto.date))}</p>`
    : "";
  if (foto.type === "video") {
    return `<div class="media-card"><video src="${foto.src}" controls style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;background:#000;display:block"></video><div style="padding:6px 8px">${cap || '<span style="font-size:10px;color:#a8828a">Vídeo</span>'}</div></div>`;
  }
  if (foto.type === "audio") {
    return `<div class="media-card" style="width:180px"><div style="padding:10px 10px 4px"><audio src="${foto.src}" controls style="width:100%"></audio></div><div style="padding:0 10px 8px">${cap || '<span style="font-size:10px;color:#a8828a">Áudio</span>'}</div></div>`;
  }
  const marcas = foto.marcas || null;
  const pontos = Array.isArray(marcas) ? marcas : marcas?.points || [];
  const comentarioMarcacao = Array.isArray(marcas) ? "" : marcas?.comentario || "";
  const marcasHtml = pontos
    .map(
      (p, i) =>
        `<div style="position:absolute;left:${p.x}%;top:${p.y}%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 2px #E23B3B;background:#E23B3B;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${i + 1}</div>`
    )
    .join("");
  const comentarioHtml = comentarioMarcacao
    ? `<p style="font-size:10.5px;color:#b23e2a;margin:4px 0 0;font-weight:600">⚠ ${escapeHtml(comentarioMarcacao)}</p>`
    : "";
  const fullCaption = [caption, comentarioMarcacao ? `⚠ ${comentarioMarcacao}` : ""].filter(Boolean).join(" — ");
  return `<div class="media-card"><div style="position:relative;width:100%;height:120px"><img src="${foto.src}" class="zoomable-photo" data-caption="${escapeHtml(fullCaption)}" loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;cursor:zoom-in;display:block" />${marcasHtml}</div><div style="padding:6px 8px">${cap}${comentarioHtml}</div></div>`;
}

const ESTADO_COLORS: Record<string, [string, string]> = {
  Novo: ["#e5f6ec", "#2e8f57"],
  Bom: ["#e5f6ec", "#2e8f57"],
  Regular: ["#fdf1dc", "#a97a1f"],
  Ruim: ["#fbe4e1", "#b23e2a"],
  Péssimo: ["#f5d9dd", "#8e2e3d"],
  "Sem teste": ["#eef0f2", "#6b7280"],
};

function itemCardHtml(item: Item): string {
  const camposPreenchidos = ITEM_FIELD_DEFS.filter((f) => (item.campos || {})[f.key]);
  const estadoLabel = item.semTeste ? "Sem teste" : item.estado;
  const [bg, fg] = ESTADO_COLORS[estadoLabel] || ESTADO_COLORS["Sem teste"];
  const camposLine = camposPreenchidos.length
    ? `<p class="meta-line">${camposPreenchidos.map((f) => `<strong>${f.label}:</strong> ${escapeHtml(item.campos[f.key])}`).join(" &nbsp;·&nbsp; ")}</p>`
    : "";
  const obsLine = item.observacoes ? `<p class="obs-line">${escapeHtml(item.observacoes)}</p>` : "";
  const danoLine = item.temDano && item.descricaoDano ? `<p class="dano-line">⚠ Avaria: ${escapeHtml(item.descricaoDano)}</p>` : "";
  const fotosHtml = (item.fotos || []).length
    ? `<div class="media-grid" style="margin-top:8px">${item.fotos.map((f) => mediaHtml(f, `${item.nome} — ${estadoLabel}`)).join("")}</div>`
    : "";
  const searchKey = item.nome.toLowerCase().replace(/"/g, "");
  return `
    <div class="item-card" data-nome="${escapeHtml(searchKey)}" data-avaria="${item.temDano ? "true" : "false"}" data-estado="${escapeHtml(estadoLabel)}">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
        <strong style="font-size:14px">${escapeHtml(item.nome)}</strong>
        <span class="pill" style="background:${bg};color:${fg}">${escapeHtml(estadoLabel)}</span>
        ${item.temDano ? `<span class="pill" style="background:#fbe4e1;color:#b23e2a">Avaria</span>` : ""}
      </div>
      ${camposLine}${obsLine}${danoLine}${fotosHtml}
    </div>`;
}

export function buildReportHTML(inspection: Inspection, logo: string | null): string {
  const totalItens = inspection.ambientes.reduce((a, amb) => a + amb.itens.length, 0);
  const totalAvarias = inspection.ambientes.reduce((a, amb) => a + amb.itens.filter((it) => it.temDano).length, 0);
  const totalFotos = inspection.ambientes.reduce(
    (a, amb) => a + (amb.fotos?.length || 0) + amb.itens.reduce((b, it) => b + (it.fotos?.length || 0), 0),
    0
  );

  const medidoresList = [
    { label: "Água", d: inspection.medidores.agua },
    { label: "Energia", d: inspection.medidores.energia },
    { label: "Gás", d: inspection.medidores.gas },
  ].filter((m) => m.d.ativo);

  const chavesMap = inspection.chaves as unknown as Record<string, Chave>;
  const chavesList: (Chave & { label: string })[] = [
    ...CHAVE_TIPOS.map((t) => ({ label: t.label, ...chavesMap[t.key] })),
    ...inspection.chaves.outras.map((o) => ({ label: o.nome, ...o })),
  ].filter((c) => c.quantidade || c.observacoes || (c.fotos || []).length);

  // Jump-navigation pills: one per ambiente, plus the fixed sections that exist.
  const navItems: { id: string; label: string }[] = [{ id: "resumo", label: "Resumo" }];
  inspection.ambientes.forEach((amb, i) => navItems.push({ id: `amb-${i}`, label: `${String(i + 1).padStart(2, "0")} ${amb.nome}` }));
  if (medidoresList.length) navItems.push({ id: "medidores", label: "Medidores" });
  if (chavesList.length) navItems.push({ id: "chaves", label: "Chaves" });
  navItems.push({ id: "assinaturas", label: "Assinaturas" });
  const navHtml = navItems.map((n) => `<a href="#${n.id}" class="nav-pill">${escapeHtml(n.label)}</a>`).join("");

  const ambientesHtml = inspection.ambientes
    .map((amb, ambIdx) => {
      const fotosAmbienteHtml = (amb.fotos || []).length
        ? `<div style="margin-bottom:14px"><p class="eyebrow">Fotos/vídeos gerais do ambiente</p><div class="media-grid">${amb.fotos.map((f) => mediaHtml(f, amb.nome)).join("")}</div></div>`
        : "";
      const avariasAmb = amb.itens.filter((it) => it.temDano).length;
      const itensHtml = amb.itens.map(itemCardHtml).join("");
      return `
      <details class="section-card" id="amb-${ambIdx}" open data-section>
        <summary class="section-title">
          <span class="section-num">${String(ambIdx + 1).padStart(2, "0")}</span>
          <span style="flex:1">${escapeHtml(amb.nome)}</span>
          <span class="section-meta">${amb.itens.length} ${amb.itens.length === 1 ? "item" : "itens"}${avariasAmb > 0 ? ` · <span style="color:#b23e2a">${avariasAmb} avaria${avariasAmb > 1 ? "s" : ""}</span>` : ""}</span>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </summary>
        <div class="section-body">
          ${fotosAmbienteHtml}
          ${itensHtml}
        </div>
      </details>`;
    })
    .join("");

  const medidoresHtml = medidoresList.length
    ? `
    <details class="section-card" id="medidores" open data-section>
      <summary class="section-title">
        <span class="section-num" style="background:#3d7a57">💧</span>
        <span style="flex:1">Medidores</span>
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </summary>
      <div class="section-body">
        ${medidoresList
          .map(
            (m) => `
          <div class="item-card" data-nome="${escapeHtml(m.label.toLowerCase())}" data-avaria="false">
            <strong style="font-size:14px">${m.label}</strong>
            <p class="meta-line">${[
              m.d.numero && `<strong>Nº:</strong> ${m.d.numero}`,
              m.d.leitura && `<strong>Leitura:</strong> ${m.d.leitura}${m.d.unidade ? " " + m.d.unidade : ""}`,
              m.d.concessionaria && `<strong>Concessionária:</strong> ${m.d.concessionaria}`,
            ]
              .filter(Boolean)
              .join(" &nbsp;·&nbsp; ")}</p>
            ${m.d.observacoes ? `<p class="obs-line">${escapeHtml(m.d.observacoes)}</p>` : ""}
            ${(m.d.fotos || []).length ? `<div class="media-grid" style="margin-top:8px">${m.d.fotos.map(mediaHtml).join("")}</div>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    </details>`
    : "";

  const chavesHtml = chavesList.length
    ? `
    <details class="section-card" id="chaves" open data-section>
      <summary class="section-title">
        <span class="section-num" style="background:#a97a1f">🔑</span>
        <span style="flex:1">Chaves e acessos</span>
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </summary>
      <div class="section-body">
        ${chavesList
          .map(
            (c) => `
          <div class="item-card" data-nome="${escapeHtml(c.label.toLowerCase())}" data-avaria="false">
            <strong style="font-size:14px">${escapeHtml(c.label)}</strong>
            <p class="meta-line">${[c.quantidade && `<strong>Qtd.:</strong> ${c.quantidade}`, c.observacoes && escapeHtml(c.observacoes)].filter(Boolean).join(" &nbsp;·&nbsp; ")}</p>
            ${(c.fotos || []).length ? `<div class="media-grid" style="margin-top:8px">${c.fotos.map(mediaHtml).join("")}</div>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    </details>`
    : "";

  const capaHtml = inspection.capaFoto
    ? `
    <div style="margin-bottom:22px">
      <img src="${inspection.capaFoto.src}" class="zoomable-photo" data-caption="Foto do imóvel" style="width:100%;max-height:300px;object-fit:cover;border-radius:14px;cursor:zoom-in;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.12)" />
    </div>`
    : "";

  const sigHtml = (label: string, src: string | null) => `
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
  html { scroll-behavior: smooth; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #2a1c20; margin: 0; padding: 0 0 40px; background: #f4efea; }

  .toolbar {
    position: sticky; top: 0; background: rgba(244,239,234,0.96); backdrop-filter: blur(6px);
    padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; gap: 10px;
    z-index: 20; border-bottom: 1px solid #eee0da; flex-wrap: wrap;
  }
  .toolbar-brand { font-weight: 700; color: #4e1b26; font-size: 14px; white-space: nowrap; }
  .toolbar-actions { display: flex; gap: 8px; }
  .toolbar button { background: #A23A4C; color: #fff; border: none; border-radius: 999px; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(162,58,76,0.25); display: inline-flex; align-items: center; gap: 6px; }
  .toolbar button.secondary { background: #fff; color: #A23A4C; border: 1.5px solid #A23A4C; box-shadow: none; }

  .controls {
    position: sticky; top: 57px; background: #f4efea; z-index: 19; padding: 12px 24px;
    border-bottom: 1px solid #eee0da; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  }
  .search-box { position: relative; flex: 1; min-width: 180px; max-width: 280px; }
  .search-box input {
    width: 100%; padding: 8px 12px 8px 30px; border-radius: 999px; border: 1.5px solid #e3d6ce;
    font-size: 13px; background: #fff; color: #2a1c20;
  }
  .search-box input:focus { outline: none; border-color: #A23A4C; }
  .search-box svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #a8828a; }
  .toggle-avarias {
    display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: #7a5a60;
    background: #fff; border: 1.5px solid #e3d6ce; border-radius: 999px; padding: 7px 12px; cursor: pointer; user-select: none;
  }
  .toggle-avarias input { accent-color: #A23A4C; width: 14px; height: 14px; }
  .toggle-avarias.active { border-color: #b23e2a; color: #b23e2a; background: #fbe4e1; }
  .estado-select {
    font-size: 12.5px; font-weight: 600; color: #7a5a60; background: #fff;
    border: 1.5px solid #e3d6ce; border-radius: 999px; padding: 7px 12px; cursor: pointer;
  }
  .estado-select:focus { outline: none; border-color: #A23A4C; }

  .nav-bar { display: flex; gap: 6px; overflow-x: auto; padding: 12px 24px; scrollbar-width: thin; }
  .nav-pill {
    flex-shrink: 0; font-size: 12px; font-weight: 600; color: #7a5a60; background: #fff;
    border: 1px solid #e3d6ce; border-radius: 999px; padding: 6px 13px; text-decoration: none; white-space: nowrap;
  }
  .nav-pill:hover { border-color: #A23A4C; color: #A23A4C; }

  .wrap { max-width: 820px; margin: 0 auto; padding: 24px; }

  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
  .stat-card { background: #fff; border: 1px solid #eee0da; border-radius: 14px; padding: 14px; text-align: center; }
  .stat-card .num { font-size: 22px; font-weight: 800; color: #4e1b26; display: block; }
  .stat-card .lbl { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #93636d; font-weight: 700; }
  .stat-card.warn .num { color: #b23e2a; }

  .eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #93636d; margin: 0 0 4px; }

  .section-card {
    background: #fbf8f6; border: 1px solid #eee0da; border-radius: 16px;
    margin-bottom: 14px; break-inside: avoid; page-break-inside: avoid; overflow: hidden;
  }
  .section-title {
    display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700;
    padding: 16px 20px; color: #4e1b26; cursor: pointer; list-style: none; user-select: none;
  }
  .section-title::-webkit-details-marker { display: none; }
  .section-meta { font-size: 11.5px; font-weight: 600; color: #93636d; white-space: nowrap; }
  .chevron { transition: transform 0.2s ease; flex-shrink: 0; color: #93636d; }
  details[open] > .section-title .chevron { transform: rotate(180deg); }
  .section-body { padding: 0 20px 18px; }
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
  .item-card.hidden-by-filter { display: none; }

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

  .empty-state { text-align: center; padding: 40px 20px; color: #93636d; font-size: 13px; display: none; }
  .empty-state.show { display: block; }

  #photo-lightbox { display: none; position: fixed; inset: 0; background: rgba(10,11,16,0.92); z-index: 1000; flex-direction: column; align-items: center; justify-content: center; padding: 24px; cursor: zoom-out; }
  #photo-lightbox.open { display: flex; }
  #photo-lightbox img { max-width: 94vw; max-height: 78vh; object-fit: contain; border-radius: 8px; }
  #photo-lightbox-caption { color: #fff; font-size: 13px; margin-top: 14px; text-align: center; max-width: 640px; opacity: 0.9; min-height: 18px; }
  .lb-close { position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border-radius: 999px; background: rgba(255,255,255,0.15); color: #fff; border: none; font-size: 18px; cursor: pointer; }
  .lb-nav {
    position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 999px;
    background: rgba(255,255,255,0.15); color: #fff; border: none; font-size: 26px; line-height: 1; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .lb-nav:hover { background: rgba(255,255,255,0.28); }
  .lb-prev { left: 18px; }
  .lb-next { right: 18px; }
  .lb-nav.hidden { display: none; }

  #back-to-top {
    position: fixed; bottom: 20px; right: 20px; width: 44px; height: 44px; border-radius: 999px;
    background: #A23A4C; color: #fff; border: none; box-shadow: 0 6px 18px rgba(162,58,76,0.35);
    display: none; align-items: center; justify-content: center; cursor: pointer; z-index: 15; font-size: 18px;
  }
  #back-to-top.show { display: flex; }

  @media print {
    body { background: #fff; }
    .toolbar, .controls, .nav-bar, #photo-lightbox, #back-to-top { display: none !important; }
    .wrap { max-width: 100%; padding: 12px; }
    .section-card { background: #fff; border: 1px solid #eee; }
    details { break-inside: avoid; }
    .item-card.hidden-by-filter { display: block !important; }
  }
  /* Esconde o badge "Powered by Netlify" */
#netlify-badge, 
.netlify-badge,
iframe[src*="netlify"],
a[href*="netlify.com"][target="_blank"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
</style>
</head>
<body>
  <div class="toolbar">
    <span class="toolbar-brand">VistorIA — Laudo Interativo</span>
    <div class="toolbar-actions">
      <button class="secondary" onclick="document.querySelectorAll('details[data-section]').forEach(function(d){d.open=true})">Expandir tudo</button>
      <button class="secondary" onclick="document.querySelectorAll('details[data-section]').forEach(function(d){d.open=false})">Recolher tudo</button>
      <button onclick="window.print()">🖨️ Imprimir / salvar PDF</button>
    </div>
  </div>

  <div class="controls">
    <div class="search-box">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input id="search-input" type="text" placeholder="Buscar item, ambiente, medidor..." oninput="applyFilters()" />
    </div>
    <select id="estado-filter" class="estado-select" onchange="applyFilters()">
      <option value="">Todos os estados</option>
      <option value="Novo">Novo</option>
      <option value="Bom">Bom</option>
      <option value="Regular">Regular</option>
      <option value="Ruim">Ruim</option>
      <option value="Péssimo">Péssimo</option>
      <option value="Sem teste">Sem teste</option>
    </select>
    <label class="toggle-avarias" id="toggle-avarias-label">
      <input type="checkbox" id="toggle-avarias" onchange="applyFilters()" />
      ⚠️ Mostrar só avarias
    </label>
  </div>

  <div class="nav-bar">${navHtml}</div>

  <div id="photo-lightbox" onclick="closeLightboxOnBackdrop(event)">
    <button class="lb-close" onclick="event.stopPropagation();closeLightbox()">✕</button>
    <button class="lb-nav lb-prev" onclick="event.stopPropagation();navLightbox(-1)">‹</button>
    <img id="photo-lightbox-img" src="" alt="" />
    <button class="lb-nav lb-next" onclick="event.stopPropagation();navLightbox(1)">›</button>
    <p id="photo-lightbox-caption"></p>
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

    <div id="resumo">
      <div class="stats-grid">
        <div class="stat-card"><span class="num">${inspection.ambientes.length}</span><span class="lbl">Ambientes</span></div>
        <div class="stat-card"><span class="num">${totalItens}</span><span class="lbl">Itens</span></div>
        <div class="stat-card ${totalAvarias > 0 ? "warn" : ""}"><span class="num">${totalAvarias}</span><span class="lbl">Avarias</span></div>
      </div>

      <div class="section-card" style="padding: 18px 20px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:13.5px">
          <div><p class="eyebrow">Data</p>${escapeHtml(fmtDate(inspection.dataVistoria))}</div>
          <div><p class="eyebrow">Vistoriador</p>${escapeHtml(inspection.vistoriador || "—")}</div>
          <div style="grid-column:1 / -1"><p class="eyebrow">Endereço</p>${escapeHtml(enderecoCompleto(inspection.imovel) || "—")}</div>
          ${inspection.imovel.cep ? `<div><p class="eyebrow">CEP</p>${escapeHtml(inspection.imovel.cep)}</div>` : ""}
          <div><p class="eyebrow">Tipo de imóvel</p>${escapeHtml(inspection.imovel.tipoImovel)}</div>
          <div><p class="eyebrow">Situação (mobiliário)</p>${escapeHtml(inspection.mobiliario)}</div>
          ${inspection.imovel.metragem ? `<div><p class="eyebrow">Metragem</p>${escapeHtml(inspection.imovel.metragem)}</div>` : ""}
          <div><p class="eyebrow">Proprietário</p>${escapeHtml(inspection.imovel.proprietario || "—")}</div>
          <div><p class="eyebrow">Inquilino</p>${escapeHtml(inspection.imovel.inquilino || "—")}</div>
          <div style="grid-column:1 / -1;padding-top:6px;border-top:1px dashed #eee0da"><p class="eyebrow">Mídia total</p>${totalFotos} foto(s)/vídeo(s) anexados na vistoria</div>
        </div>
      </div>
    </div>

    ${ambientesHtml}
    ${medidoresHtml}
    ${chavesHtml}

    <p class="empty-state" id="empty-state">Nenhum item encontrado para essa busca/filtro.</p>

    <div id="assinaturas" style="display:flex;gap:20px;flex-wrap:wrap;border-top:1px dashed #ddd;padding-top:20px;margin-top:20px">
      ${sigHtml("Assinatura do vistoriador", inspection.signatures?.vistoriador)}
      ${sigHtml("Assinatura do locador", inspection.signatures?.locador)}
      ${sigHtml("Assinatura do locatário", inspection.signatures?.locatario)}
    </div>
  </div>

  <button id="back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Voltar ao topo">↑</button>

  <script>
    // Click-to-zoom on any photo, with caption + prev/next navigation across
    // every photo in the report (keyboard arrows and on-screen buttons).
    var lightboxPhotos = [];
    var lightboxIndex = -1;

    function refreshLightboxPhotoList() {
      lightboxPhotos = Array.prototype.slice.call(document.querySelectorAll('.zoomable-photo'));
    }

    function openLightboxAt(index) {
      if (index < 0 || index >= lightboxPhotos.length) return;
      lightboxIndex = index;
      var img = lightboxPhotos[index];
      document.getElementById('photo-lightbox-img').src = img.src;
      document.getElementById('photo-lightbox-caption').textContent = img.getAttribute('data-caption') || '';
      document.querySelector('.lb-prev').classList.toggle('hidden', lightboxPhotos.length < 2);
      document.querySelector('.lb-next').classList.toggle('hidden', lightboxPhotos.length < 2);
      document.getElementById('photo-lightbox').classList.add('open');
    }

    function navLightbox(delta) {
      if (!lightboxPhotos.length) return;
      var next = (lightboxIndex + delta + lightboxPhotos.length) % lightboxPhotos.length;
      openLightboxAt(next);
    }

    function closeLightbox() {
      document.getElementById('photo-lightbox').classList.remove('open');
    }

    function closeLightboxOnBackdrop(e) {
      if (e.target.id === 'photo-lightbox') closeLightbox();
    }

    document.addEventListener('click', function (e) {
      var img = e.target.closest('.zoomable-photo');
      if (!img) return;
      refreshLightboxPhotoList();
      openLightboxAt(lightboxPhotos.indexOf(img));
    });

    document.addEventListener('keydown', function (e) {
      if (!document.getElementById('photo-lightbox').classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    });

    // Search + "só avarias" + estado filter, applied across every item/medidor/chave card.
    function applyFilters() {
      var query = document.getElementById('search-input').value.trim().toLowerCase();
      var onlyAvarias = document.getElementById('toggle-avarias').checked;
      var estadoFiltro = document.getElementById('estado-filter').value;
      document.getElementById('toggle-avarias-label').classList.toggle('active', onlyAvarias);

      var anyVisible = false;
      document.querySelectorAll('[data-section]').forEach(function (section) {
        var sectionHasVisible = false;
        var cards = section.querySelectorAll('.item-card');
        cards.forEach(function (card) {
          var matchesQuery = !query || (card.getAttribute('data-nome') || '').indexOf(query) !== -1;
          var matchesAvaria = !onlyAvarias || card.getAttribute('data-avaria') === 'true';
          var cardEstado = card.getAttribute('data-estado') || '';
          var matchesEstado = !estadoFiltro || !cardEstado || cardEstado === estadoFiltro;
          var visible = matchesQuery && matchesAvaria && matchesEstado;
          card.classList.toggle('hidden-by-filter', !visible);
          if (visible) sectionHasVisible = true;
        });
        if (cards.length > 0) {
          section.style.display = sectionHasVisible ? '' : 'none';
          if (sectionHasVisible) { anyVisible = true; section.open = true; }
        }
      });
      document.getElementById('empty-state').classList.toggle('show', !anyVisible && (!!query || onlyAvarias || !!estadoFiltro));
    }

    // Back-to-top button + sticky nav-pill highlighting on scroll.
    window.addEventListener('scroll', function () {
      document.getElementById('back-to-top').classList.toggle('show', window.scrollY > 500);
    });
  </script>
</body>
</html>`;
}

// ============================================
// VERSÃO SIMPLES PARA IMPRESSÃO (PDF)
// ============================================
export function buildPrintHTML(inspection: any, logo: string | null) {
  const totalItens = inspection.ambientes.reduce(
    (a: number, amb: any) => a + (amb.itens?.length || 0),
    0
  );
  const avarias = inspection.ambientes.reduce(
    (a: number, amb: any) =>
      a + (amb.itens?.filter((it: any) => it.temDano).length || 0),
    0
  );

  const medidoresList = [
    { label: "Água", d: inspection.medidores?.agua },
    { label: "Energia", d: inspection.medidores?.energia },
    { label: "Gás", d: inspection.medidores?.gas },
  ].filter((m: any) => m.d?.ativo);

  const chavesList = [
    ...CHAVE_TIPOS.map((t: any) => ({
      label: t.label,
      ...inspection.chaves?.[t.key],
    })),
    ...((inspection.chaves?.outras || []).map((o: any) => ({
      label: o.nome,
      ...o,
    }))),
  ].filter((c: any) => c.quantidade || c.observacoes);

  function getEstadoBadgeStyle(estado: string, semTeste?: boolean) {
    if (semTeste)
      return "background:#fff;color:#4b5563;border:1px solid #d1d5db;";
    switch (estado) {
      case "Novo":
        return "background:#000;color:#fff;";
      case "Ótimo":
        return "background:#16a34a;color:#fff;";
      case "Bom":
        return "background:#2563eb;color:#fff;";
      case "Regular":
        return "background:#eab308;color:#000;";
      case "Ruim":
        return "background:#dc2626;color:#fff;";
      case "Péssimo":
        return "background:#7f1d1d;color:#fff;";
      default:
        return "background:#fff;color:#4b5563;border:1px solid #d1d5db;";
    }
  }

  const ambientesHtml = inspection.ambientes
    .map((amb: any, ambIdx: number) => {
      const itensHtml = amb.itens
        .map((item: any) => {
          const camposPreenchidos = ITEM_FIELD_DEFS.filter(
            (f: any) => (item.campos || {})[f.key]
          );
          const estadoLabel = item.semTeste ? "Sem teste" : item.estado;
          const badgeStyle = getEstadoBadgeStyle(item.estado, item.semTeste);
          const camposLine = camposPreenchidos.length
            ? `<p style="font-size:12px;color:#7a5a60;margin:4px 0">${camposPreenchidos
                .map(
                  (f: any) =>
                    `<strong>${f.label}:</strong> ${escapeHtml(
                      item.campos[f.key]
                    )}`
                )
                .join(" · ")}</p>`
            : "";
          const obsLine = item.observacoes
            ? `<p style="font-size:12.5px;color:#3a2a2e;margin:6px 0">${escapeHtml(
                item.observacoes
              )}</p>`
            : "";
          const danoLine =
            item.temDano && item.descricaoDano
              ? `<p style="font-size:12.5px;color:#b23e2a;font-weight:600;margin:6px 0">⚠ Avaria: ${escapeHtml(
                  item.descricaoDano
                )}</p>`
              : "";
          const fotosHtml =
            (item.fotos || []).length > 0
              ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${item.fotos
                  .map((f: any) => {
                    const marcas = f.marcas || null;
                    const pontos = Array.isArray(marcas)
                      ? marcas
                      : marcas?.points || [];
                    const marcasHtml = pontos
                      .map(
                        (p: any, i: number) =>
                          `<div style="position:absolute;left:${p.x}%;top:${p.y}%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 2px #E23B3B;background:#E23B3B;color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center">${
                            i + 1
                          }</div>`
                      )
                      .join("");
                    return `<div style="position:relative;width:100px;height:100px;border:1px solid #eee0da;border-radius:8px;overflow:hidden"><img src="${f.src}" style="width:100%;height:100%;object-fit:cover;display:block" />${marcasHtml}</div>`;
                  })
                  .join("")}</div>`
              : "";
          return `
            <div style="background:#fff;border:1px solid #f0e6e1;border-radius:10px;padding:10px 12px;margin-bottom:8px;break-inside:avoid">
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
                <strong style="font-size:13px">${escapeHtml(item.nome)}</strong>
                <span style="display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 10px;border-radius:999px;${badgeStyle}">${escapeHtml(
            estadoLabel
          )}</span>
                ${
                  item.temDano
                    ? '<span style="display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 10px;border-radius:999px;background:#fbe4e1;color:#b23e2a">Avaria</span>'
                    : ""
                }
              </div>
              ${camposLine}${obsLine}${danoLine}${fotosHtml}
            </div>`;
        })
        .join("");

      const fotosAmbienteHtml =
        (amb.fotos || []).length > 0
          ? `<div style="margin-bottom:12px"><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 6px">Fotos/vídeos gerais do ambiente</p><div style="display:flex;gap:8px;flex-wrap:wrap">${amb.fotos
              .map(
                (f: any) =>
                  `<div style="width:100px;height:100px;border:1px solid #eee0da;border-radius:8px;overflow:hidden"><img src="${f.src}" style="width:100%;height:100%;object-fit:cover;display:block" /></div>`
              )
              .join("")}</div></div>`
          : "";

      return `
        <div style="background:#fbf8f6;border:1px solid #eee0da;border-radius:14px;padding:16px 18px;margin-bottom:14px;break-inside:avoid">
          <h2 style="display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #eee0da;color:#4e1b26">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:999px;background:#A23A4C;color:#fff;font-size:10px;font-weight:700;flex-shrink:0">${String(
              ambIdx + 1
            ).padStart(2, "0")}</span>
            ${escapeHtml(amb.nome)}
          </h2>
          ${fotosAmbienteHtml}
          ${itensHtml}
        </div>`;
    })
    .join("");

  const medidoresHtml = medidoresList.length
    ? `<div style="background:#fbf8f6;border:1px solid #eee0da;border-radius:14px;padding:16px 18px;margin-bottom:14px;break-inside:avoid"><h2 style="font-size:15px;font-weight:700;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #eee0da;color:#4e1b26">Medidores</h2>${medidoresList
        .map(
          (m: any) =>
            `<div style="background:#fff;border:1px solid #f0e6e1;border-radius:10px;padding:10px 12px;margin-bottom:8px"><strong style="font-size:13px">${
              m.label
            }</strong><p style="font-size:12px;color:#7a5a60;margin:4px 0">${[
              m.d.numero && `<strong>Nº:</strong> ${m.d.numero}`,
              m.d.leitura &&
                `<strong>Leitura:</strong> ${m.d.leitura}${
                  m.d.unidade ? " " + m.d.unidade : ""
                }`,
              m.d.concessionaria &&
                `<strong>Concessionária:</strong> ${m.d.concessionaria}`,
            ]
              .filter(Boolean)
              .join(" · ")}</p>${
              m.d.observacoes
                ? `<p style="font-size:12px;color:#3a2a2e;margin:4px 0">${escapeHtml(
                    m.d.observacoes
                  )}</p>`
                : ""
            }</div>`
        )
        .join("")}</div>`
    : "";

  const chavesHtml = chavesList.length
    ? `<div style="background:#fbf8f6;border:1px solid #eee0da;border-radius:14px;padding:16px 18px;margin-bottom:14px;break-inside:avoid"><h2 style="font-size:15px;font-weight:700;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #eee0da;color:#4e1b26">Chaves e acessos</h2>${chavesList
        .map(
          (c: any) =>
            `<div style="background:#fff;border:1px solid #f0e6e1;border-radius:10px;padding:10px 12px;margin-bottom:8px"><strong style="font-size:13px">${escapeHtml(
              c.label
            )}</strong><p style="font-size:12px;color:#7a5a60;margin:4px 0">${[
              c.quantidade && `<strong>Qtd.:</strong> ${c.quantidade}`,
              c.observacoes && escapeHtml(c.observacoes),
            ]
              .filter(Boolean)
              .join(" · ")}</p></div>`
        )
        .join("")}</div>`
    : "";

  const capaHtml = inspection.capaFoto
    ? `<div style="margin-bottom:18px"><img src="${inspection.capaFoto.src}" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px;display:block;border:1px solid #eee0da" /></div>`
    : "";

  const sigHtml = (label: string, src: string | null) => `
    <div style="flex:1;min-width:200px">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 4px">${label}</p>
      ${
        src
          ? `<img src="${src}" style="width:100%;height:80px;object-fit:contain;border:1px solid #e7dcd6;border-radius:8px;background:#fff" />`
          : `<div style="width:100%;height:80px;border:1.5px dashed #d9cec7;border-radius:8px"></div>`
      }
      <div style="border-top:1px solid #e7dcd6;margin-top:30px;padding-top:4px;font-size:9px;text-align:center;color:#a8828a">Assinatura manual (se necessário)</div>
    </div>`;

  const logoHtml = logo
    ? `<img src="${logo}" style="height:48px;max-width:130px;object-fit:contain;border-radius:6px" />`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Laudo de Vistoria — ${escapeHtml(
    enderecoCompleto(inspection.imovel) || "VistorIA"
  )}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #2a1c20; margin: 0; padding: 24px; background: #f4efea; }
  .toolbar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
  .toolbar button { background: #A23A4C; color: #fff; border: none; border-radius: 999px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(162,58,76,0.25); }
  .wrap { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 6px 24px rgba(40,20,25,0.08); }
  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none !important; }
    .wrap { box-shadow: none; border-radius: 0; padding: 8px; max-width: 100%; }
    .section-card { background: #fff; border: 1px solid #eee; }
  }
</style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">Imprimir / salvar PDF</button></div>
  <div class="wrap">
    <div style="height:6px;background:linear-gradient(90deg,#A23A4C,#c96a7a);border-radius:999px;margin-bottom:18px"></div>

    <div style="display:flex;align-items:flex-start;gap:14px;justify-content:space-between;margin-bottom:18px">
      <div style="display:flex;align-items:flex-start;gap:12px">
        ${logoHtml}
        <div>
          <h1 style="font-size:22px;margin:0;color:#4e1b26">Vistor<span style="color:#A23A4C">IA</span> — Laudo de Vistoria</h1>
          <p style="font-size:12px;color:#93636d;margin:4px 0 0;font-weight:700">PEREIRA Gestão Imobiliária</p>
          <p style="font-size:12px;color:#93636d;margin:2px 0 0">Vistoria de ${escapeHtml(
            inspection.tipo.toLowerCase()
          )}</p>
        </div>
      </div>
      ${
        inspection.status === "Finalizada"
          ? `<div style="border:2.5px solid #3fa76b;color:#3fa76b;border-radius:999px;padding:6px 14px;font-weight:700;font-size:11px;transform:rotate(-6deg);white-space:nowrap">✓ FINALIZADA<br/>${escapeHtml(
              fmtDate(inspection.dataVistoria)
            )}</div>`
          : ""
      }
    </div>

    ${capaHtml}

    <div style="background:#fbf8f6;border:1px solid #eee0da;border-radius:14px;padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:13px;margin-bottom:14px">
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Data</p>${escapeHtml(
        fmtDate(inspection.dataVistoria)
      )}</div>
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Vistoriador</p>${escapeHtml(
        inspection.vistoriador || "—"
      )}</div>
      <div style="grid-column:1 / -1"><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Endereço</p>${escapeHtml(
        enderecoCompleto(inspection.imovel) || "—"
      )}</div>
      ${
        inspection.imovel.cep
          ? `<div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">CEP</p>${escapeHtml(
              inspection.imovel.cep
            )}</div>`
          : ""
      }
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Tipo de imóvel</p>${escapeHtml(
        inspection.imovel.tipoImovel
      )}</div>
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Situação</p>${escapeHtml(
        inspection.mobiliario
      )}</div>
      ${
        inspection.imovel.metragem
          ? `<div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Metragem</p>${escapeHtml(
              inspection.imovel.metragem
            )}</div>`
          : ""
      }
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Proprietário</p>${escapeHtml(
        inspection.imovel.proprietario || "—"
      )}</div>
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Inquilino</p>${escapeHtml(
        inspection.imovel.inquilino || "—"
      )}</div>
      <div style="grid-column:1 / -1;padding-top:6px;border-top:1px dashed #eee0da"><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Resumo</p><strong>${
        inspection.ambientes.length
      }</strong> ambientes · <strong>${totalItens}</strong> itens${
    avarias > 0
      ? ` · <span style="color:#b23e2a;font-weight:700">${avarias} avarias</span>`
      : ""
  }</div>
    </div>

    ${ambientesHtml}
    ${medidoresHtml}
    ${chavesHtml}

    <div style="display:flex;gap:18px;flex-wrap:wrap;border-top:1px dashed #ddd;padding-top:18px;margin-top:18px">
      ${sigHtml("Assinatura do vistoriador", inspection.signatures?.vistoriador)}
      ${sigHtml("Assinatura do locador", inspection.signatures?.locador)}
      ${sigHtml("Assinatura do locatário", inspection.signatures?.locatario)}
    </div>
  </div>
</body>
</html>`;
}


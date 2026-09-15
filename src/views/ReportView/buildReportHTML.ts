import { CHAVE_TIPOS, ITEM_FIELD_DEFS } from "../../data/inspectionModel";
import { enderecoCompleto, escapeHtml, fmtDate, fmtDateTime } from "../../utils/format";
import { getPerguntasAmbiente } from "../../data/perguntasAmbientes";

// ============================================
// FUNÇÃO AUXILIAR: Gerar o HTML de uma foto
// ============================================
export function mediaHtml(foto: any, caption = "") {
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
      (p: any, i: number) =>
        `<div style="position:absolute;left:${p.x}%;top:${p.y}%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 2px #E23B3B;background:#E23B3B;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${i + 1}</div>`
    )
    .join("");
  const comentarioHtml = comentarioMarcacao
    ? `<p style="font-size:10.5px;color:#b23e2a;margin:4px 0 0;font-weight:600">⚠ ${escapeHtml(comentarioMarcacao)}</p>`
    : "";

  const marcasJson =
    pontos.length > 0 || comentarioMarcacao
      ? ` data-marcas="${encodeURIComponent(JSON.stringify(marcas))}"`
      : "";

  return `<div class="media-card"><div style="position:relative;width:100%;height:120px"><img src="${foto.src}" class="zoomable-photo"${marcasJson} loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;cursor:zoom-in;display:block" />${marcasHtml}</div><div style="padding:6px 8px">${cap}${comentarioHtml}</div></div>`;
}

// ============================================
// FUNÇÃO AUXILIAR: CSS de badge por estado
// ============================================
function getEstadoBadgeStyle(estado: string, semTeste?: boolean) {
  if (semTeste) return "background:#fff;color:#4b5563;border:1px solid #d1d5db;padding:2px 8px;border-radius:12px;font-size:12px;";
  switch (estado) {
    case "Novo":    return "background:#000;color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;";
    case "Ótimo":   return "background:#16a34a;color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;";
    case "Bom":     return "background:#2563eb;color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;";
    case "Regular": return "background:#eab308;color:#000;padding:2px 8px;border-radius:12px;font-size:12px;";
    case "Ruim":    return "background:#dc2626;color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;";
    case "Péssimo": return "background:#7f1d1d;color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;";
    default:        return "background:#fff;color:#4b5563;border:1px solid #d1d5db;padding:2px 8px;border-radius:12px;font-size:12px;";
  }
}

// ============================================
// FUNÇÃO AUXILIAR: HTML das perguntas + respostas
// ============================================
function getPerguntasHtml(amb: any): string {
  const perguntas = getPerguntasAmbiente(amb.nome);
  if (perguntas.length === 0) return "";
  const checklist = amb.checklist || amb.checklistCozinha || {};

  // Só as perguntas que têm resposta
  const respondidas = perguntas.filter((p: any) => checklist[p.key]);

  // Se nenhuma foi respondida, não mostra a seção
  if (respondidas.length === 0) return "";

  const linhas = respondidas
    .map((p: any) => {
      const resposta = checklist[p.key];
      let badgeStyle = "background:#fff;color:#93636d;border:1px solid #d1d5db;";
      if (resposta === "Sim") badgeStyle = "background:#16a34a;color:#fff;";
      else if (resposta === "Não") badgeStyle = "background:#dc2626;color:#fff;";
      else if (resposta === "Nulo") badgeStyle = "background:#6b7280;color:#fff;";
      return `<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px dashed #eee0da;font-size:12px">
        <span style="color:#3a2a2e">${escapeHtml(p.label)}</span>
        <span style="display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 10px;border-radius:999px;${badgeStyle}white-space:nowrap">${resposta}</span>
      </div>`;
    })
    .join("");

  return `<div style="margin-top:14px;padding-top:14px;border-top:2px dashed #eee0da">
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 8px">Perguntas de Verificação — ${escapeHtml(amb.nome)}</p>
    <div>${linhas}</div>
  </div>`;
}
// ============================================
// FUNÇÃO 1: HTML INTERATIVO (para o Link Netlify)
// ============================================
export function buildReportHTML(inspection: any, logo: string | null) {
  const totalItens = inspection.ambientes.reduce((a: number, amb: any) => a + amb.itens.length, 0);
  const avarias = inspection.ambientes.reduce((a: number, amb: any) => a + amb.itens.filter((it: any) => it.temDano).length, 0);

  const medidoresList = [
    { label: "Água", d: inspection.medidores.agua },
    { label: "Energia", d: inspection.medidores.energia },
    { label: "Gás", d: inspection.medidores.gas },
  ].filter((m: any) => m.d.ativo);

  const chavesList = [
    ...CHAVE_TIPOS.map((t: any) => ({ label: t.label, ...inspection.chaves[t.key] })),
    ...inspection.chaves.outras.map((o: any) => ({ label: o.nome, ...o })),
  ].filter((c: any) => c.quantidade || c.observacoes || (c.fotos || []).length);

  const ambientesHtml = inspection.ambientes
    .map((amb: any, ambIdx: number) => {
      const fotosAmbienteHtml = (amb.fotos || []).length
        ? `<div style="margin-bottom:14px"><p class="eyebrow">Fotos/vídeos gerais do ambiente</p><div class="media-grid">${amb.fotos.map((f: any) => mediaHtml(f, amb.nome)).join("")}</div></div>`
        : "";
      const itensHtml = amb.itens
        .map((item: any) => {
          const camposPreenchidos = ITEM_FIELD_DEFS.filter((f: any) => (item.campos || {})[f.key]);
          const estadoLabel = item.semTeste ? "Sem teste" : item.estado;
          const badgeStyle = getEstadoBadgeStyle(item.estado, item.semTeste);
          const camposLine = camposPreenchidos.length
            ? `<p class="meta-line">${camposPreenchidos.map((f: any) => `<strong>${f.label}:</strong> ${escapeHtml(item.campos[f.key])}`).join(" &nbsp;·&nbsp; ")}</p>`
            : "";
          const obsLine = item.observacoes ? `<p class="obs-line">${escapeHtml(item.observacoes)}</p>` : "";
          const danoLine = item.temDano && item.descricaoDano ? `<p class="dano-line">⚠ Avaria: ${escapeHtml(item.descricaoDano)}</p>` : "";
          const fotosHtml = (item.fotos || []).length
            ? `<div class="media-grid" style="margin-top:8px">${item.fotos.map((f: any) => mediaHtml(f, `${item.nome} — ${estadoLabel}`)).join("")}</div>`
            : "";
          return `<div class="item-card">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
              <strong style="font-size:14px">${escapeHtml(item.nome)}</strong>
              <span class="pill" style="${badgeStyle}">${escapeHtml(estadoLabel)}</span>
              ${item.temDano ? `<span class="pill" style="background:#fbe4e1;color:#b23e2a">Avaria</span>` : ""}
            </div>
            ${camposLine}${obsLine}${danoLine}${fotosHtml}
          </div>`;
        })
        .join("");
      const perguntasHtml = getPerguntasHtml(amb);
      return `<div class="section-card">
        <h2 class="section-title"><span class="section-num">${String(ambIdx + 1).padStart(2, "0")}</span>${escapeHtml(amb.nome)}</h2>
        ${fotosAmbienteHtml}
        ${itensHtml}
        ${perguntasHtml}
      </div>`;
    })
    .join("");

  const medidoresHtml = medidoresList.length
    ? `<div class="section-card">
        <h2 class="section-title"><span class="section-num" style="background:#3d7a57">💧</span>Medidores</h2>
        ${medidoresList.map((m: any) => `<div class="item-card">
          <strong style="font-size:14px">${m.label}</strong>
          <p class="meta-line">${[
            m.d.numero && `<strong>Nº:</strong> ${m.d.numero}`,
            m.d.leitura && `<strong>Leitura:</strong> ${m.d.leitura}${m.d.unidade ? " " + m.d.unidade : ""}`,
            m.d.concessionaria && `<strong>Concessionária:</strong> ${m.d.concessionaria}`,
          ].filter(Boolean).join(" &nbsp;·&nbsp; ")}</p>
          ${m.d.observacoes ? `<p class="obs-line">${escapeHtml(m.d.observacoes)}</p>` : ""}
          ${(m.d.fotos || []).length ? `<div class="media-grid" style="margin-top:8px">${m.d.fotos.map((f: any) => mediaHtml(f, m.label)).join("")}</div>` : ""}
        </div>`).join("")}
      </div>`
    : "";

  const chavesHtml = chavesList.length
    ? `<div class="section-card">
        <h2 class="section-title"><span class="section-num" style="background:#a97a1f">🔑</span>Chaves e acessos</h2>
        ${chavesList.map((c: any) => `<div class="item-card">
          <strong style="font-size:14px">${escapeHtml(c.label)}</strong>
          <p class="meta-line">${[c.quantidade && `<strong>Qtd.:</strong> ${c.quantidade}`, c.observacoes && escapeHtml(c.observacoes)].filter(Boolean).join(" &nbsp;·&nbsp; ")}</p>
          ${(c.fotos || []).length ? `<div class="media-grid" style="margin-top:8px">${c.fotos.map((f: any) => mediaHtml(f, c.label)).join("")}</div>` : ""}
        </div>`).join("")}
      </div>`
    : "";

  const capaHtml = inspection.capaFoto
    ? `<div style="margin-bottom:22px"><img src="${inspection.capaFoto.src}" class="zoomable-photo" style="width:100%;max-height:300px;object-fit:cover;border-radius:14px;cursor:zoom-in;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.12)" /></div>`
    : "";

  const sigHtml = (label: string, src: string | null) => `<div style="flex:1;min-width:200px">
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
  * { 
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #2a1c20; margin: 0; padding: 24px; background: #f4efea; }
  .toolbar { position: sticky; top: 0; background: #f4efea; padding: 10px 0 16px; display: flex; justify-content: flex-end; gap: 8px; z-index: 10; }
  .toolbar button { background: #A23A4C; color: #fff; border: none; border-radius: 999px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(162,58,76,0.25); }
  .wrap { max-width: 780px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 32px; box-shadow: 0 8px 30px rgba(40,20,25,0.08); }
  .eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #93636d; margin: 0 0 4px; }
  .section-card { background: #fbf8f6; border: 1px solid #eee0da; border-radius: 16px; padding: 18px 20px; margin-bottom: 18px; break-inside: avoid; page-break-inside: avoid; }
  .section-title { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 2px solid #eee0da; color: #4e1b26; }
  .section-num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 999px; background: #A23A4C; color: #fff; font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
  .item-card { background: #fff; border: 1px solid #f0e6e1; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; break-inside: avoid; page-break-inside: avoid; }
  .item-card:last-child { margin-bottom: 0; }
  .pill { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; padding: 3px 10px; border-radius: 999px; }
  .meta-line { font-size: 12px; color: #7a5a60; margin: 4px 0; line-height: 1.5; }
  .obs-line { font-size: 12.5px; color: #3a2a2e; margin: 6px 0; line-height: 1.5; }
  .dano-line { font-size: 12.5px; color: #b23e2a; font-weight: 600; margin: 6px 0; line-height: 1.5; }
  .media-grid { display: flex; gap: 10px; flex-wrap: wrap; }
  .media-card { width: 130px; border: 1px solid #eee0da; border-radius: 10px; overflow: hidden; background: #fff; box-shadow: 0 2px 6px rgba(40,20,25,0.06); break-inside: avoid; }
  #photo-lightbox { display: none; position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0,0,0,0.85); z-index: 999999; align-items: center; justify-content: center; flex-direction: column; padding: 20px; box-sizing: border-box; }
  #photo-lightbox.open { display: flex; }
  #photo-lightbox-img { max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px; display: block; }
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
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
    <button onclick="event.stopPropagation();document.getElementById('photo-lightbox').classList.remove('open')" style="position:absolute;top:16px;right:20px;background:none;border:none;color:#fff;font-size:28px;cursor:pointer;z-index:10">✕</button>
    <div id="photo-lightbox-inner" style="position:relative;display:inline-block;max-width:90vw;max-height:80vh;" onclick="event.stopPropagation()">
      <img id="photo-lightbox-img" src="" alt="" />
    </div>
    <div id="photo-lightbox-comment" style="display:none;margin-top:14px;background:rgba(226,59,59,0.95);color:#fff;padding:8px 18px;border-radius:999px;font-size:13px;font-weight:600;max-width:85vw;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);z-index:10" onclick="event.stopPropagation()"></div>
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
    var lightboxImg = document.getElementById('photo-lightbox-img');
    var lightboxInner = document.getElementById('photo-lightbox-inner');
    var lightboxComment = document.getElementById('photo-lightbox-comment');
    lightboxImg.src = img.src;
    lightboxInner.querySelectorAll('.lightbox-mark').forEach(function(el) { el.remove(); });
    lightboxComment.style.display = 'none';
    lightboxComment.textContent = '';
    var marcasData = img.getAttribute('data-marcas');
    if (marcasData) {
      try {
        var marcas = JSON.parse(decodeURIComponent(marcasData));
        var pontos = Array.isArray(marcas) ? marcas : (marcas.points || []);
        var comentario = Array.isArray(marcas) ? '' : (marcas.comentario || '');
        pontos.forEach(function(p, i) {
          var mark = document.createElement('div');
          mark.className = 'lightbox-mark';
          mark.style.position = 'absolute';
          mark.style.left = p.x + '%';
          mark.style.top = p.y + '%';
          mark.style.transform = 'translate(-50%,-50%)';
          mark.style.width = '26px';
          mark.style.height = '26px';
          mark.style.borderRadius = '50%';
          mark.style.border = '2px solid #ffffff';
          mark.style.background = '#E23B3B';
          mark.style.color = '#ffffff';
          mark.style.fontSize = '12px';
          mark.style.fontWeight = '700';
          mark.style.display = 'flex';
          mark.style.alignItems = 'center';
          mark.style.justifyContent = 'center';
          mark.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)';
          mark.style.zIndex = '5';
          mark.textContent = (i + 1);
          lightboxInner.appendChild(mark);
        });
        if (comentario) {
          lightboxComment.textContent = '⚠ ' + comentario;
          lightboxComment.style.display = 'block';
        }
      } catch(err) { console.error('Erro ao ler marcas:', err); }
    }
    lightbox.style.display = 'flex';
    lightbox.classList.add('open');
  });
  var style = document.createElement('style');
  style.innerHTML = '#photo-lightbox:not(.open) { display: none !important; }';
  document.head.appendChild(style);
</script>
</body>
</html>`;
}

// ============================================
// FUNÇÃO 2: HTML SIMPLES (para o botão Imprimir)
// ============================================
export function buildPrintHTML(inspection: any, logo: string | null) {
  const totalItens = inspection.ambientes.reduce((a: number, amb: any) => a + (amb.itens?.length || 0), 0);
  const avarias = inspection.ambientes.reduce((a: number, amb: any) => a + (amb.itens?.filter((it: any) => it.temDano).length || 0), 0);

  const medidoresList = [
    { label: "Água", d: inspection.medidores?.agua },
    { label: "Energia", d: inspection.medidores?.energia },
    { label: "Gás", d: inspection.medidores?.gas },
  ].filter((m: any) => m.d?.ativo);

  const chavesList = [
    ...CHAVE_TIPOS.map((t: any) => ({ label: t.label, ...inspection.chaves?.[t.key] })),
    ...((inspection.chaves?.outras || []).map((o: any) => ({ label: o.nome, ...o }))),
  ].filter((c: any) => c.quantidade || c.observacoes);

  const ambientesHtml = inspection.ambientes
    .map((amb: any, ambIdx: number) => {
      const itensHtml = amb.itens
        .map((item: any) => {
          const camposPreenchidos = ITEM_FIELD_DEFS.filter((f: any) => (item.campos || {})[f.key]);
          const estadoLabel = item.semTeste ? "Sem teste" : item.estado;
          const badgeStyle = getEstadoBadgeStyle(item.estado, item.semTeste);
          const camposLine = camposPreenchidos.length
            ? `<p style="font-size:12px;color:#7a5a60;margin:4px 0">${camposPreenchidos.map((f: any) => `<strong>${f.label}:</strong> ${escapeHtml(item.campos[f.key])}`).join(" · ")}</p>`
            : "";
          const obsLine = item.observacoes ? `<p style="font-size:12.5px;color:#3a2a2e;margin:6px 0">${escapeHtml(item.observacoes)}</p>` : "";
          const danoLine = item.temDano && item.descricaoDano ? `<p style="font-size:12.5px;color:#b23e2a;font-weight:600;margin:6px 0">⚠ Avaria: ${escapeHtml(item.descricaoDano)}</p>` : "";
          const fotosHtml = (item.fotos || []).length > 0
            ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${item.fotos.map((f: any) => {
                const marcas = f.marcas || null;
                const pontos = Array.isArray(marcas) ? marcas : (marcas?.points || []);
                const marcasHtml = pontos.map((p: any, i: number) =>
                  `<div style="position:absolute;left:${p.x}%;top:${p.y}%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 2px #E23B3B;background:#E23B3B;color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center">${i + 1}</div>`
                ).join("");
                return `<div style="position:relative;width:100px;height:100px;border:1px solid #eee0da;border-radius:8px;overflow:hidden"><img src="${f.src}" style="width:100%;height:100%;object-fit:cover;display:block" />${marcasHtml}</div>`;
              }).join("")}</div>`
            : "";
          return `<div style="background:#fff;border:1px solid #f0e6e1;border-radius:10px;padding:10px 12px;margin-bottom:8px;break-inside:avoid">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
              <strong style="font-size:13px">${escapeHtml(item.nome)}</strong>
              <span style="display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 10px;border-radius:999px;${badgeStyle}">${escapeHtml(estadoLabel)}</span>
              ${item.temDano ? '<span style="display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 10px;border-radius:999px;background:#fbe4e1;color:#b23e2a">Avaria</span>' : ""}
            </div>
            ${camposLine}${obsLine}${danoLine}${fotosHtml}
          </div>`;
        })
        .join("");

      const fotosAmbienteHtml = (amb.fotos || []).length > 0
        ? `<div style="margin-bottom:12px"><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 6px">Fotos/vídeos gerais do ambiente</p><div style="display:flex;gap:8px;flex-wrap:wrap">${amb.fotos.map((f: any) =>
            `<div style="width:100px;height:100px;border:1px solid #eee0da;border-radius:8px;overflow:hidden"><img src="${f.src}" style="width:100%;height:100%;object-fit:cover;display:block" /></div>`
          ).join("")}</div></div>`
        : "";

      const perguntasHtml = getPerguntasHtml(amb);

      return `<div style="background:#fbf8f6;border:1px solid #eee0da;border-radius:14px;padding:16px 18px;margin-bottom:14px;break-inside:avoid">
        <h2 style="display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #eee0da;color:#4e1b26">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:999px;background:#A23A4C;color:#fff;font-size:10px;font-weight:700;flex-shrink:0">${String(ambIdx + 1).padStart(2, "0")}</span>
          ${escapeHtml(amb.nome)}
        </h2>
        ${fotosAmbienteHtml}
        ${itensHtml}
        ${perguntasHtml}
      </div>`;
    })
    .join("");

  const medidoresHtml = medidoresList.length
    ? `<div style="background:#fbf8f6;border:1px solid #eee0da;border-radius:14px;padding:16px 18px;margin-bottom:14px;break-inside:avoid"><h2 style="font-size:15px;font-weight:700;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #eee0da;color:#4e1b26">Medidores</h2>${medidoresList.map((m: any) =>
        `<div style="background:#fff;border:1px solid #f0e6e1;border-radius:10px;padding:10px 12px;margin-bottom:8px"><strong style="font-size:13px">${m.label}</strong><p style="font-size:12px;color:#7a5a60;margin:4px 0">${[
          m.d.numero && `<strong>Nº:</strong> ${m.d.numero}`,
          m.d.leitura && `<strong>Leitura:</strong> ${m.d.leitura}${m.d.unidade ? " " + m.d.unidade : ""}`,
          m.d.concessionaria && `<strong>Concessionária:</strong> ${m.d.concessionaria}`,
        ].filter(Boolean).join(" · ")}</p>${m.d.observacoes ? `<p style="font-size:12px;color:#3a2a2e;margin:4px 0">${escapeHtml(m.d.observacoes)}</p>` : ""}</div>`
      ).join("")}</div>`
    : "";

  const chavesHtml = chavesList.length
    ? `<div style="background:#fbf8f6;border:1px solid #eee0da;border-radius:14px;padding:16px 18px;margin-bottom:14px;break-inside:avoid"><h2 style="font-size:15px;font-weight:700;margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #eee0da;color:#4e1b26">Chaves e acessos</h2>${chavesList.map((c: any) =>
        `<div style="background:#fff;border:1px solid #f0e6e1;border-radius:10px;padding:10px 12px;margin-bottom:8px"><strong style="font-size:13px">${escapeHtml(c.label)}</strong><p style="font-size:12px;color:#7a5a60;margin:4px 0">${[
          c.quantidade && `<strong>Qtd.:</strong> ${c.quantidade}`,
          c.observacoes && escapeHtml(c.observacoes),
        ].filter(Boolean).join(" · ")}</p></div>`
      ).join("")}</div>`
    : "";

  const capaHtml = inspection.capaFoto
    ? `<div style="margin-bottom:18px"><img src="${inspection.capaFoto.src}" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px;display:block;border:1px solid #eee0da" /></div>`
    : "";

  const sigHtml = (label: string, src: string | null) => `<div style="flex:1;min-width:200px">
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 4px">${label}</p>
    ${src ? `<img src="${src}" style="width:100%;height:80px;object-fit:contain;border:1px solid #e7dcd6;border-radius:8px;background:#fff" />` : `<div style="width:100%;height:80px;border:1.5px dashed #d9cec7;border-radius:8px"></div>`}
    <div style="border-top:1px solid #e7dcd6;margin-top:30px;padding-top:4px;font-size:9px;text-align:center;color:#a8828a">Assinatura manual (se necessário)</div>
  </div>`;

  const logoHtml = logo ? `<img src="${logo}" style="height:48px;max-width:130px;object-fit:contain;border-radius:6px" />` : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Laudo de Vistoria — ${escapeHtml(enderecoCompleto(inspection.imovel) || "VistorIA")}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { 
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #2a1c20; margin: 0; padding: 24px; background: #f4efea; }
  .wrap { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 6px 24px rgba(40,20,25,0.08); }
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body { background: #fff; padding: 0; }
    .wrap { box-shadow: none; border-radius: 0; padding: 8px; max-width: 100%; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <div style="height:6px;background:linear-gradient(90deg,#A23A4C,#c96a7a);border-radius:999px;margin-bottom:18px"></div>
    <div style="display:flex;align-items:flex-start;gap:14px;justify-content:space-between;margin-bottom:18px">
      <div style="display:flex;align-items:flex-start;gap:12px">
        ${logoHtml}
        <div>
          <h1 style="font-size:22px;margin:0;color:#4e1b26">Vistor<span style="color:#A23A4C">IA</span> — Laudo de Vistoria</h1>
          <p style="font-size:12px;color:#93636d;margin:4px 0 0;font-weight:700">PEREIRA Gestão Imobiliária</p>
          <p style="font-size:12px;color:#93636d;margin:2px 0 0">Vistoria de ${escapeHtml(inspection.tipo.toLowerCase())}</p>
        </div>
      </div>
      ${inspection.status === "Finalizada" ? `<div style="border:2.5px solid #3fa76b;color:#3fa76b;border-radius:999px;padding:6px 14px;font-weight:700;font-size:11px;transform:rotate(-6deg);white-space:nowrap">✓ FINALIZADA<br/>${escapeHtml(fmtDate(inspection.dataVistoria))}</div>` : ""}
    </div>
    ${capaHtml}
    <div style="background:#fbf8f6;border:1px solid #eee0da;border-radius:14px;padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:13px;margin-bottom:14px">
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Data</p>${escapeHtml(fmtDate(inspection.dataVistoria))}</div>
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Vistoriador</p>${escapeHtml(inspection.vistoriador || "—")}</div>
      <div style="grid-column:1 / -1"><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Endereço</p>${escapeHtml(enderecoCompleto(inspection.imovel) || "—")}</div>
      ${inspection.imovel.cep ? `<div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">CEP</p>${escapeHtml(inspection.imovel.cep)}</div>` : ""}
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Tipo de imóvel</p>${escapeHtml(inspection.imovel.tipoImovel)}</div>
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Situação</p>${escapeHtml(inspection.mobiliario)}</div>
      ${inspection.imovel.metragem ? `<div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Metragem</p>${escapeHtml(inspection.imovel.metragem)}</div>` : ""}
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Proprietário</p>${escapeHtml(inspection.imovel.proprietario || "—")}</div>
      <div><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Inquilino</p>${escapeHtml(inspection.imovel.inquilino || "—")}</div>
      <div style="grid-column:1 / -1;padding-top:6px;border-top:1px dashed #eee0da"><p style="font-size:11px;font-weight:700;text-transform:uppercase;color:#93636d;margin:0 0 2px">Resumo</p><strong>${inspection.ambientes.length}</strong> ambientes · <strong>${totalItens}</strong> itens${avarias > 0 ? ` · <span style="color:#b23e2a;font-weight:700">${avarias} avarias</span>` : ""}</div>
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
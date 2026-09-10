// src/utils/format.ts
// CORRIGIDO - Sem problema de fuso horário

export const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ✅ FUNÇÃO CORRIGIDA - Sem conversão de fuso horário
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  
  // Se já estiver no formato DD/MM/YYYY, retorna direto
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso;
  
  // Garante que a data seja interpretada como string, SEM conversão de fuso
  const partes = iso.split("-");
  if (partes.length !== 3) return iso;
  
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

export function enderecoCompleto(imovel: any): string {
  if (!imovel) return "";
  const linha1 = [imovel.endereco, imovel.numero && `nº ${imovel.numero}`].filter(Boolean).join(", ");
  const linha2 = [imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(" - ");
  const comp = imovel.complemento ? ` (${imovel.complemento})` : "";
  return [linha1, linha2].filter(Boolean).join(" - ") + comp;
}

export function fichaText(inspection: any): string {
  return [
    "Ficha rápida do imóvel — VistorIA",
    `Endereço: ${enderecoCompleto(inspection.imovel) || "—"}`,
    `Tipo: ${inspection.imovel.tipoImovel} (${inspection.mobiliario})`,
    inspection.imovel.metragem ? `Metragem: ${inspection.imovel.metragem}` : null,
    `Proprietário: ${inspection.imovel.proprietario || "—"}`,
    `Inquilino: ${inspection.imovel.inquilino || "—"}`,
    `Última vistoria: ${fmtDate(inspection.dataVistoria)} (${inspection.tipo})`,
    `Status: ${inspection.status}`,
  ].filter(Boolean).join("\n");
}

export function qrCodeUrl(text: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

export function fmtFileSize(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function escapeHtml(s: unknown): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(s ?? "").replace(/[&<>"']/g, (c) => map[c]);
}
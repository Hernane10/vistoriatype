import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Cloud, CloudOff, UploadCloud, DownloadCloud, Loader2, X } from "lucide-react";
import { supabaseEnabled } from "../lib/supabaseClient";
import { pushInspections, pullInspections } from "../lib/sync";

export default function CloudSyncWidget({ inspections, onImportInspections }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const pushMutation = useMutation({
    mutationFn: () => pushInspections(inspections),
    onSuccess: (count) => setMessage(`${count} vistoria(s) enviada(s) para a nuvem.`),
    onError: (err) => setMessage(err.message || "Falha ao enviar para a nuvem."),
  });

  const pullMutation = useMutation({
    mutationFn: async () => {
      const remote = await pullInspections();
      // Reuse the app's existing file-based import path: a Blob has the same
      // .text() method a File has, so no changes were needed in App.jsx.
      const blob = new Blob([JSON.stringify({ inspections: remote })], { type: "application/json" });
      return onImportInspections(blob);
    },
    onSuccess: (count) => setMessage(`${count} vistoria(s) recebida(s) da nuvem.`),
    onError: (err) => setMessage(err.message || "Falha ao baixar da nuvem."),
  });

  if (!supabaseEnabled) {
    return (
      <button
        className="btn-ghost rounded-full px-3 py-2.5 text-xs flex items-center gap-1.5"
        title="Supabase não configurado — o app continua funcionando 100% offline sem isso. Veja .env.example."
        disabled
      >
        <CloudOff size={14} /> Nuvem (desativada)
      </button>
    );
  }

  const busy = pushMutation.isPending || pullMutation.isPending;

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="btn-ghost rounded-full px-3 py-2.5 text-xs flex items-center gap-1.5">
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />} Nuvem
      </button>
      {open && (
        <div className="card modal-pop absolute right-0 mt-2 p-3" style={{ width: 260, zIndex: 30 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>Sincronização</span>
            <button onClick={() => setOpen(false)} className="btn-ghost rounded-full p-1"><X size={12} /></button>
          </div>
          <div className="grid gap-2">
            <button
              onClick={() => pushMutation.mutate()}
              disabled={busy || inspections.length === 0}
              className="btn-secondary rounded-full px-3 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              {pushMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
              Enviar tudo para a nuvem
            </button>
            <button
              onClick={() => pullMutation.mutate()}
              disabled={busy}
              className="btn-secondary rounded-full px-3 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              {pullMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <DownloadCloud size={13} />}
              Baixar da nuvem
            </button>
          </div>
          {message && <p className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>{message}</p>}
          <p className="text-[10px] mt-2" style={{ color: "var(--ink-faint)" }}>
            O app funciona offline normalmente — a nuvem é só um backup/sincronização entre dispositivos, sob login anônimo seguro deste aparelho.
          </p>
        </div>
      )}
    </div>
  );
}

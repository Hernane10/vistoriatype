// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { Cloud, CloudOff, Loader2 } from "lucide-react";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const map = {
    saving: { icon: <Loader2 size={13} className="animate-spin" />, text: "Salvando..." },
    saved: { icon: <Cloud size={13} />, text: "Salvo" },
    error: { icon: <CloudOff size={13} />, text: "Erro ao salvar" },
  };
  const { icon, text } = map[state] || map.saved;
  return (
    <span className="text-xs opacity-70 flex items-center gap-1.5">
      {icon} {text}
    </span>
  );
}


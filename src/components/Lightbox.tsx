// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { X } from "lucide-react";

interface LightboxProps {
  src: string | null;
  onClose: () => void;
}

export function Lightbox({ src, onClose }: LightboxProps) {
  if (!src) return null;
  return (
    <div
      className="no-print"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(10,11,16,0.92)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24, cursor: "zoom-out",
      }}
    >
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 18, right: 18, width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.12)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <X size={18} />
      </button>
      <img src={src} alt="" style={{ maxWidth: "94vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}


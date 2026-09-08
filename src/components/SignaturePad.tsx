// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useRef, useState, type PointerEvent } from "react";
import { PenLine, RotateCcw } from "lucide-react";

interface SignaturePadProps {
  label: string;
  value: string | null;
  onSave: (dataUrl: string | null) => void;
  locked: boolean;
}

export function SignaturePad({ label, value, onSave, locked }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);
  const [empty, setEmpty] = useState(true);

  function getPos(e: PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function start(e: PointerEvent<HTMLCanvasElement>) {
    if (locked) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    hasDrawn.current = true;
    setEmpty(false);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || locked) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#26364B";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasDrawn.current && canvasRef.current) {
      onSave(canvasRef.current.toDataURL("image/png"));
    }
  }

  // Fully resets: clears any drawn strokes, tells the parent there's no
  // signature anymore, and lets the (freshly re-mounted) canvas start blank.
  function clear() {
    hasDrawn.current = false;
    setEmpty(true);
    onSave(null);
  }

  return (
    <div className="flex-1 min-w-[220px]">
      <div className="flex items-center justify-between mb-1.5">
        <p className="label flex items-center gap-1.5"><PenLine size={12} /> {label}</p>
        {!locked && !empty && (
          <button onClick={clear} className="btn-ghost rounded-full px-2.5 py-1 text-xs no-print flex items-center gap-1">
            <RotateCcw size={11} /> Refazer
          </button>
        )}
      </div>

      {value ? (
        <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "#fff", padding: 4 }}>
          <img src={value} alt={`Assinatura ${label}`} style={{ width: "100%", height: 110, objectFit: "contain" }} />
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={500}
            height={220}
            style={{
              width: "100%", height: 110, borderRadius: 10, background: "#fff",
              border: `1.5px dashed ${locked ? "var(--line)" : "var(--accent)"}`,
              touchAction: "none", cursor: locked ? "default" : "crosshair",
            }}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            onPointerCancel={end}
          />
          {empty && (
            <p className="absolute inset-x-0 text-center text-xs pointer-events-none no-print" style={{ top: "42%", color: "var(--ink-faint)" }}>
              {locked ? "Sem assinatura" : "Assine aqui com o dedo ou o mouse"}
            </p>
          )}
        </div>
      )}

      <div className="mt-3">
        <div style={{ height: 34 }} />
        <p className="text-[10px] text-center" style={{ color: "var(--ink-soft)", borderTop: "1px solid var(--line)", paddingTop: 3 }}>
          Assinatura manual (se necessário)
        </p>
      </div>
    </div>
  );
}


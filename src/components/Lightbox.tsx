import { X } from "lucide-react";

interface LightboxProps {
  src: string | null;
  marcas?: any;
  onClose: () => void;
}

export function Lightbox({ src, marcas, onClose }: LightboxProps) {
  if (!src) return null;

  const pontos = Array.isArray(marcas) ? marcas : (marcas?.points || []);
  const comentario = Array.isArray(marcas) ? "" : (marcas?.comentario || "");

  return (
    <div
      className="no-print"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,11,16,0.92)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        cursor: "zoom-out",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          width: 36,
          height: 36,
          borderRadius: 999,
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        <X size={18} />
      </button>

      <div
        style={{
          position: "relative",
          display: "inline-block",
          maxWidth: "94vw",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt=""
          style={{
            maxWidth: "94vw",
            maxHeight: "90vh",
            objectFit: "contain",
            borderRadius: 8,
            display: "block",
          }}
        />

        {pontos.map((p: any, i: number) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%,-50%)",
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "3px solid #E23B3B",
              background: "rgba(226,59,59,0.3)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 2px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {comentario && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(226,59,59,0.9)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            maxWidth: "80vw",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          ⚠ {comentario}
        </div>
      )}
    </div>
  );
}
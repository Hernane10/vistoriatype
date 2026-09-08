// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { useRef, useState } from "react";
import { Mic } from "lucide-react";

export function TextAreaWithDictation({ value, onChange, placeholder, rows = 2, disabled, className = "", style }) {
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recognitionRef = useRef(null);
  const baseValueRef = useRef(value);

  function toggleDictation() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUnsupported(true);
      return;
    }
    baseValueRef.current = value;
    const rec = new SpeechRecognition();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      const prefix = baseValueRef.current ? baseValueRef.current.trim() + " " : "";
      onChange(prefix + transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  return (
    <div className="relative">
      <textarea
        disabled={disabled}
        className={`textarea w-full text-sm ${className}`}
        style={{ paddingRight: 40, ...style }}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {!disabled && (
        <button
          type="button"
          onClick={toggleDictation}
          title={listening ? "Parar ditado" : "Falar por áudio"}
          className="absolute rounded-full flex items-center justify-center no-print"
          style={{
            top: 8, right: 8, width: 24, height: 24,
            background: listening ? "var(--bad)" : "var(--card-alt)",
            color: listening ? "#fff" : "var(--ink-soft)",
            border: "1px solid var(--line)",
          }}
        >
          <Mic size={12} />
        </button>
      )}
      {unsupported && <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>Ditado por voz não é suportado neste navegador.</p>}
    </div>
  );
}

// Replaces window.prompt() everywhere in the app — native browser prompts are
// blocked inside the sandboxed preview here, which is why "Adicionar"/"Editar"
// buttons that used prompt() silently did nothing before.


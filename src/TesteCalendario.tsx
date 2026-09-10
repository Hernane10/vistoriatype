import { useState } from "react";

export function TesteCalendario() {
  const [agendamentos, setAgendamentos] = useState<{ id: string; data: string; titulo: string }[]>([]);
  const [data, setData] = useState("");
  const [titulo, setTitulo] = useState("");

  const adicionar = () => {
    if (!data || !titulo) return;
    setAgendamentos([...agendamentos, { id: Date.now().toString(), data, titulo }]);
    setTitulo("");
  };

  const remover = (id: string) => {
    setAgendamentos(agendamentos.filter((a) => a.id !== id));
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#1a1a2e", minHeight: "100vh" }}>
      <h2>📅 Teste de Agendamentos</h2>

      {/* FORMULÁRIO */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={{ padding: 8, marginRight: 10, width: 200 }}
        />
        <button onClick={adicionar} style={{ padding: "8px 16px", background: "yellow", color: "black" }}>
          Adicionar
        </button>
      </div>

      {/* LISTA DE AGENDAMENTOS */}
      <h3>📋 Agendamentos ({agendamentos.length})</h3>
      {agendamentos.length === 0 ? (
        <p>Nenhum agendamento</p>
      ) : (
        <ul>
          {agendamentos.map((a) => (
            <li key={a.id} style={{ marginBottom: 5 }}>
              <strong>{a.data}</strong> - {a.titulo}
              <button onClick={() => remover(a.id)} style={{ marginLeft: 10, color: "red" }}>
                ❌
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
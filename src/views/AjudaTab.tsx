// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { Info } from "lucide-react";

export function AjudaTab() {
  const passos = [
    { titulo: "Crie uma nova vistoria", texto: "Toque em \"Nova vistoria\" e preencha os dados gerais (tipo, data, vistoriador) e os dados do imóvel. Use o CEP para preencher o endereço automaticamente." },
    { titulo: "Escolha um modelo (opcional)", texto: "Na aba \"Vistorias pré-prontas\", use um modelo pronto (Kitnet, Casa, Apartamento, Comercial, Checklist Completo) ou o seu próprio modelo salvo para já criar os ambientes automaticamente. Você também pode gerar uma vistoria de exemplo para ver como fica o resultado." },
    { titulo: "Adicione e edite ambientes", texto: "Dentro da vistoria, use \"Adicionar ambiente\" para incluir cômodos prontos ou personalizados. Cada ambiente vem com os itens típicos (piso, parede, teto, etc.), que podem ser editados livremente." },
    { titulo: "Preencha cada item", texto: "Para cada item, marque o estado (Novo, Bom, Regular, Ruim, Péssimo ou Sem teste), preencha os campos técnicos e registre avarias quando houver. Adicione fotos (tiradas na hora ou enviadas) e vídeos (gravados ou enviados). Nas fotos, você pode marcar o ponto exato da avaria e escrever um comentário sobre ela." },
    { titulo: "Preencha medidores e chaves", texto: "Nas abas \"Medidores\" e \"Chaves\", registre a leitura de água, energia e gás (com concessionária e unidade já sugeridas) e a quantidade de cada tipo de chave entregue, com fotos se necessário." },
    { titulo: "Escreva o parecer técnico", texto: "Na aba \"Parecer Técnico\", registre uma avaliação geral do imóvel e anexe qualquer arquivo relevante (plantas, orçamentos, laudos anteriores, PDFs)." },
    { titulo: "Colete as assinaturas", texto: "Na aba \"Assinatura Digital\", vistoriador, locador e locatário podem assinar direto na tela (ou deixar em branco para assinar à caneta depois de imprimir)." },
    { titulo: "Finalize e gere o PDF", texto: "Toque em \"Finalizar\" para travar a edição. Depois vá até a aba \"PDF\" e toque em \"Imprimir / salvar PDF\" — uma nova aba abrirá com o laudo pronto para conferência, impressão ou compartilhamento." },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 pb-8">
      <div className="card p-6 mb-4">
        <h2 className="display text-lg font-bold mb-1">Como usar o VistorIA</h2>
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Um passo a passo rápido para fazer sua primeira vistoria do início ao fim.</p>
      </div>
      <div className="grid gap-3">
        {passos.map((p, i) => (
          <div key={i} className="card p-4 flex gap-3">
            <div
              className="shrink-0 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ width: 30, height: 30, background: "var(--accent)", color: "#F3E4E7" }}
            >
              {i + 1}
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--ink-strong)" }}>{p.titulo}</h3>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{p.texto}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-4 mt-4 flex items-start gap-2 text-xs" style={{ color: "var(--ink-soft)" }}>
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>Dica: use o botão de sol/lua no topo para alternar entre tema claro e escuro, e o microfone ao lado dos campos de observação para falar em vez de digitar enquanto anda pelo imóvel.</span>
      </div>
    </div>
  );
}


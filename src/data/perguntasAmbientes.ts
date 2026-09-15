// src/data/perguntasAmbientes.ts

export const PERGUNTAS_POR_AMBIENTE: Record<string, { key: string; label: string }[]> = {
  cozinha: [
    { key: "torneiraPingando", label: "A torneira da cozinha está pingando?" },
    { key: "piaEntupida", label: "Pia entupida ou com escoamento lento?" },
    { key: "registrosFuncionando", label: "Registros abrem e fecham normalmente?" },
    { key: "pressaoAgua", label: "Torneira tem pressão adequada?" },
    { key: "luzFuncionando", label: "Luz funciona?" },
    { key: "tomadasFuncionando", label: "Todas as tomadas funcionam?" },
    { key: "pisoDanificado", label: "Piso quebrado, trincado ou solto?" },
    { key: "paredeMofo", label: "Paredes com mofo, bolor ou umidade?" },
    { key: "portaFuncionando", label: "Porta funciona corretamente?" },
    { key: "janelaFuncionando", label: "Janela abre, fecha e tranca?" },
    { key: "armariosDanificados", label: "Armários soltos, quebrados ou com portas soltando?" },
    { key: "coifaFuncionando", label: "Exaustor / coifa funciona?" },
  ],
  quarto: [
    { key: "luzFuncionando", label: "Luz funciona?" },
    { key: "tomadasFuncionando", label: "Tomadas funcionam?" },
    { key: "janelaFuncionando", label: "Janela abre, fecha e tranca?" },
    { key: "portaFuncionando", label: "Porta funciona e tranca?" },
    { key: "pisoDanificado", label: "Piso quebrado, trincado ou solto?" },
    { key: "paredeMofo", label: "Paredes com mofo ou umidade?" },
    { key: "armarioPortas", label: "Portas do armário abrem e fecham bem?" },
    { key: "armarioDobradicas", label: "Dobradiças firmes?" },
    { key: "tetoInfiltracao", label: "Teto com manchas de infiltração?" },
    { key: "arCondicionado", label: "Ar-condicionado funciona?" },
  ],
  banheiro: [
    { key: "torneiraPingando", label: "Torneiras estão pingando?" },
    { key: "vasoFuncionando", label: "Vaso dá descarga corretamente?" },
    { key: "chuveiroFuncionando", label: "Chuveiro esquenta e tem pressão?" },
    { key: "boxVidroInteiro", label: "Box de vidro inteiro (sem trincas)?" },
    { key: "raloEntupido", label: "Ralo escoa bem?" },
    { key: "espelhoInteiro", label: "Espelho inteiro e fixo?" },
    { key: "luzFuncionando", label: "Luz funciona?" },
    { key: "tomadasFuncionando", label: "Tomadas funcionam?" },
    { key: "paredeRejunte", label: "Rejunte em bom estado?" },
    { key: "paredeMofo", label: "Paredes com mofo ou bolor?" },
    { key: "pisoDanificado", label: "Piso quebrado ou solto?" },
    { key: "portaFuncionando", label: "Porta funciona e tranca?" },
  ],
  sala: [
    { key: "luzFuncionando", label: "Luz funciona?" },
    { key: "tomadasFuncionando", label: "Tomadas funcionam?" },
    { key: "janelaFuncionando", label: "Janela abre, fecha e tranca?" },
    { key: "portaFuncionando", label: "Porta funciona e tranca?" },
    { key: "pisoDanificado", label: "Piso quebrado ou solto?" },
    { key: "paredeMofo", label: "Paredes com mofo ou umidade?" },
    { key: "tetoInfiltracao", label: "Teto com manchas de infiltração?" },
    { key: "arCondicionado", label: "Ar-condicionado funciona?" },
  ],
  garagem: [
    { key: "portaoFuncionando", label: "Portão abre e fecha corretamente?" },
    { key: "portaoAutomatico", label: "Automação funciona?" },
    { key: "luzFuncionando", label: "Iluminação funciona?" },
    { key: "tomadasFuncionando", label: "Tomadas funcionam?" },
    { key: "pisoDanificado", label: "Piso quebrado ou solto?" },
    { key: "tetoInfiltracao", label: "Teto com infiltração?" },
  ],
  "area de servico": [
    { key: "torneiraPingando", label: "Torneira está pingando?" },
    { key: "tanqueFuncionando", label: "Tanque escoa bem?" },
    { key: "maquinaLavar", label: "Ponto de máquina funciona?" },
    { key: "luzFuncionando", label: "Luz funciona?" },
    { key: "tomadasFuncionando", label: "Tomadas funcionam?" },
    { key: "paredeMofo", label: "Paredes com mofo?" },
    { key: "pisoDanificado", label: "Piso quebrado ou solto?" },
  ],
  corredor: [
    { key: "luzFuncionando", label: "Iluminação funciona?" },
    { key: "pisoDanificado", label: "Piso quebrado ou solto?" },
    { key: "paredeMofo", label: "Paredes com mofo?" },
    { key: "tetoInfiltracao", label: "Teto com infiltração?" },
  ],
  "area externa": [
    { key: "pisoDanificado", label: "Piso quebrado ou solto?" },
    { key: "muroIntegro", label: "Muro íntegro (sem rachaduras)?" },
    { key: "iluminacaoFuncionando", label: "Iluminação funciona?" },
    { key: "portaoFuncionando", label: "Portão funciona?" },
  ],
  lavabo: [
    { key: "torneiraPingando", label: "Torneira pingando?" },
    { key: "vasoFuncionando", label: "Vaso funciona?" },
    { key: "luzFuncionando", label: "Luz funciona?" },
    { key: "espelhoInteiro", label: "Espelho inteiro?" },
    { key: "paredeRejunte", label: "Rejunte em bom estado?" },
  ],
  escritorio: [
    { key: "luzFuncionando", label: "Luz funciona?" },
    { key: "tomadasFuncionando", label: "Tomadas funcionam?" },
    { key: "janelaFuncionando", label: "Janela funciona?" },
    { key: "pisoDanificado", label: "Piso em bom estado?" },
    { key: "paredeMofo", label: "Paredes sem mofo?" },
  ],
};

export function getTipoAmbiente(nomeAmbiente: string): string {
  if (!nomeAmbiente) return "";
  const nome = nomeAmbiente
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (nome.includes("cozinha")) return "cozinha";
  if (nome.includes("quarto") || nome.includes("dormitorio") || nome.includes("suite")) return "quarto";
  if (nome.includes("banheiro")) return "banheiro";
  if (nome.includes("lavabo")) return "lavabo";
  if (nome.includes("sala")) return "sala";
  if (nome.includes("garagem")) return "garagem";
  if (nome.includes("area de servico") || nome.includes("lavanderia")) return "area de servico";
  if (nome.includes("corredor") || nome.includes("hall")) return "corredor";
  if (nome.includes("area externa") || nome.includes("quintal") || nome.includes("jardim")) return "area externa";
  if (nome.includes("escritorio")) return "escritorio";

  return "";
}

export function getPerguntasAmbiente(nomeAmbiente: string) {
  const tipo = getTipoAmbiente(nomeAmbiente);
  return PERGUNTAS_POR_AMBIENTE[tipo] || [];
}
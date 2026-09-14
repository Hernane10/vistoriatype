import { supabase } from "./supabase"; // ajuste o caminho se necessário

// ============================================
// Gerar link permanente do laudo
// ============================================
export async function gerarLinkLaudo(
  htmlContent: string,
  nomeArquivo: string
): Promise<string | null> {
  // 1. Converte o HTML em arquivo (Blob)
  const arquivo = new Blob([htmlContent], { type: "text/html" });

  // 2. Faz o upload para o bucket 'laudos-vistoria'
  const { error: uploadError } = await supabase.storage
    .from("laudos-vistoria")
    .upload(nomeArquivo, arquivo, {
      contentType: "text/html",
      upsert: true,
    });

  if (uploadError) {
    console.error("Erro no upload:", uploadError);
    return null;
  }

  // 3. Gera a URL pública
  const { data: urlData } = supabase.storage
    .from("laudos-vistoria")
    .getPublicUrl(nomeArquivo);

  return urlData.publicUrl;
}
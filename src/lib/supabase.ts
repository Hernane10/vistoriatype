import { createClient } from "@supabase/supabase-js";

// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================

// Pegue estas informações no seu projeto Supabase:
// 1. Acesse https://supabase.com/dashboard
// 2. Selecione seu projeto
// 3. Vá em Settings > API
// 4. Copie a URL e a chave anônima (anon/public)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis de ambiente existem
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem ser configuradas no arquivo .env"
  );
}

// Cria e exporta o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// FUNÇÕES AUXILIARES PARA AUTENTICAÇÃO
// ============================================

// Pegar o usuário atual
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erro ao pegar usuário:", error);
    return null;
  }
  return data.user;
}

// Sair da conta
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erro ao sair:", error);
    return false;
  }
  return true;
}
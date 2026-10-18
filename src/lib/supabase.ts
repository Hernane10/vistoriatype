// Supabase client + auth helpers.
//
// Kept as a thin wrapper around src/lib/supabaseClient.ts so the app has ONE
// client (and one session). The app is offline-first, so missing
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY must mean "cloud features
// disabled", never a crash: `supabase` is null and every consumer checks it.
// (This module used to call createClient() unconditionally at import time,
// which threw "supabaseUrl is required" and blanked the entire app offline —
// CalendarSimples imports it.)
//
// Pegue estas informações no seu projeto Supabase:
// 1. Acesse https://supabase.com/dashboard
// 2. Selecione seu projeto
// 3. Vá em Settings > API
// 4. Copie a URL e a chave anônima (anon/public)

import { supabase, supabaseEnabled } from "./supabaseClient";

export { supabase, supabaseEnabled };

// ============================================
// FUNÇÕES AUXILIARES PARA AUTENTICAÇÃO
// ============================================

// Pegar o usuário atual
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erro ao pegar usuário:", error);
    return null;
  }
  return data.user;
}

// Sair da conta
export async function signOut() {
  if (!supabase) return false;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erro ao sair:", error);
    return false;
  }
  return true;
}

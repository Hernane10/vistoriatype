// Offline-first sync between the local IndexedDB copy (source of truth for
// the UI, always available even with no signal) and Supabase (source of
// truth for backup / multi-device access).
//
// Pattern used: "local-first". Every write already happened in IndexedDB
// before this module is ever called (see src/lib/storage.js) — nothing here
// blocks the UI. Sync is best-effort and safe to retry; it never deletes
// local data on failure.

import { supabase, supabaseEnabled } from "./supabaseClient";

// Ensures we have a stable, private identity for this device/browser without
// requiring a login screen. Supabase Anonymous Auth issues a real auth.uid()
// that Row Level Security can key off of (see supabase/schema.sql).
export async function ensureSignedIn() {
  if (!supabaseEnabled) throw new Error("Supabase não configurado (veja .env.example).");
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}

export async function pushInspections(inspections, onProgress) {
  const user = await ensureSignedIn();
  let done = 0;
  for (const insp of inspections) {
    const { error } = await supabase.from("inspections").upsert({
      id: insp.id,
      owner_id: user.id,
      data: insp,
    });
    if (error) throw error;
    done += 1;
    onProgress?.(done, inspections.length);
  }
  return done;
}

export async function pullInspections() {
  const user = await ensureSignedIn();
  const { data, error } = await supabase
    .from("inspections")
    .select("data")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => row.data);
}

export async function deleteInspectionRemote(id) {
  const user = await ensureSignedIn();
  const { error } = await supabase.from("inspections").delete().eq("id", id).eq("owner_id", user.id);
  if (error) throw error;
}

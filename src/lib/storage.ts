// Offline-first storage layer, backed by IndexedDB via Dexie.
//
// Why: the old localStorage-based version had a hard ~5-10MB quota shared by
// the whole origin. A handful of vistorias with photos blows past that fast
// and silently starts failing. IndexedDB has a much larger quota (hundreds of
// MB to GB, depending on the browser/device) and works fully offline, which
// matters for an inspection app used inside buildings with poor signal.
//
// This file keeps the EXACT same public interface as the original
// window.storage-style wrapper (get/set/delete/list), so App.jsx did not need
// to change at all — only this file changed.

import Dexie, { type Table } from "dexie";

interface KVRow {
  key: string;
  value?: string;
  pendingSync?: number;
  updatedAt?: number;
}

export interface StorageResult {
  key: string;
  value: string;
  shared: boolean;
}

export interface StorageDeleteResult {
  key: string;
  deleted: true;
  shared: boolean;
}

export interface StorageListResult {
  keys: string[];
  prefix: string;
  shared: boolean;
}

interface VistoriaDB extends Dexie {
  kv: Table<KVRow, string>;
}

export const db = new Dexie("vistoria-ia") as VistoriaDB;
db.version(1).stores({
  // `key` is the primary key (matches the keys App.tsx already uses, e.g.
  // "insp:abc123", "insp-index", "custom-models", "ui-theme"...).
  // `value` is always a JSON string, exactly like the original API.
  // `pendingSync` flags rows changed locally that still need to reach
  // Supabase — used by src/lib/sync.ts, App.tsx doesn't need to know about it.
  kv: "key, pendingSync",
});

export const storage = {
  async get(key: string): Promise<StorageResult | null> {
    try {
      const row = await db.kv.get(key);
      if (!row || row.value === undefined) return null;
      return { key, value: row.value, shared: false };
    } catch (err) {
      console.error("storage.get failed", key, err);
      return null;
    }
  },

  async set(key: string, value: string): Promise<StorageResult | null> {
    try {
      await db.kv.put({ key, value, pendingSync: 1, updatedAt: Date.now() });
      return { key, value, shared: false };
    } catch (err) {
      console.error("storage.set failed", key, err);
      return null;
    }
  },

  async delete(key: string): Promise<StorageDeleteResult | null> {
    try {
      await db.kv.delete(key);
      // Tombstone so a future sync can propagate the deletion to Supabase too.
      await db.kv.put({ key: `__deleted__:${key}`, value: "1", pendingSync: 1, updatedAt: Date.now() });
      return { key, deleted: true, shared: false };
    } catch (err) {
      console.error("storage.delete failed", key, err);
      return null;
    }
  },

  async list(prefix = ""): Promise<StorageListResult | null> {
    try {
      const rows = await db.kv.toArray();
      const keys = rows
        .map((r) => r.key)
        .filter((k) => k.startsWith(prefix) && !k.startsWith("__deleted__:"));
      return { keys, prefix, shared: false };
    } catch (err) {
      console.error("storage.list failed", err);
      return null;
    }
  },
};

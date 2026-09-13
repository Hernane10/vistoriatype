// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import { storage } from "./storage";
export const STORAGE_INDEX_KEY = "inspections-index";

export const inspKey = (id) => `insp:${id}`;


export async function storageLoadAll() {
  try {
    const idxRes = await storage.get(STORAGE_INDEX_KEY);
    const ids = idxRes ? JSON.parse(idxRes.value) : [];
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const r = await storage.get(inspKey(id));
          return r ? JSON.parse(r.value) : null;
        } catch {
          return null;
        }
      })
    );
    return results.filter(Boolean).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch {
    return [];
  }
}

export async function storageSaveInspection(insp) {
  await storage.set(inspKey(insp.id), JSON.stringify(insp));

  // Atualiza o índice — garante que essa vistoria apareça na lista
  try {
    const idxRes = await storage.get(STORAGE_INDEX_KEY);
    const ids = idxRes ? JSON.parse(idxRes.value) : [];
    if (!ids.includes(insp.id)) {
      ids.unshift(insp.id);
      await storage.set(STORAGE_INDEX_KEY, JSON.stringify(ids));
    }
  } catch {
    // Se falhar, tenta salvar só o índice
    await storage.set(STORAGE_INDEX_KEY, JSON.stringify([insp.id]));
  }
}


export async function storageSaveIndex(ids) {
  await storage.set(STORAGE_INDEX_KEY, JSON.stringify(ids));
}


export async function storageDeleteInspection(id, remainingIds) {
  await storage.delete(inspKey(id)).catch(() => {});
  await storageSaveIndex(remainingIds);
}

// Merge older saved inspections (before medidores/chaves/logo existed) with new defaults


// Auto-extracted from the original single-file App.jsx — logic is unchanged,
// only the file boundaries moved, so behavior should be identical.

import type { Foto, MediaType } from "../types/inspection";

export function fileToDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function mediaTypeOf(file: File): MediaType {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "image";
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não foi possível ler a imagem.")); };
    img.src = url;
  });
}

// Resizes to at most 1200px on the longest side and re-encodes as JPEG at 80%
// quality — done entirely in the browser via <canvas>, no upload needed.
export function compressImageFile(file: File, maxDim = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Falha ao comprimir imagem.")); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não foi possível ler a imagem.")); };
    img.src = url;
  });
}

// Decides whether an image is worth compressing. If it's already at/under the
// 1200px target and already a fairly small file, compressing it again would
// only degrade quality for no size benefit — so we ask before doing it.
export async function maybeCompressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const { width, height } = await getImageDimensions(file);
    const alreadySmallDim = Math.max(width, height) <= 1200;
    const alreadySmallFile = file.size <= 250 * 1024;
    if (alreadySmallDim && alreadySmallFile) {
      const proceed = window.confirm(
        `A imagem "${file.name}" já parece pequena ou de baixa qualidade (${width}×${height}px, ${(file.size / 1024).toFixed(0)} KB).\n\nComprimir mesmo assim para 1200px / 80%? (Cancelar mantém a imagem original sem alterações)`
      );
      if (!proceed) return file;
    }
    const compressed = await compressImageFile(file);
    return compressed.size < file.size ? compressed : file;
  } catch {
    return file; // if anything goes wrong reading it, just use the original untouched
  }
}

export async function filesToPhotos(files: File[]): Promise<Foto[]> {
  const processed = await Promise.all(
    files.map((f) => (f.type.startsWith("image/") ? maybeCompressImage(f) : f))
  );
  const urls = await Promise.all(processed.map(fileToDataURL));
  const now = new Date().toISOString();
  return urls.map((src, i) => ({ src, date: now, type: mediaTypeOf(files[i]), marcas: [] }));
}

export function normalizePhoto(p: unknown): Foto {
  if (typeof p === "string") return { src: p, date: null, type: "image", marcas: [] };
  return { type: "image", marcas: [], ...(p as Partial<Foto>) } as Foto;
}

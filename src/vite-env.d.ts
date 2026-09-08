/// <reference types="vite/client" />

// Declares the shape of our custom VITE_-prefixed environment variables so
// `import.meta.env.VITE_SUPABASE_URL` etc. are typed instead of `any`.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

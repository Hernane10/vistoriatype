import { createContext } from "react";

export const LightboxContext = createContext<
  (src: string, marcas?: any) => void
>(() => {});
/// <reference types="astro/client" />

interface Window {
  /** Hook analytics globale (src/scripts/analytics.js, piattaforma). Chiamalo sempre con ?. */
  paTrack?: (nome: string, props?: Record<string, string | number | boolean>) => void;
}

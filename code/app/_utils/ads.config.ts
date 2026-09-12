/**
 * Configuración de publicidad. Mientras `client` esté vacío se pintan
 * marcadores de posición propios: nunca se carga el script de AdSense, lo que
 * permite desarrollar y desplegar el sitio antes de tener la cuenta aprobada.
 *
 * Para activar los anuncios reales: rellena `client` con tu `ca-pub-...` y los
 * identificadores de bloque que creaste en AdSense, y publica `/ads.txt`.
 */
export const ADS_CONFIG = {
  /** Ej. "ca-pub-1234567890123456". Vacío = modo marcador de posición. */
  client: "",
  slots: {
    /** Rascacielos lateral izquierdo (160x600 / 300x600). */
    railLeft: "",
    /** Rascacielos lateral derecho (160x600 / 300x600). */
    railRight: "",
    /** Banner horizontal bajo las cards de la portada. */
    inline: "",
    /** Bloque del intersticial a pantalla completa. */
    interstitial: "",
  },
  /** Segundos que el intersticial permanece sin poder cerrarse. */
  interstitialSeconds: 5,
} as const;

export function areAdsEnabled(): boolean {
  return ADS_CONFIG.client.trim().length > 0;
}

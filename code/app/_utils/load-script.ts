/**
 * Carga un script externo una sola vez y resuelve cuando está disponible.
 * Se usa para Phaser y PeerJS, que viven en CDN para no engordar el bundle ni
 * arrastrar APIs de navegador al render del servidor.
 */
const pending = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadScript sólo puede ejecutarse en el navegador"));
  }

  const cached = pending.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-src="${src}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.src = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => {
      pending.delete(src);
      reject(new Error(`No se pudo cargar ${src}`));
    });

    if (!existing) document.head.appendChild(script);
  });

  pending.set(src, promise);
  return promise;
}

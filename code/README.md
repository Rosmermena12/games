# GamesFull

Plataforma de juegos arcade multijugador que se ejecutan íntegramente en el navegador.
Sin registro, sin backend de partidas y sin descargas: se comparte un código de cinco
caracteres y los dos navegadores se conectan directamente por WebRTC.

## Stack

| Pieza          | Elección                       | Motivo                                                                       |
| -------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| Framework      | vinext (App Router) + React 19 | Server Components para el contenido y de texto; islas cliente sólo en el juego |
| Motor de juego | Phaser 3 (CDN)                 | Vive en el DOM, sin iframes ni pérdida de foco del teclado                    |
| Multijugador   | PeerJS / WebRTC (CDN)          | Conexión navegador a navegador; cero coste de servidor de partidas            |
| Estilos        | Tailwind v4 con tokens propios | Tema claro/oscuro con las mismas variables que ya usaba el proyecto           |
| Publicidad     | Google AdSense                 | Raíles laterales fijos + intersticial entre pantallas                         |

## Estructura

```
app/
  _components/        UI compartida (cabecera, pie, cards, anuncios, consentimiento)
  _hooks/             use-consent (Consent Mode v2 sobre localStorage)
  _interfaces/        Tipos seguros para cliente y servidor
  _utils/             site.config, ads.config, catálogo de juegos, cargador de scripts
  juegos/
    _components/      Marco de partida, lobby, montaje de Phaser, sesión de juego
    _engine/          Escenas puras de Phaser (poing, hockey, bloques)
    _net/             Envoltorio de PeerJS y hook de sesión P2P
    poing|hockey|bloques/page.tsx
  legal/              Términos, privacidad y cookies
  como-jugar/ contacto/ sobre-nosotros/
public/               ads.txt, robots.txt, sitemap.xml, favicon
```

La escena de Phaser nunca toca el DOM de la página: se comunica con React mediante el
objeto `GameBridge` (`app/juegos/_engine/types.ts`), que expone marcador, estado, fin de
partida y los mandos de reinicio.

## Desarrollo

```bash
npm run dev
```

## Poner los anuncios en producción

1. **Rellena `app/_utils/site.config.ts`** con el dominio real, el correo de contacto y el
   titular del sitio. Esos valores alimentan los textos legales y los metadatos.
2. **Actualiza los dominios** de `public/robots.txt` y `public/sitemap.xml`.
3. **Solicita AdSense** con el sitio ya publicado y con contenido accesible. Los requisitos
   que ya cubre este proyecto: páginas de privacidad, cookies, términos, contacto y «sobre
   nosotros» enlazadas desde el pie en todas las páginas; aviso de cookies con rechazo en un
   clic; Consent Mode v2 denegado por defecto; `ads.txt`; `robots.txt` que permite a
   `Mediapartners-Google` y `AdsBot-Google`; contenido original y navegación coherente.
4. **Cuando te aprueben**, edita `app/_utils/ads.config.ts`:
   ```ts
   client: "ca-pub-XXXXXXXXXXXXXXXX",
   slots: { railLeft: "1234567890", railRight: "...", inline: "...", interstitial: "..." },
   ```
   Hasta que `client` esté relleno no se descarga ningún script de Google y los bloques se
   pintan como marcadores de posición.
5. **Publica `public/ads.txt`** con tu `pub-...` real en la línea `google.com`.

### Dónde aparecen los anuncios

- **Raíles laterales**: fijos a ambos lados del tablero a partir de 1280 px de ancho; se
  ocultan en pantallas pequeñas para no invadir el área de juego.
- **Intersticial a pantalla completa**: al abrir cualquier juego y al reiniciar una partida.
  Es cerrable a los 5 segundos (`ADS_CONFIG.interstitialSeconds`), está etiquetado como
  publicidad y nunca se superpone al tablero mientras se juega.
- **Banner horizontal**: bajo las cards de la portada.

## Notas de arquitectura

- No hay Data Access Layer porque el sitio no consume ningún backend: todo el estado vive en
  el navegador. Si en el futuro se añaden rankings o cuentas, el acceso debe encapsularse en
  `_internal` con `import "server-only"`, según la convención del proyecto.
- `app/products/` es la demo de la plantilla original. No está enlazada desde ninguna página
  y `robots.txt` la excluye; puede borrarse cuando ya no haga falta como referencia.

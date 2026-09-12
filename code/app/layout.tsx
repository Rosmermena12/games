import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";
import { FirstVisitNotice } from "./_components/first-visit-notice";
import { SafeArea } from "./_components/boundary";
import { SITE_CONFIG } from "./_utils/site.config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s — ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
  },
  robots: { index: true, follow: true },
};

/**
 * Se ejecuta antes del primer paint para evitar el parpadeo de tema (FOUC).
 * Debe permanecer sincrónico y sin dependencias.
 */
const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

/**
 * Consent Mode v2: todo denegado por defecto y se reaplica la decisión guardada
 * antes de que cualquier etiqueta publicitaria pueda leer almacenamiento.
 */
const consentBootstrap = `
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });
  try {
    var raw = localStorage.getItem("gf-consent-v1");
    if (raw) {
      var saved = JSON.parse(raw);
      gtag("consent", "update", {
        ad_storage: saved.ads,
        ad_user_data: saved.ads,
        ad_personalization: saved.ads,
        analytics_storage: saved.analytics
      });
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script dangerouslySetInnerHTML={{ __html: consentBootstrap }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-bg text-fg">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-xs focus:text-accent-fg"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <div id="contenido">{children}</div>
        <SiteFooter />
        <SafeArea>
          <FirstVisitNotice />
        </SafeArea>
      </body>
    </html>
  );
}

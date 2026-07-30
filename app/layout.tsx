import type { Metadata } from "next";
import { Michroma, Geist, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Analytics } from "@vercel/analytics/next";
import { siteAssetUrl } from "@/lib/site-assets";

const michroma = Michroma({
  variable: "--font-michroma",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.datzoncompany.com"),
  title: {
    template: "%s | Datzon",
    default: "Datzon | Ingeniería y Automatización Industrial",
  },
  description:
    "Datzon diseña y despliega sistemas de ingeniería industrial avanzada: automatización mecánica, robótica, edge computing y analítica de datos en tiempo real.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://www.datzoncompany.com",
    siteName: "Datzon",
    title: "Datzon | Ingeniería y Automatización Industrial",
    description:
      "Datzon diseña y despliega sistemas de ingeniería industrial avanzada: automatización mecánica, robótica, edge computing y analítica de datos en tiempo real.",
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Datzon",
  legalName: "Datzon Industrial Automation",
  url: "https://www.datzoncompany.com",
  logo: siteAssetUrl("logo_datzon.svg"),
  foundingDate: "2026-03",
  email: "contacto@datzoncompany.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Cal. Mercator 484, Dpto. 101",
    addressLocality: "San Borja",
    addressRegion: "Lima",
    addressCountry: "PE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "contacto@datzoncompany.com",
    contactType: "customer support",
    availableLanguage: ["Spanish"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${michroma.variable} ${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* No ayuda al LCP: con el loader por defecto, next/image pide las
            imágenes a /_next/image en nuestro propio origen, y Vercel las
            proxea desde Supabase en el servidor. Se mantiene porque el
            navegador sí abre esta conexión si algún día se enlaza un asset
            del bucket en directo, y una conexión especulativa no cuesta nada. */}
        <link rel="preconnect" href="https://adnvzdcqcneqjemxneht.supabase.co" />
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd)
              .replace(/</g, "\\u003c")
              .replace(/>/g, "\\u003e")
              .replace(/&/g, "\\u0026"),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ClientLayout>{children}</ClientLayout>
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}

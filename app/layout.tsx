import type { Metadata } from "next";
import { Michroma, Geist, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Analytics } from "@vercel/analytics/next";

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
  legalName: "DATZON S.A.C.",
  url: "https://www.datzoncompany.com",
  logo: "https://www.datzoncompany.com/logo_datzon.svg",
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
      className={`${michroma.variable} ${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
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
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  // Sin title: la home hereda el default del layout,
  // "Datzon | Ingeniería y Automatización Industrial".
  description:
    "Datzon, Ingeniería y automatización industrial en Lima, Perú. Robótica, PLC, SCADA, visión artificial y sistemas automatizados para optimizar la producción de tu planta.",
};

export default function Home() {
  return <HomeContent />;
}

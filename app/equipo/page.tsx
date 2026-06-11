import type { Metadata } from "next";
import TeamContent from "@/components/TeamContent";

export const metadata: Metadata = {
  title: "Equipo",
  description:
    "El equipo de ingeniería de Datzon: robótica, automatización industrial y sistemas de control.",
};

export default function EquipoPage() {
  return <TeamContent />;
}

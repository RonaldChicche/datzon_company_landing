import TeamContent from "@/components/TeamContent";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Equipo",
  description:
    "El equipo de ingeniería de Datzon: robótica, automatización industrial y sistemas de control.",
  path: "/equipo",
});

export default function EquipoPage() {
  return <TeamContent />;
}

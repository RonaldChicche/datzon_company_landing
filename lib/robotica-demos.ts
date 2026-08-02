// Datos de la página /robotica (sala de control). El copy es el del spec
// 2026-08-02-robotica-sala-de-control-design.md; los tests de este módulo
// codifican las reglas duras de Ronald y no deben relajarse.
import { siteAssetUrl } from "@/lib/site-assets";

export type Demo = {
  id: "paletizado" | "soldadura" | "servicio";
  nombre: string;
  aplicacion: string;
  etiqueta: string;
  gancho: string;
  parrafo: string;
  variantesTitulo: string;
  variantes: string[];
  video: string;
  poster: string;
};

const demo = (
  id: Demo["id"], n: number, nombre: string, aplicacion: string,
  gancho: string, parrafo: string, variantesTitulo: string, variantes: string[],
): Demo => ({
  id, nombre, aplicacion,
  etiqueta: `Demo 0${n} · ${nombre}`,
  gancho, parrafo, variantesTitulo,
  variantes: [...variantes, "¿El tuyo?"],
  video: siteAssetUrl(`robotica/${id}.mp4`),
  poster: siteAssetUrl(`robotica/${id}-poster.jpg`),
});

export const DEMOS: Demo[] = [
  demo("paletizado", 1, "Paletizado", "Fin de línea",
    "Del envasado al despacho, sin manos.",
    "Una estación envasa y tapa; la otra carga las cajas al carro. El patrón, el ritmo y el formato se adaptan a tu producto; el brazo es el mismo.",
    "El mismo brazo, otros formatos",
    ["Cajas", "Sacos", "Bidones", "Bandejas", "Patrón a pedido"]),
  demo("soldadura", 2, "Soldadura", "Uniones repetibles",
    "El mismo cordón, turno tras turno.",
    "La antorcha avanza con velocidad y ángulo constantes donde una mano se fatiga. Menos retrabajos, acabado uniforme, trazabilidad de cada unión.",
    "Cambia el efector, cambia el proceso",
    ["MIG", "TIG", "Por puntos", "Plasma", "Corte"]),
  demo("servicio", 3, "Manipulación delicada", "Piezas frágiles",
    "Si sirve una cerveza sin romper el vaso, puede con tu pieza más delicada.",
    "Agarre calibrado sobre el cristal y vertido controlado desde la muñeca: fuerza y orientación bajo control durante todo el ciclo.",
    "La misma delicadeza para",
    ["Vidrio", "Cerámica", "Alimentos", "Electrónica", "Empaques"]),
];

export type Aplicacion = { nombre: string; linea: string; imagen: string };

const app = (archivo: string, nombre: string, linea: string): Aplicacion => ({
  nombre, linea, imagen: siteAssetUrl(`robotica/apps/${archivo}.jpg`),
});

export const APLICACIONES: Aplicacion[] = [
  app("paletizado", "Paletizado", "Fin de línea y alto volumen sin cuellos de botella."),
  app("soldadura", "Soldadura", "MIG/TIG con repetibilidad que no depende del turno."),
  app("pick-place", "Pick & place", "Clasificación y empaque a ritmo de línea."),
  app("pintura", "Pintura", "Acabado uniforme, pasada tras pasada."),
  app("manipulacion", "Manipulación", "Cargas pesadas o piezas frágiles, con la misma calma."),
  app("inspeccion", "Inspección", "Visión artificial montada donde haga falta mirar."),
  app("mecanizado", "Mecanizado", "Fresado y taladrado con precisión que no se negocia."),
  app("corte", "Corte", "Plasma o láser siguiendo la trayectoria exacta."),
  app("pulido", "Pulido", "Superficies uniformes sin brazos cansados."),
  app("dosificacion", "Dosificación", "El cordón justo de adhesivo o sellador, siempre."),
];

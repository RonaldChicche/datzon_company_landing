# Ciclo 2 — Copy profesional en español

**Fecha:** 2026-07-30
**Rama:** `feat/ciclo-2-copy-espanol` (desde `main` en `37a0250`, post-merge del ciclo 1)

---

## Contexto

El usuario pidió eliminar anglicismos de la pantalla y revisar el discurso comercial. El inventario del copy reveló que **el diagnóstico de partida era incorrecto**: casi no hay anglicismos.

- **Anglicismos reales: dos.** El badge del hero (`Industrial Automation`) y la palabra `Scroll`.
- **Las marcas** (Azure, Power BI, SAP, ABB, Universal Robots, Yaskawa, Siemens, Festo, Schneider, Raspberry Pi, Farino) y **los acrónimos técnicos** (PLC, SCADA, CNC, IoT, ERP) no son anglicismos: son vocabulario estándar del sector. Traducirlos restaría credibilidad.
- **Las descripciones de servicios ya son buenas**: específicas y técnicas. No se tocan.
- **Las páginas `/robotica`, `/proyectos` y `/equipo` están limpias.**

El problema real de profesionalismo está en otro sitio: **`ContactModal.tsx` está escrito en registro de ciencia ficción** ("PROTOCOLO DE CONTACTO", "IDENTIFICAR REMITENTE", "TRANSMITIR SOLICITUD"). Es español impecable, pero suena a videojuego en el formulario donde un jefe de planta pide una cotización — justo el punto donde la credibilidad importa más.

**Hallazgo que resuelve el diseño:** `ContactForm.tsx` (el formulario de la home) ya tiene la voz correcta. No hay que inventar un tono; hay que llevar el modal al que ya existe y funciona. Esto convierte el ejercicio de estilo en uno de consistencia.

## Decisiones tomadas (con el usuario, 2026-07-30)

| Decisión | Valor |
|---|---|
| Tagline en pantalla | **Traducir** el badge a "Automatización Industrial". El usuario aceptó tras advertírsele que, si el tagline está registrado en INDECOPI en inglés, traducirlo puede afectar la prueba de uso de marca — verificación pendiente por su parte, no bloqueante |
| Nombre comercial | **Se conserva intacto** ("Datzon Industrial Automation") donde funciona como nombre propio: `alt`, JSON-LD, bloques de datos de empresa |
| Titular del hero | **No se toca** ("Revolucionando el futuro de las industrias"). El usuario prefirió no arriesgar consistencia con material ya publicado |
| Voz del modal | **Adopta la de `ContactForm.tsx`** |
| Estética del modal | **Se conserva**: mayúsculas y guion bajo de etiquetas (`NOMBRE COMPLETO_`) son lenguaje visual documentado en `DESIGN.md` |
| Frase de alcance | **"Diseñamos, fabricamos y automatizamos."** Elegida por el usuario entre 5 opciones |
| Métrica de experiencia | **Se conserva** `+20 años de experiencia acumulada`. Defendible: solo John Ojeda suma 25 años (ver su bio en `/equipo`), así que la cifra acumulada del equipo es conservadora |

Descartado y por qué:

- **Frases tipo "del sensor a la nube"**: el usuario las rechazó por genéricas. Correcto — son clichés del marketing de industria 4.0 que cualquier integrador podría firmar.
- **Reemplazar la métrica de experiencia**: se propuso ("11 tecnologías integradas") y el usuario decidió conservar la actual.
- **Traducir marcas y acrónimos**: restaría credibilidad técnica.

## Cambios

### 1. `components/HomeContent.tsx`

- **Línea 87** (badge del hero): `Industrial Automation` → `Automatización Industrial`.
- **Línea 112**: `<span>Scroll</span>` → `<span>Desliza</span>`.
- **Línea 166** (primera métrica): la etiqueta pasa de `"Dominios de ingeniería integrados, de la celda robótica al dato"` a `"Dominios de ingeniería integrados"`. La coletilla se corta porque reducía todo el alcance a la celda robótica, dejando fuera software y líneas completas, y porque resta fuerza al número.
- **Línea 197 NO se toca**: ahí `Datzon Industrial Automation` es el nombre comercial en el bloque de datos de empresa.

### 2. `components/Footer.tsx`

El párrafo bajo el logo:

```
Ingeniería y automatización industrial de extremo a extremo.
De la celda robótica al tablero en la nube.
```

pasa a:

```
Ingeniería y automatización industrial de extremo a extremo.
Diseñamos, fabricamos y automatizamos.
```

Estructura deliberada: la primera oración es la afirmación de categoría, la segunda la hace concreta con tres verbos. Si al verlo en pantalla las dos resultan redundantes, la primera oración es la que sobra — decisión a tomar en la comprobación visual, no a ciegas.

`Footer.tsx:17` (alt) y `Footer.tsx:42` (`<h4>`) **no se tocan**: nombre comercial.

### 3. `components/ContactModal.tsx`

Sustituciones de texto, sin tocar estructura, clases ni lógica:

| Actual | Nuevo |
|---|---|
| `PROTOCOLO DE CONTACTO` | `Contacto` |
| `PORTAL DE CONSULTAS` | `Cuéntanos tu proyecto` |
| placeholder `IDENTIFICAR REMITENTE` | `Tu nombre` |
| placeholder `CORREO@DOMINIO.COM` | `nombre@empresa.com` |
| placeholder `DEFINE TUS REQUERIMIENTOS O PROPUESTA...` | `Describe brevemente el proceso o la línea que quieres automatizar` |
| `TRANSMITIR SOLICITUD` | `Enviar solicitud` |
| `TRANSMITIENDO...` (estado de carga) | `Enviando…` |
| `TRANSMISIÓN RECIBIDA` | `¡Solicitud enviada!` |
| `Nos pondremos en contacto contigo en breve.` | `Te contactamos en máximo 1 día hábil.` |

### 3.b `components/ContactForm.tsx` — corregir una promesa excesiva

El formulario de la home dice hoy, **en producción**:

> "Te respondemos en 1 día hábil **con una propuesta concreta**."

Prometer una propuesta concreta en 24 horas es prometer de más: sin conocer la línea, el volumen ni las restricciones de la planta, ninguna propuesta seria cabe en ese plazo. El primer contacto real sirve para entender la necesidad y coordinar una reunión.

Pasa a decir lo mismo que el modal:

> "Te contactamos en máximo 1 día hábil."

Ambos formularios quedan así con el mismo mensaje de éxito, y ninguno promete lo que no se puede cumplir.

Las etiquetas de campo (`NOMBRE COMPLETO_`, `DIRECCIÓN DE RETORNO_`, `TELÉFONO_`, `EMPRESA_`, `INDUSTRIA_`, `DESCRIPCIÓN DE LA CONSULTA_`) **conservan mayúsculas y guion bajo**. Solo se revisa que su redacción sea natural: `DIRECCIÓN DE RETORNO_` pasa a `CORREO_` y `DESCRIPCIÓN DE LA CONSULTA_` a `TU PROYECTO_`, por ser las dos que arrastran el registro de ciencia ficción.

## Fuera de alcance

- El titular del hero y las seis descripciones de servicios.
- El bloque de contacto del footer (`Respuesta en 1 día hábil`): coherente con el mensaje nuevo y no promete de más, así que se deja. Si se quisiera unificar la fórmula exacta, sería `Respuesta en máximo 1 día hábil` — decisión menor, fuera de este ciclo.
- Marcas y acrónimos técnicos.
- `/robotica`, `/proyectos`, `/equipo`, `/politica-privacidad`, `/terminos-de-uso`.
- Los textos de `PalletizerSim.tsx` (`SIM 01 · PALETIZADO · VISTA ISOMÉTRICA`): son etiquetas técnicas de una simulación y el registro es apropiado ahí.
- Ciclos 3–5 del roadmap.

## Verificación

1. `pnpm exec tsc --noEmit`, `pnpm test` y `pnpm build` en verde (el copy no debería afectarlos; sirve de red de seguridad ante un JSX mal cerrado).
2. Búsqueda de residuos: `grep -rn "Industrial Automation" components/ app/` devuelve **solo** las cinco apariciones del nombre comercial (dos `alt`, un `<h4>`, un bloque de empresa, un `legalName`) y ninguna como badge.
3. `grep -rn "Scroll\|TRANSMI\|PROTOCOLO\|REMITENTE" components/` no devuelve nada.
4. Comprobación visual en dev: badge del hero en español; footer con la frase nueva; modal abierto desde `/equipo` con la voz nueva; métrica sin coletilla.
5. Juicio sobre la redundancia del párrafo del footer (ver §2) con el sitio delante.

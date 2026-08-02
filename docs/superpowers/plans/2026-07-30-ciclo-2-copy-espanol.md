# Ciclo 2, Copy profesional en español: Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar los dos anglicismos de pantalla, llevar el modal de contacto al registro profesional que ya usa el formulario de la home, ampliar la frase de alcance más allá de la celda robótica, y corregir una promesa excesiva que hoy está en producción.

**Architecture:** Solo sustituciones de texto en cuatro componentes. Ninguna lógica, ningún estilo, ninguna estructura JSX cambia. `ContactForm.tsx` es la referencia de voz: el modal se alinea con él, no al revés.

**Tech Stack:** React 19 / Next 16, TypeScript. Sin dependencias nuevas.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-30-ciclo-2-copy-espanol-design.md`, sus decisiones son ley.
- **El nombre comercial "Datzon Industrial Automation" NO se traduce nunca**: es nombre propio. Solo cambia el badge suelto del hero (`HomeContent.tsx:87`).
- **NO se tocan**: el titular del hero, las seis descripciones de `SERVICES`, las marcas de `BRANDS`, los acrónimos técnicos (PLC, SCADA, CNC, IoT, ERP), `PalletizerSim.tsx`, ni las páginas `/robotica`, `/proyectos`, `/equipo`, `/politica-privacidad`, `/terminos-de-uso`.
- **En `ContactModal.tsx` se conservan mayúsculas y guion bajo** de las etiquetas de campo (`NOMBRE COMPLETO_`): son lenguaje visual de `DESIGN.md`. Solo cambian las palabras.
- No se altera ninguna clase de Tailwind, ni la estructura de los componentes, ni la lógica de formularios (validación, `source`, honeypot).
- Mensaje de éxito canónico, idéntico en ambos formularios: **"Te contactamos en máximo 1 día hábil."**

---

### Task 1: Anglicismos y alcance en la home

**Files:**
- Modify: `components/HomeContent.tsx` (líneas 87, 112, 166)
- Modify: `components/Footer.tsx` (párrafo bajo el logo, ~línea 24)

**Interfaces:** ninguna, solo texto.

- [ ] **Step 1: Badge del hero**

En `components/HomeContent.tsx`, dentro del `<motion.span className="chip">` (línea 87):

```tsx
            Industrial Automation
```

pasa a:

```tsx
            Automatización Industrial
```

**NO tocar la línea 197** (`Datzon Industrial Automation`): ahí es el nombre comercial en el bloque de datos de empresa.

- [ ] **Step 2: Indicador de scroll**

En el mismo archivo, línea 112:

```tsx
          <span>Scroll</span>
```

pasa a:

```tsx
          <span>Desliza</span>
```

- [ ] **Step 3: Primera métrica**

En el array `stats-grid` (línea 166):

```tsx
              { n: <><b>6</b></>, l: "Dominios de ingeniería integrados, de la celda robótica al dato" },
```

pasa a:

```tsx
              { n: <><b>6</b></>, l: "Dominios de ingeniería integrados" },
```

Las otras tres métricas (`-30%`, `24/7`, `+20`) **no se tocan**.

- [ ] **Step 4: Frase de alcance del footer**

En `components/Footer.tsx`, el `<p>` bajo el logo:

```tsx
            <p>
              Ingeniería y automatización industrial de extremo a extremo.
              De la celda robótica al tablero en la nube.
            </p>
```

pasa a:

```tsx
            <p>
              Ingeniería y automatización industrial de extremo a extremo.
              Diseñamos, fabricamos y automatizamos.
            </p>
```

**NO tocar** `Footer.tsx:17` (alt) ni `Footer.tsx:42` (`<h4>Datzon Industrial Automation</h4>`).

- [ ] **Step 5: Verificar**

Run: `pnpm exec tsc --noEmit`
Expected: limpio.

Run: `grep -rn "Industrial Automation" components/ app/ | grep -v node_modules`
Expected: exactamente 5 líneas, todas del nombre comercial, `Header.tsx:41` (alt), `Footer.tsx:17` (alt), `Footer.tsx:42` (h4), `HomeContent.tsx:197` (bloque empresa), `app/layout.tsx:53` (legalName). Ninguna es el badge.

Run: `grep -rn "Scroll\|celda robótica al" components/`
Expected: sin resultados.

- [ ] **Step 6: Commit**

```bash
git add components/HomeContent.tsx components/Footer.tsx
git commit -m "feat: badge y alcance en español; la frase de alcance deja de reducirse a la celda"
```

---

### Task 2: El modal adopta la voz del formulario

**Files:**
- Modify: `components/ContactModal.tsx`
- Modify: `components/ContactForm.tsx` (línea 44, la promesa excesiva)

**Interfaces:**
- Consumes: el mensaje de éxito canónico de Global Constraints, que ambos archivos deben terminar compartiendo palabra por palabra.

- [ ] **Step 1: Cabecera del modal**

En `components/ContactModal.tsx`, en el bloque `sticky top-0` de la cabecera:

- El eyebrow `PROTOCOLO DE CONTACTO` pasa a `Contacto`.
- El `<h2 id="contact-modal-title">` `PORTAL DE CONSULTAS` pasa a `Cuéntanos tu proyecto`.

Las clases de ambos elementos se conservan tal cual.

- [ ] **Step 2: Etiquetas y placeholders**

Sustituciones, conservando mayúsculas, guion bajo y clases:

| Actual | Nuevo |
|---|---|
| etiqueta `DIRECCIÓN DE RETORNO_` | `CORREO_` |
| etiqueta `DESCRIPCIÓN DE LA CONSULTA_` | `TU PROYECTO_` |
| placeholder `IDENTIFICAR REMITENTE` | `Tu nombre` |
| placeholder `CORREO@DOMINIO.COM` | `nombre@empresa.com` |
| placeholder `DEFINE TUS REQUERIMIENTOS O PROPUESTA...` | `Describe brevemente el proceso o la línea que quieres automatizar` |

Las etiquetas `NOMBRE COMPLETO_`, `TELÉFONO_`, `EMPRESA_` e `INDUSTRIA_` **no cambian**. Los placeholders `+51 ... (OPCIONAL)`, `ORGANIZACIÓN (OPCIONAL)` y `SELECCIONA (OPCIONAL)` **tampoco**.

- [ ] **Step 3: Botón y estado de carga**

En el `<button type="submit">`:

```tsx
{status === "loading" ? "TRANSMITIENDO..." : "TRANSMITIR SOLICITUD"}
```

pasa a:

```tsx
{status === "loading" ? "Enviando…" : "Enviar solicitud"}
```

Se conserva el `<Send size={16} />` y todas las clases del botón.

- [ ] **Step 4: Mensaje de éxito del modal**

En el bloque `status === "success"`:

- `TRANSMISIÓN RECIBIDA` pasa a `¡Solicitud enviada!`
- `Nos pondremos en contacto contigo en breve.` pasa a `Te contactamos en máximo 1 día hábil.`

El botón `CERRAR` se conserva.

- [ ] **Step 5: Corregir la promesa excesiva del formulario de la home**

En `components/ContactForm.tsx`, línea 44:

```tsx
        <p>Te respondemos en 1 día hábil con una propuesta concreta.</p>
```

pasa a:

```tsx
        <p>Te contactamos en máximo 1 día hábil.</p>
```

Motivo (spec §3.b): sin conocer la línea, el volumen ni las restricciones de la planta, ninguna propuesta seria cabe en 24 horas. Esta frase está hoy en producción.

- [ ] **Step 6: Verificar**

Run: `pnpm exec tsc --noEmit && pnpm test`
Expected: limpio y 42/42. (Los tests no cubren copy; sirven de red ante un JSX mal cerrado.)

Run: `grep -rn "TRANSMI\|PROTOCOLO\|REMITENTE\|propuesta concreta\|DIRECCIÓN DE RETORNO" components/`
Expected: sin resultados.

Run: `grep -rn "Te contactamos en máximo 1 día hábil" components/`
Expected: exactamente 2 líneas (una en cada formulario), idénticas.

- [ ] **Step 7: Commit**

```bash
git add components/ContactModal.tsx components/ContactForm.tsx
git commit -m "feat: el modal adopta la voz del formulario y ninguno promete una propuesta en 24h"
```

---

### Task 3: Comprobación visual y juicio sobre el footer

**Files:** ninguno por defecto. Posible modificación de `components/Footer.tsx` según el resultado del Step 2.

- [ ] **Step 1: Levantar y revisar**

```bash
pnpm build && PORT=3001 pnpm start &
```

Revisar en el navegador a 1440px y a 375px:
- Home: badge dice "Automatización Industrial"; el indicador bajo el hero dice "Desliza"; la primera métrica dice "6 Dominios de ingeniería integrados" sin coletilla.
- Footer: el párrafo nuevo.
- Modal (abrirlo desde `/equipo` con el botón "Cotizar"): cabecera, etiquetas, placeholders, botón. Enviar un caso de prueba para ver el mensaje de éxito nuevo, y **borrar después la fila de prueba** de `landing.leads` con la tool MCP `mcp__claude_ai_Supabase__execute_sql`.

- [ ] **Step 2: Juicio sobre la redundancia del footer**

Con el sitio delante, decidir si estas dos oraciones juntas resultan redundantes:

> Ingeniería y automatización industrial de extremo a extremo.
> Diseñamos, fabricamos y automatizamos.

Si lo son, **la que sobra es la primera** (la segunda es la concreta y la eligió el usuario). En ese caso el párrafo queda solo con "Diseñamos, fabricamos y automatizamos." y se commitea el ajuste. Si no lo son, no se toca nada.

Esta decisión es del usuario: presentarle una captura del footer y preguntar, no decidir en solitario.

- [ ] **Step 3: Apagar el servidor**

```bash
lsof -ti tcp:3001 | xargs kill
```

## Self-review (hecho al escribir)

- **Cobertura del spec:** §1 HomeContent → T1 Steps 1-3 · §2 Footer → T1 Step 4 · §3 ContactModal → T2 Steps 1-4 · §3.b ContactForm → T2 Step 5 · §Verificación → T1 Step 5, T2 Step 6, T3. Sin huecos.
- **Placeholders:** ninguno; todos los textos son literales exactos.
- **Consistencia:** el mensaje de éxito aparece con las mismas palabras en Global Constraints, T2 Step 4 y T2 Step 5, y el grep del Step 6 lo verifica.
- **Riesgo señalado:** el Step 1 de T3 crea un lead de prueba en la base de producción; el propio paso obliga a borrarlo.

# Ciclo 4 — Demos de robótica en vídeo: producción y presentación

**Fecha:** 2026-08-01
**Estado:** decisiones tomadas, pendiente el guion gráfico y la implementación
**Alcance:** producción de los clips 3D y su presentación en el sitio

---

## Objetivo

Llevar las tres demos 3D de robótica a producción en el sitio, con calidad
suficiente para transmitir credibilidad técnica a empresas industriales. Las
animaciones ya están construidas y validadas; lo que falta es el acabado
cinematográfico y decidir cómo viven en la web.

---

## Estado de partida

Tres líneas construidas por script en Blender, con cinemática inversa analítica
real (no animación libre). Los guiones viven en
`~/Documents/DatzonCompany/robot_blender/scripts/`, **fuera de este repositorio**:

| Línea | Guion | Salida |
|---|---|---|
| Paletizado | `bl_linea_paletizado.py` | `salidas/paletizado.mp4` (1,1 MB) |
| Soldadura | `bl_linea_soldadura.py` | `salidas/soldadura.mp4` (293 KB) |
| Servicio | `bl_linea_servicio.py` | `salidas/servicio.mp4` (1,4 MB) |

Apoyo: `bl_lookdev_prueba.py` (comparación de motores) y `bl_entorno_bar.py`
(enriquecimiento del entorno). Assets de iluminación y textura en
`robot_blender/assets_hdri/`, todos **CC0 de Poly Haven** — sin obligación de
crédito, a diferencia de los assets de bar de Sketchfab que quedaron apartados.

---

## Decisiones tomadas

### D1 — Motor de render: fotorrealista, pero más adelante

Se va a **Cycles** (simulación física de la luz) para la versión final, pero
**no todavía**. Ahora se trabaja en EEVEE (motor rápido) para iterar el entorno
y los planos.

Medido en el M4 a 1920×1080, con las mismas mejoras aplicadas a ambos:

| Versión | Por fotograma | Las tres líneas |
|---|---|---|
| EEVEE actual, sin vestir | ~1 s | 35 min |
| EEVEE con HDRI, texturas y desenfoques | 8,9 s | 5,0 h |
| Cycles | 33,8 s | 19,2 h |

**Corrección registrada:** durante la sesión se afirmó que la diferencia era
«minutos contra medio día». Es falso: eso comparaba EEVEE *sin vestir* contra
Cycles. Una vez que al motor rápido se le ponen iluminación real, texturas y
desenfoques, también se vuelve lento. La distancia real es de **4×**, no de 100×.
Los dos son trabajos de una noche.

### D2 — Qué produce el realismo

La mayor parte del salto **no la da el motor**, la dan cuatro ingredientes que
ambos comparten:

1. **HDRI** — iluminar con la fotografía 360° de un sitio real en vez de con focos
   inventados. Es lo que hace que el cromo y el cristal reflejen algo creíble.
2. **Texturas PBR** — imágenes que definen color, rugosidad y relieve píxel a
   píxel. Un color plano más un número de rugosidad se lee siempre como plástico.
3. **Desenfoque de campo** — tenerlo todo nítido a la vez delata al ordenador.
4. **Desenfoque de movimiento** — sin él, el movimiento parece a saltos.

Más la **corrección de color** en post, que es buena parte de lo «cinematográfico».

### D3 — La IA generativa no toca el robot

Runway Gen-4 (con Aleph), Kling 3.0 Omni y Veo 3.1 hacen vídeo a vídeo de forma
madura, pero las comparativas de 2026 coinciden en que producen artefactos
justamente en «piezas mecánicas complejas e instrumentos de precisión». El FR10
es el producto real de Datzon: una articulación deformada destruye la
credibilidad que la pieza viene a construir.

**Uso permitido:** capa de acabado sobre planos cortos para bruma, luz
volumétrica, vida de fondo y suciedad de superficie. El render fija la
estructura; la IA la enriquece.

**Uso prohibido:** generar el gesto del robot. Además, Kling Omni solo acepta
clips de 3 a 10 s, así que el de paletizado ni siquiera entra de una pieza.

**No hace falta entrenar un modelo propio.** Para tres clips, el CG existente es
más barato, más exacto y más rápido de corregir.

### D4 — El reparto de trabajo estándar

El flujo dominante en 2026 para anuncios de producto es **multimodelo y por
plano**: CG para el héroe (control exacto del hardware), IA o archivo para
entorno y planos de recurso, y montaje y etalonaje convencionales para unirlo.

### D5 — Blender, no Unreal

Unreal es para tiempo real y producción virtual. Como el producto final son
clips pregrabados, migrar significaría reconstruir el rig, la cinemática
analítica y las tres escenas para ganar velocidad de render que se resuelve
dejando la máquina encendida dos noches.

### D6 — DaVinci Resolve para el montaje

Existe servidor MCP maduro (331 de 336 métodos de la API probados, junio 2026).
**Requisito bloqueante: Resolve Studio** (~295 USD, pago único). La edición
gratuita no permite scripting externo.

### D7 — Todo va en `/robotica`, en rejilla de tres

Descartada la portada como ubicación. Descartado también el **simulador 2D
`PalletizerSim`**: es justamente lo que estas demos vienen a reemplazar.

Estructura acordada (maqueta:
https://claude.ai/code/artifact/db80372c-b73e-42db-99a6-bf3f28bb86a9):

- Cabecera con el argumento diferencial: cinemática real, cada movimiento
  alcanzable por el robot.
- Rejilla de tres vídeos con **cifras bajo cada uno** (2 estaciones, 8 cajas por
  carro, 25 mm/s, 250 mm de cordón, 45° de vertido). Un ingeniero mira los
  números antes que la animación.
- Lista de aplicaciones con **pintura marcada como «en producción»**.
- Cierre con llamada a diagnóstico.

### D8 — La barra se presenta como «manipulación delicada»

No como bar. Las seis aplicaciones de `/robotica` son industriales y eventos es
otro mercado con otro comprador. El argumento industrial es agarre de cristal
por la cintura y control de vertido con la muñeca: la misma precisión que exige
una pieza frágil en línea de producción.

### D9 — Pintura como cuarta demo

Rejas o estructura con pistola. Pendiente de construir.

### D10 — Patrón de montaje para cualquier medio pesado

Copiado de visualcomponents.com, y es gratis:

```html
<iframe src="…" loading="lazy" style="aspect-ratio: 10/7; max-width:100%">
```

El `loading="lazy"` mantiene lo pesado fuera de la carga inicial; el
`aspect-ratio` reserva el hueco para que no desplace nada al aparecer. Gracias a
eso su LCP se queda en **1,38 s con 15,2 MB dentro**. Su CLS de 0,90 no viene del
visor sino del banner, las cookies y el chat.

**Corrección registrada:** se afirmó antes que meter 3D real amenazaba las Core
Web Vitals. Con este patrón, no tiene por qué.

---

## Fuera de alcance

**Secuencia pre-renderizada navegable** — anotada en Notion:
https://app.notion.com/p/3b0ac27a4ba4817e8a2fc0636051becd

**Three.js / 3D interactivo** — medido en ~0,6 MB (393 KB de modelo comprimido
más librería), frente a los 15,2 MB de la aplicación Unity de Visual Components.
Viable, pero se retoma solo si la medición real muestra que la gente interactúa.

---

## Pendiente

| Qué | Estado |
|---|---|
| Guion gráfico y variedad de cámara de las tres líneas | No empezado. Ahora todos los planos son del mismo lado. |
| Alargar la línea de servicio (más vasos) | Pedido, no hecho. |
| Trocear paletizado en planos cercanos | Pedido, no hecho. |
| Demo de pintura | No empezada. |
| Haces de luz volumétricos en el bar | La bruma está puesta pero EEVEE no la resuelve. |
| Bombillas que brillen dentro de la pantalla | Pendiente. |
| **Verificar la duración de paletizado** | **El fichero reporta 717 fotogramas y su nombre dice 1433. El dato de «60 s» usado en varios cálculos no es fiable.** |
| Prueba con Stitch MCP | Requiere que Ronald lo configure (clave API propia de Stitch, no el paquete de terceros). |

---

## Cerrado y no reabrir

- El gesto de soldadura queda aprobado tal cual. No hace falta la revisión del
  inge John.
- El tono del tablero de la barra no es problema.
- El bucle de la línea de servicio da un salto de un vaso al reiniciar. Aceptado
  a propósito: con los vasos quietos el ciclo no puede cerrar.

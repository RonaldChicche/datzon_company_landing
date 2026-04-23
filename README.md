# Datzon Kinetic Landing Page

Este proyecto es una aplicación web moderna y de alto rendimiento diseñada para **Datzon**, una empresa líder en automatización industrial y robótica. La aplicación ha sido migrada de una estructura SPA a una arquitectura multipágina utilizando **Next.js**, garantizando escalabilidad, SEO y una experiencia de usuario fluida.

## 🚀 Tecnologías Utilizadas

*   **Next.js 15 (App Router):** Framework principal para la gestión de rutas basadas en archivos y renderizado optimizado.
*   **React 19:** Biblioteca base para la construcción de interfaces de usuario.
*   **Tailwind CSS:** Framework de utilidades CSS para un diseño ultra-moderno y totalmente responsivo.
*   **Framer Motion (motion/react):** Utilizado para animaciones de alto nivel, micro-interacciones y transiciones suaves entre páginas.
*   **Lucide React:** Set de iconos vectoriales ligeros y consistentes.
*   **TypeScript:** Garantiza la robustez del código mediante tipado estático.
*   **Pnpm:** Gestor de paquetes eficiente para una instalación rápida y estructurada.

## 📁 Estructura del Proyecto

El proyecto sigue las convenciones de Next.js App Router:

```
landing/
├── app/                  # Rutas principales y lógica de servidor
│   ├── equipo/           # Página de "Nuestro Equipo"
│   ├── solutions/        # Página de "Soluciones de Ingeniería"
│   ├── layout.tsx        # Layout base con Header/Footer
│   ├── page.tsx          # Página de Inicio (Landing principal)
│   └── ClientLayout.tsx  # Wrapper de cliente para animaciones y estados globales
├── components/           # Componentes UI reutilizables
│   ├── Header.tsx        # Navegación con logo interactivo
│   ├── Footer.tsx        # Pie de página técnico
│   └── ContactModal.tsx  # Portal de contacto con validación
├── public/               # Activos estáticos (SVG, logos)
└── tailwind.config.ts    # Configuración del sistema de diseño
```

## 🛠️ Características Principales

*   **Navegación Dinámica:** Transiciones suaves entre páginas utilizando `AnimatePresence`.
*   **Diseño Industrial Premium:** Estética técnica con paleta de colores HSL, tipografías modernas (Inter, Manrope) y efectos de vidrio (glassmorphism).
*   **Logo Interactivo:** Integración de SVG con estados de hover dinámicos y fondo adaptativo.
*   **SEO Optimizado:** Estructura semántica HTML5 y metaetiquetas preparadas para buscadores.
*   **Portal de Contacto:** Modal integrado con efectos de entrada/salida y diseño de "consola técnica".

## 📦 Instalación y Desarrollo

Para ejecutar el proyecto localmente:

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

3. El proyecto estará disponible en `http://localhost:3000`.

## 🌐 Despliegue

Este proyecto está optimizado para su despliegue nativo en **Vercel**. No requiere contenedores externos, ya que Vercel detecta automáticamente la configuración de Next.js.

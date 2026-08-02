"use client";

import React, { useContext, useState } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface FrozenRouterProps {
  children: React.ReactNode;
}

export default function FrozenRouter({ children }: FrozenRouterProps) {
  const context = useContext(LayoutRouterContext);
  // useState en vez de useRef: el inicializador captura el primer contexto y no
  // vuelve a cambiar (que es justo lo que queremos congelar), y leerlo durante
  // el render es legal, leer una ref en render no lo es.
  const [frozen] = useState(context);

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

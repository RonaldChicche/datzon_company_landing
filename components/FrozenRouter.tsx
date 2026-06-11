"use client";

import React, { useContext, useRef } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface FrozenRouterProps {
  children: React.ReactNode;
}

export default function FrozenRouter({ children }: FrozenRouterProps) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context);

  return (
    <LayoutRouterContext.Provider value={frozen.current}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

"use client";

import { type ReactNode } from "react";

interface ContactButtonProps {
  children: ReactNode;
  className?: string;
}

export default function ContactButton({ children, className }: ContactButtonProps) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("open-contact-modal"))}
      className={className}
    >
      {children}
    </button>
  );
}

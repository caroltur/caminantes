// src/components/theme-provider.tsx

"use client" // Importante para Next.js si es un componente de cliente

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// 1. Definir el tipo ThemeProviderProps usando React.ComponentProps
// Esto infiere las props directamente del componente ThemeProvider de next-themes
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
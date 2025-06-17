import type React from "react"
import "./globals.css"

import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { inter, playfair, spaceGrotesk, delaGothicOne, dotgothic16, notoSerifSC, sairaExtraCondensed } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Daily Intention - Mindful Daily Check-in",
  description: "A mindful practice app to help you be intentional about where you put your attention and take actions.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable} ${spaceGrotesk.variable} ${delaGothicOne.variable} ${dotgothic16.variable} ${notoSerifSC.variable} ${sairaExtraCondensed.variable}`}>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

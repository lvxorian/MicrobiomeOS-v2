import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ColonyCanvas } from "@/components/layout/ColonyCanvas";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MicrobiomeOS",
  description: "Výzkumná platforma pro mikrobiom — denní přehledy studií, evidence-based analýza, znalostní graf taxonů.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          spaceGrotesk.variable,
          jetbrainsMono.variable,
          inter.variable
        )}
      >
        <TooltipProvider>
          <ColonyCanvas />
          <Sidebar />
          <Topbar />
          <main className="ml-56 mt-14 min-h-[calc(100vh-3.5rem)] p-6 relative z-10">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileNav, DesktopNav } from "@/components/layout/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayControl",
  description: "Gestión financiera personal simple y visual",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PayControl",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <DesktopNav />
          <main className="flex-1 md:ml-64 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}

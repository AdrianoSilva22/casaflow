import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/constants/product";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: PRODUCT_NAME,
  title: {
    default: PRODUCT_NAME,
    template: `%s · ${PRODUCT_NAME}`,
  },
  description: PRODUCT_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: PRODUCT_NAME,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192" }, { url: "/icons/icon-512.png", sizes: "512x512" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7C3AED" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>
          {children}
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}

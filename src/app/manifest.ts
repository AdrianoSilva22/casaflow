import type { MetadataRoute } from "next";
import { PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/constants/product";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PRODUCT_NAME,
    short_name: PRODUCT_NAME,
    description: PRODUCT_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#7C3AED",
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}

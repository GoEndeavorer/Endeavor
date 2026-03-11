import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Endeavor",
    short_name: "Endeavor",
    description:
      "Post what you want to do. Find people who want to do it with you. Plan it, fund it, make it happen.",
    start_url: "/feed",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#00FF00",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

import { createFileRoute } from "@tanstack/react-router";

const manifest = {
  name: "Minha Rotina de Treino com GymIO",
  short_name: "GymIO",
  description: "Acompanhe sua rotina semanal: força, metabólico e progresso marcado na hora.",
  display: "standalone",
  background_color: "#F2EDE4",
  theme_color: "#A9C4D9",
  orientation: "portrait",
  scope: "/",
  lang: "pt-BR",
  icons: [
    { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
};

export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const startUrl = id ? "/?pwa=1" : "/";
        const headers = new Headers({ "cache-control": "no-store" });
        if (id) {
          headers.set("set-cookie", `gymio_plan_id=${encodeURIComponent(id)}; Path=/; Max-Age=31536000; SameSite=Lax`);
        }
        return new Response(JSON.stringify({ ...manifest, start_url: startUrl }), {
          headers: { ...Object.fromEntries(headers), "content-type": "application/manifest+json; charset=utf-8" },
        });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { getCookie } from "@tanstack/react-start/server";

export const Route = createFileRoute("/pwa")({
  server: {
    handlers: {
      GET: async () => {
        const savedPlanId = getCookie("gymio_plan_id");
        const destination = savedPlanId ? `/?id=${encodeURIComponent(savedPlanId)}` : "/";
        return Response.redirect(destination, 302);
      },
    },
  },
});

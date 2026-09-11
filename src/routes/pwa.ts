import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pwa")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const savedPlanId = request.headers
          .get("cookie")
          ?.match(/(?:^|;\s*)gymio_plan_id=([^;]+)/)?.[1];
        const planId = savedPlanId ? decodeURIComponent(savedPlanId) : null;
        const destination = planId ? `/?id=${encodeURIComponent(planId)}` : "/";
        return Response.redirect(new URL(destination, request.url), 302);
      },
    },
  },
});

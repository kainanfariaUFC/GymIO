import { Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "treino:install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const currentUrl = new URL(window.location.href);

    if (manifestLink && currentUrl.searchParams.has("id")) {
      manifestLink.href = `/manifest.webmanifest?id=${encodeURIComponent(
        currentUrl.searchParams.get("id") ?? "",
      )}`;
    }

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");

    const isIOSDevice = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="fixed left-4 right-4 top-16 z-40 mx-auto max-w-xl rounded-2xl border border-border bg-card/95 p-4 shadow-soft backdrop-blur sm:left-auto sm:right-4 sm:top-4 sm:w-80">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary-foreground">
          {deferredPrompt ? <Download size={20} aria-hidden /> : <Share2 size={20} aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Adicionar à tela inicial</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {deferredPrompt
              ? "Instale o app para acessar sua rotina de treino como um app nativo."
              : "Toque em Compartilhar e depois em 'Adicionar à Tela de Início' para instalar o app."}
          </p>
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="mt-2 inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Instalar agora
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Fechar"
          className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

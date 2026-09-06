"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScanBarcode, X } from "lucide-react";
import type { NormalizedVolume } from "@/lib/google-books";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BookCover } from "./book-cover";
import { Button, Input, Label, Spinner } from "./ui";

// Minimal typings for the Barcode Detection API, which is not yet in the
// TypeScript DOM lib. https://w3c.github.io/webcodecs/ (barcode detection)
type DetectedBarcode = { rawValue: string; format: string };
type BarcodeDetectorInstance = {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
};
type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
};

const DESIRED_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "itf",
  "codabar",
  "qr_code",
];

const DETECT_INTERVAL_MS = 250;
const DUPLICATE_DEBOUNCE_MS = 2000;

function getBarcodeDetectorCtor(): BarcodeDetectorCtor | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null;
}

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  onSelect: (volume: NormalizedVolume) => void;
};

export function BarcodeScannerButton({ locale, dictionary, onSelect }: Props) {
  const [supported, setSupported] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Feature detection must run client-side; SSR renders no button.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(getBarcodeDetectorCtor() !== null);
  }, []);

  if (!supported) return null;

  const t = dictionary.barcodeScanner;

  return (
    <>
      <div className="md:hidden">
        <Button
          type="button"
          variant="primary"
          className="w-full gap-2 py-3 text-base"
          onClick={() => setOpen(true)}
        >
          <ScanBarcode aria-hidden="true" className="h-5 w-5" />
          {t.button}
        </Button>
      </div>
      {open ? (
        <BarcodeScannerOverlay
          locale={locale}
          dictionary={dictionary}
          onSelect={onSelect}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

type OverlayState =
  | { kind: "scanning" }
  | { kind: "lookingUp" }
  | { kind: "found"; volume: NormalizedVolume }
  | { kind: "notFound" }
  | { kind: "lookupError" }
  | { kind: "manual"; reason: "denied" | "unavailable" };

function BarcodeScannerOverlay({
  locale,
  dictionary,
  onSelect,
  onClose,
}: Props & { onClose: () => void }) {
  const t = dictionary.barcodeScanner;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);
  const stateRef = useRef<OverlayState["kind"]>("scanning");
  const [state, setState] = useState<OverlayState>({ kind: "scanning" });
  const [manualCode, setManualCode] = useState("");

  const updateState = useCallback((next: OverlayState) => {
    stateRef.current = next.kind;
    setState(next);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const lookup = useCallback(
    async (code: string) => {
      const cleaned = code.trim();
      if (!cleaned) return;
      updateState({ kind: "lookingUp" });
      try {
        const res = await fetch(
          `/api/books/isbn?code=${encodeURIComponent(cleaned)}&lang=${encodeURIComponent(locale)}`,
        );
        if (!res.ok) {
          updateState({ kind: "lookupError" });
          return;
        }
        const body = (await res.json()) as { results?: NormalizedVolume[] };
        const volume = Array.isArray(body.results) ? body.results[0] : undefined;
        updateState(volume ? { kind: "found", volume } : { kind: "notFound" });
      } catch {
        updateState({ kind: "lookupError" });
      }
    },
    [locale, updateState],
  );

  const startScanning = useCallback(async () => {
    const ctor = getBarcodeDetectorCtor();
    if (!ctor) {
      updateState({ kind: "manual", reason: "unavailable" });
      return;
    }

    let detector: BarcodeDetectorInstance;
    try {
      let formats = DESIRED_FORMATS;
      if (ctor.getSupportedFormats) {
        const available = await ctor.getSupportedFormats();
        const intersection = DESIRED_FORMATS.filter((f) => available.includes(f));
        if (intersection.length > 0) formats = intersection;
      }
      detector = new ctor({ formats });
    } catch {
      detector = new ctor();
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      updateState({
        kind: "manual",
        reason: name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable",
      });
      return;
    }
    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) {
      stopStream();
      return;
    }
    video.srcObject = stream;
    await video.play().catch(() => undefined);

    const timer = window.setInterval(async () => {
      if (document.hidden) return;
      if (stateRef.current !== "scanning") return;
      const el = videoRef.current;
      if (!el || el.readyState < 2) return;
      try {
        const barcodes = await detector.detect(el);
        const value = barcodes[0]?.rawValue?.trim();
        if (!value) return;
        const now = Date.now();
        const last = lastScanRef.current;
        if (last && last.value === value && now - last.at < DUPLICATE_DEBOUNCE_MS) return;
        lastScanRef.current = { value, at: now };
        stopStream();
        void lookup(value);
      } catch {
        // Transient decode failures (e.g. frame not ready) are expected; keep scanning.
      }
    }, DETECT_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [lookup, stopStream, updateState]);

  // Camera lifecycle for the "scanning" state: start on mount, tear down on
  // unmount or when leaving the scanning flow.
  useEffect(() => {
    if (state.kind !== "scanning") return;
    let cancelled = false;
    let cancelLoop: (() => void) | undefined;
    // startScanning synchronizes with the camera (an external system); its
    // state updates are subscriptions to hardware events, not cascading renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startScanning().then((cancel) => {
      if (cancelled) cancel?.();
      else cancelLoop = cancel;
    });
    return () => {
      cancelled = true;
      cancelLoop?.();
      stopStream();
    };
  }, [state.kind, startScanning, stopStream]);

  const close = useCallback(() => {
    stopStream();
    onClose();
  }, [stopStream, onClose]);

  function handleUseThisBook(volume: NormalizedVolume) {
    onSelect(volume);
    close();
  }

  function handleScanAgain() {
    lastScanRef.current = null;
    updateState({ kind: "scanning" });
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    stopStream();
    void lookup(manualCode);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.overlayTitle}
      className="fixed inset-0 z-50 flex flex-col bg-black text-white"
    >
      <div className="flex items-center justify-between p-4">
        <h2 className="text-base font-medium">{t.overlayTitle}</h2>
        <button
          type="button"
          onClick={close}
          aria-label={t.cancel}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
        {state.kind === "scanning" ? (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none relative h-40 w-72 max-w-[80vw] rounded-lg border-4 border-teal-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
            />
            <p className="relative mt-56 px-6 text-center text-sm text-zinc-200">{t.scanHint}</p>
          </>
        ) : null}

        {state.kind === "lookingUp" ? (
          <div className="flex flex-col items-center gap-3 px-6">
            <Spinner />
            <p className="text-sm text-zinc-200">{t.lookingUp}</p>
          </div>
        ) : null}

        {state.kind === "found" ? (
          <div className="mx-6 w-full max-w-sm rounded-xl bg-white p-5 text-zinc-900">
            <div className="flex items-start gap-4">
              <BookCover
                url={state.volume.imageLinks?.thumbnail ?? state.volume.imageLinks?.smallThumbnail}
                bookTitle={state.volume.title}
                dictionary={dictionary}
                width={56}
                height={80}
              />
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{state.volume.title}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {state.volume.authors.length > 0
                    ? state.volume.authors.join(", ")
                    : t.unknownAuthor}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Button type="button" onClick={() => handleUseThisBook(state.volume)}>
                {t.useThisBook}
              </Button>
              <Button type="button" variant="secondary" onClick={handleScanAgain}>
                {t.scanAgain}
              </Button>
            </div>
          </div>
        ) : null}

        {state.kind === "notFound" ? (
          <div className="mx-6 w-full max-w-sm rounded-xl bg-white p-5 text-center text-zinc-900">
            <p>{t.notFound}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button type="button" onClick={handleScanAgain}>
                {t.scanAgain}
              </Button>
              <Button type="button" variant="secondary" onClick={close}>
                {t.cancel}
              </Button>
            </div>
          </div>
        ) : null}

        {state.kind === "lookupError" ? (
          <div className="mx-6 w-full max-w-sm rounded-xl bg-white p-5 text-center text-zinc-900">
            <p>{t.error}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button type="button" onClick={handleScanAgain}>
                {t.scanAgain}
              </Button>
              <Button type="button" variant="secondary" onClick={close}>
                {t.cancel}
              </Button>
            </div>
          </div>
        ) : null}

        {state.kind === "manual" ? (
          <form
            onSubmit={handleManualSubmit}
            className="mx-6 w-full max-w-sm rounded-xl bg-white p-5 text-zinc-900"
          >
            <p className="text-sm text-zinc-700">
              {state.reason === "denied" ? t.permissionDenied : t.cameraUnavailable}
            </p>
            <div className="mt-4">
              <Label htmlFor="manual-isbn">{t.manualLabel}</Label>
              <Input
                id="manual-isbn"
                inputMode="numeric"
                autoComplete="off"
                placeholder={t.manualPlaceholder}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Button type="submit" disabled={!manualCode.trim()}>
                {t.manualSubmit}
              </Button>
              <Button type="button" variant="secondary" onClick={close}>
                {t.cancel}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

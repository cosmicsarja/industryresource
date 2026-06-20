import { useEffect, useRef } from "react";

/**
 * AdSlot — renders a Google AdSense ad unit.
 *
 * Usage:
 *   <AdSlot slot="1234567890" format="auto" className="..." />
 *
 * For the ads to show in production:
 *   1. Replace `data-ad-client` below with your ca-pub-XXXXXXXXXXXXXXXX ID.
 *   2. Replace each `slot` prop value with the real ad unit slot ID.
 *   3. The <script> tag for AdSense is already added in the head (adsbygoogle.ts).
 *
 * In development (localhost) the ad space renders as a styled placeholder
 * so you can see the layout, but no real ad loads.
 */

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

// ─── Change this to your ca-pub-XXXXXXXXXXXXXXXX ──────────────────────────────
const AD_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";

export type AdFormat =
  | "auto"           // responsive — adapts to container width
  | "rectangle"      // 300×250 medium rectangle
  | "leaderboard"    // 728×90 horizontal banner
  | "vertical";      // 160×600 wide skyscraper

const FORMAT_SIZES: Record<AdFormat, { w: number; h: number }> = {
  auto:        { w: 0, h: 90 },   // min-height hint for placeholder
  rectangle:   { w: 300, h: 250 },
  leaderboard: { w: 728, h: 90 },
  vertical:    { w: 160, h: 600 },
};

interface AdSlotProps {
  /** Google AdSense ad-unit slot ID (numeric string) */
  slot: string;
  format?: AdFormat;
  /** Extra Tailwind classes on the wrapper */
  className?: string;
  /** Label shown on placeholder, e.g. "Advertisement" */
  label?: string;
}

export function AdSlot({
  slot,
  format = "auto",
  className = "",
  label = "Advertisement",
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (isDev) return; // don't push in dev
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // ignore duplicate push errors
    }
  }, [isDev]);

  const { w, h } = FORMAT_SIZES[format];

  if (isDev) {
    // ── Placeholder shown in development ──────────────────────────────────────
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-dashed border-border/60 bg-muted/40 text-center ${className}`}
        style={{ minHeight: h || 90, width: w || "100%" }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {label}
        </span>
        <span className="text-[9px] text-muted-foreground/40">
          Google AdSense · slot {slot}
          {w ? ` · ${w}×${h}` : " · responsive"}
        </span>
      </div>
    );
  }

  // ── Real AdSense unit in production ───────────────────────────────────────
  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: w ? `${w}px` : "100%",
          height: h ? `${h}px` : undefined,
        }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format === "auto" ? "auto" : undefined}
        data-full-width-responsive={format === "auto" ? "true" : undefined}
      />
    </div>
  );
}

// ─── Named presets for common placements ─────────────────────────────────────

/** 728×90 or responsive leaderboard — above footer on every page */
export function FooterBannerAd({ className = "" }: { className?: string }) {
  return (
    <AdSlot
      slot="1111111111"
      format="auto"
      label="Advertisement"
      className={`mx-auto w-full max-w-4xl ${className}`}
    />
  );
}

/** 300×250 rectangle — right sidebar on listing / detail pages */
export function SidebarRectAd({ className = "" }: { className?: string }) {
  return (
    <AdSlot
      slot="2222222222"
      format="rectangle"
      label="Advertisement"
      className={`w-full ${className}`}
    />
  );
}

/** 160×600 vertical — sticky right rail */
export function SidebarVerticalAd({ className = "" }: { className?: string }) {
  return (
    <AdSlot
      slot="3333333333"
      format="vertical"
      label="Advertisement"
      className={`w-full ${className}`}
    />
  );
}

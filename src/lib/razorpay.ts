/**
 * razorpay.ts
 * ─────────────────────────────────────────────────────────────────
 * Utilities for Razorpay Checkout.js integration.
 *
 * Usage:
 *   const { openCheckout } = useRazorpay();
 *   await openCheckout({ amount, orderId, prefill, onSuccess, onFailure });
 * ─────────────────────────────────────────────────────────────────
 */

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/** Dynamically loads the Razorpay Checkout.js script */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  /** Amount in paise (INR × 100) */
  amount: number;
  /** Internal order reference (e.g. Supabase order UUID) */
  orderId: string;
  /** Human-readable description shown in modal */
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onFailure?: (error: unknown) => void;
  onDismiss?: () => void;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

/**
 * Opens the Razorpay Checkout modal.
 * Loads the SDK if not already loaded.
 */
export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error("Failed to load Razorpay Checkout script. Please check your internet connection.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Razorpay = (window as any).Razorpay;
  if (!Razorpay) {
    throw new Error("Razorpay SDK not available.");
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "";

  const options = {
    key: keyId,
    amount: opts.amount,
    currency: "INR",
    name: "IndustrialBelgaum",
    description: opts.description,
    // If you have a server-side razorpay order_id, pass it here:
    // order_id: opts.razorpayOrderId,
    image: "", // logo URL if desired
    prefill: opts.prefill ?? {},
    notes: {
      supabase_order_id: opts.orderId,
      ...opts.notes,
    },
    theme: { color: "#6366f1" },
    modal: {
      ondismiss: () => {
        opts.onDismiss?.();
      },
    },
    handler: (response: RazorpayPaymentResponse) => {
      opts.onSuccess(response);
    },
  };

  const rzp = new Razorpay(options);
  rzp.on("payment.failed", (response: unknown) => {
    opts.onFailure?.(response);
  });
  rzp.open();
}

/** Formats amount in paise to display string */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

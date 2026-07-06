import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const OPENING_MESSAGES = [
  "Preparing your secure payment page...",
  "Please do not refresh or go back.",
  "Connecting to payment portal...",
  "Almost there...",
  "Redirecting you to Razorpay...",
] as const;

interface PaymentLoadingOverlayProps {
  mode: "opening" | "success";
  countdown?: number;
}

export const PaymentLoadingOverlay = ({
  mode,
  countdown = 10,
}: PaymentLoadingOverlayProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (mode !== "opening") return;

    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % OPENING_MESSAGES.length);
    }, 1500);

    return () => window.clearInterval(timer);
  }, [mode]);

  const isSuccess = mode === "success";

  return (
    <div
      className="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-hidden bg-white/95 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={isSuccess ? "Payment successful" : "Opening secure payment"}
    >
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-2xl shadow-zinc-300/60 sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime-100 text-lime-700">
          {isSuccess ? (
            <CheckCircle2 className="h-9 w-9 animate-[pulse_1.6s_ease-in-out_infinite]" />
          ) : (
            <span className="h-9 w-9 animate-spin rounded-full border-4 border-lime-200 border-t-lime-600" />
          )}
        </div>

        <h2 className="mt-6 text-xl font-bold text-zinc-950 sm:text-2xl">
          {isSuccess ? "Payment successful" : "Opening secure payment"}
        </h2>

        <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600 sm:text-base">
          {isSuccess
            ? `Redirecting to your orders page in ${countdown} second${countdown === 1 ? "" : "s"}...`
            : OPENING_MESSAGES[messageIndex]}
        </p>

        {isSuccess ? (
          <p className="mt-2 text-sm font-medium text-zinc-500">
            Please do not close this page.
          </p>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-2" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-2.5 w-2.5 animate-bounce rounded-full bg-lime-500"
                style={{ animationDelay: `${dot * 140}ms` }}
              />
            ))}
          </div>
        )}

        <div className="mt-7 flex items-center justify-center gap-2 border-t border-zinc-100 pt-5 text-xs font-medium text-zinc-500">
          <ShieldCheck className="h-4 w-4 text-lime-600" />
          Secure payment powered by Razorpay
        </div>
      </div>
    </div>
  );
};

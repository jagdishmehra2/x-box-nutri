import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, QrCode, Smartphone, Copy, Check, ArrowRight, ShieldCheck, Hash } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  buildStandardUpiUrl,
  UPI_APPS,
  type UpiPaymentDetails,
  type UpiApp,
} from "../../utils/upi";
import { formatCurrency } from "../../utils/currency";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  transactionRef: string;
  vpa?: string;
  payeeName?: string;
  onConfirmPayment: (utr: string) => Promise<void>;
  isProcessing?: boolean;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  transactionRef,
  vpa = "nutristack@upi",
  payeeName = "NutriStack Health & Fitness",
  onConfirmPayment,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState<"intent" | "qr">("intent");
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");

  if (!isOpen) return null;

  const upiDetails: UpiPaymentDetails = {
    vpa,
    payeeName,
    amount,
    transactionRef,
    transactionNote: `Order #${transactionRef.slice(0, 8)}`,
  };

  const standardUpiUrl = buildStandardUpiUrl(upiDetails);

  const handleLaunchUpiApp = (appId: UpiApp) => {
    let targetUrl = standardUpiUrl;

    if (appId !== "generic") {
      const app = UPI_APPS.find((a) => a.id === appId);
      if (app) {
        targetUrl = app.getUri(upiDetails);
      }
    }

    window.location.href = targetUrl;
    toast.success("Opening UPI app... Copy UTR/Ref No. after payment.", {
      icon: "📱",
    });
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();

    if (!cleanUtr) {
      setUtrError("Please enter 12-digit UTR / UPI Ref No.");
      return;
    }

    if (cleanUtr.length < 12) {
      setUtrError("UTR / Transaction Ref No. must be 12 digits.");
      return;
    }

    setUtrError("");
    onConfirmPayment(cleanUtr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header & Total Amount */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Direct NPCI UPI Checkout
          </div>

          <h2 className="mt-3 text-sm font-medium tracking-wide uppercase text-zinc-400">
            PAY
          </h2>
          <div className="text-4xl font-extrabold text-white tracking-tight">
            {formatCurrency(amount)}
          </div>
        </div>

        {/* Tab Selector: Intent vs QR */}
        <div className="mt-6 flex rounded-xl bg-zinc-900 p-1 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab("intent")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
              activeTab === "intent"
                ? "bg-lime-400 text-zinc-950 font-semibold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smartphone className="h-4 w-4" /> Pay with UPI App
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
              activeTab === "qr"
                ? "bg-lime-400 text-zinc-950 font-semibold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <QrCode className="h-4 w-4" /> Scan QR
          </button>
        </div>

        {/* Intent View */}
        {activeTab === "intent" && (
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => handleLaunchUpiApp("generic")}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 p-4 font-semibold text-zinc-950 transition transform active:scale-98 hover:brightness-105 shadow-lg shadow-lime-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-lime-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold leading-tight">Pay with UPI</p>
                  <p className="text-xs text-zinc-900 font-medium">Open installed UPI app</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Popular Apps Direct Launch */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-3 text-center uppercase tracking-wider">
                Google Pay / PhonePe / BHIM / Paytm
              </p>
              <div className="grid grid-cols-4 gap-2">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleLaunchUpiApp(app.id)}
                    className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 transition hover:border-lime-400/50 hover:bg-zinc-800 group"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-xs shadow ${app.iconBg}`}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <span className="mt-2 text-[11px] font-medium text-zinc-300 group-hover:text-white">
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <span className="relative bg-zinc-950 px-3 text-xs text-zinc-500 uppercase tracking-widest font-medium">
                ────── OR ──────
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition"
            >
              <QrCode className="h-4 w-4 text-lime-400" /> Switch to QR Code
            </button>
          </div>
        )}

        {/* QR Code View */}
        {activeTab === "qr" && (
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="rounded-2xl bg-white p-4 shadow-xl border border-zinc-200">
              <QRCodeSVG
                value={standardUpiUrl}
                size={190}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Scan with any UPI app (GPay, PhonePe, Paytm, BHIM)
            </p>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-300">
              <span>UPI ID: <strong className="text-white">{vpa}</strong></span>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="ml-1 rounded p-1 hover:bg-zinc-800 text-lime-400"
                title="Copy VPA"
              >
                {copiedVpa ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Mandatory UTR / Transaction Ref No input */}
        <form onSubmit={handleSubmit} className="mt-5 pt-4 border-t border-zinc-800/80">
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5 text-lime-400" /> Enter 12-Digit UTR / Ref No.
            </span>
            <span className="text-[10px] text-zinc-500 font-normal">Required after payment</span>
          </label>
          
          <input
            type="text"
            maxLength={18}
            placeholder="e.g. 423456789012"
            value={utrNumber}
            onChange={(e) => {
              setUtrNumber(e.target.value);
              if (utrError) setUtrError("");
            }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none"
          />

          {utrError && (
            <p className="mt-1 text-xs text-red-400 font-medium">{utrError}</p>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="mt-3 w-full rounded-xl bg-lime-400 py-3.5 font-semibold text-zinc-950 transition hover:bg-lime-300 active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? "Submitting Order..." : "Submit UTR & Confirm Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

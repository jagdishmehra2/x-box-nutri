export interface UpiPaymentDetails {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionRef: string;
  transactionNote?: string;
  mc?: string;
}

/**
 * Builds standard NPCI compliant UPI Deep Link URI
 * Format: upi://pay?pa=...&pn=...&am=...&tr=...&tn=...&cu=INR
 */
export const buildStandardUpiUrl = (details: UpiPaymentDetails): string => {
  const { vpa, payeeName, amount, transactionRef, transactionNote, mc } = details;

  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tr: transactionRef,
    tn: transactionNote || `Payment for order #${transactionRef.slice(0, 8)}`,
  });

  if (mc) {
    params.append("mc", mc);
  }

  return `upi://pay?${params.toString()}`;
};

export type UpiApp = "generic" | "gpay" | "phonepe" | "paytm" | "bhim";

export interface UpiAppOption {
  id: UpiApp;
  name: string;
  iconBg: string;
  getUri: (details: UpiPaymentDetails) => string;
}

export const UPI_APPS: UpiAppOption[] = [
  {
    id: "gpay",
    name: "Google Pay",
    iconBg: "bg-blue-600",
    getUri: (details) => {
      const standard = buildStandardUpiUrl(details);
      return standard.replace("upi://pay", "tez://upi/pay");
    },
  },
  {
    id: "phonepe",
    name: "PhonePe",
    iconBg: "bg-purple-600",
    getUri: (details) => {
      const standard = buildStandardUpiUrl(details);
      return standard.replace("upi://pay", "phonepe://pay");
    },
  },
  {
    id: "paytm",
    name: "Paytm",
    iconBg: "bg-sky-500",
    getUri: (details) => {
      const standard = buildStandardUpiUrl(details);
      return standard.replace("upi://pay", "paytmmp://pay");
    },
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    iconBg: "bg-orange-600",
    getUri: (details) => {
      const standard = buildStandardUpiUrl(details);
      return standard.replace("upi://pay", "bhim://pay");
    },
  },
];

import QRCode from "qrcode";

export async function generateUpiQrDataUrl(params: {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
}): Promise<string> {
  const { payeeVpa, payeeName, amount, transactionNote } = params;
  
  // Standard NPCI UPI URI Format
  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount.toFixed(2)}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;

  try {
    return await QRCode.toDataURL(upiUri, {
      width: 180,
      margin: 1,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate UPI QR code:", err);
    return "";
  }
}

import QRCode from "qrcode";

export async function generateQRCode(value: string) {
    try {
        const qr = await QRCode.toDataURL(value, {
            errorCorrectionLevel: "H",
            type: "image/png",
            width: 300,
            margin: 1,
        });

        return qr;

    } catch (error) {
        console.error("QR Code error:", error);
        return "";
    }
}
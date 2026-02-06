import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MIME_BY_EXT: Record<string, string> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
};

/**
 * Fetch or read image and return buffer + content-type.
 */
async function getImageBuffer(
	url: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
	try {
		if (url.startsWith("http://") || url.startsWith("https://")) {
			const res = await fetch(url);
			if (!res.ok) return null;
			const buffer = Buffer.from(await res.arrayBuffer());
			const contentType = (res.headers.get("content-type") || "image/png").split(";")[0].trim();
			return { buffer, contentType };
		}
		const cleanPath = url.startsWith("/") ? url.slice(1) : url;
		const filePath = path.join(process.cwd(), "public", cleanPath);
		const buffer = await readFile(filePath);
		const ext = path.extname(filePath).toLowerCase();
		const mime = MIME_BY_EXT[ext] || "image/png";
		return { buffer, contentType: mime };
	} catch {
		return null;
	}
}

/**
 * Resolve gym logo URL to a base64 data URL for embedding in PDFs.
 * Works with relative paths (e.g. /uploads/gym/...) and absolute URLs.
 */
export async function getLogoAsDataUrl(logoUrl: string): Promise<string | null> {
	const result = await getImageBuffer(logoUrl);
	if (!result) return null;
	const { buffer, contentType } = result;
	return `data:${contentType};base64,${buffer.toString("base64")}`;
}

/**
 * Watermark image as data URL for PDF. Transparent PNGs are flattened onto white
 * and converted to JPEG so they render visibly in jsPDF (which does not handle
 * PNG alpha well). Other formats are returned as-is.
 */
export async function getWatermarkAsDataUrlForPdf(
	watermarkUrl: string
): Promise<string | null> {
	const result = await getImageBuffer(watermarkUrl);
	if (!result) return null;
	const { buffer, contentType } = result;
	const isPng =
		contentType === "image/png" ||
		watermarkUrl.split("?")[0].toLowerCase().endsWith(".png");
	try {
		if (isPng) {
			const jpegBuffer = await sharp(buffer)
				.flatten({ background: { r: 255, g: 255, b: 255 } })
				.jpeg({ quality: 92 })
				.toBuffer();
			return `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;
		}
	} catch {
		// If sharp fails, fall back to original image (may not show in PDF if PNG with alpha)
	}
	return `data:${contentType};base64,${buffer.toString("base64")}`;
}

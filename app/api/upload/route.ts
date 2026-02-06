import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await req.formData();
	const file = formData.get("file") as File;

	if (!file || !(file instanceof File)) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	if (file.size > MAX_SIZE) {
		return NextResponse.json(
			{ error: "File too large. Max 5MB." },
			{ status: 400 }
		);
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return NextResponse.json(
			{ error: "Invalid type. Use JPEG, PNG, WebP or GIF." },
			{ status: 400 }
		);
	}

	const safeName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
	// Optional folder: "promotions" (default) or "gym" for gym logo
	const folder = (formData.get("folder") as string) || "promotions";
	const allowedFolders = ["promotions", "gym", "watermark"];
	const targetFolder = allowedFolders.includes(folder) ? folder : "promotions";

	try {
		// Use Vercel Blob when token is set (e.g. production / preview)
		if (process.env.BLOB_READ_WRITE_TOKEN) {
			const blob = await put(`${targetFolder}/${safeName}`, file, {
				access: "public",
				contentType: file.type,
			});
			return NextResponse.json({ url: blob.url });
		}

		// Fallback: local storage when BLOB_READ_WRITE_TOKEN is not set (e.g. local dev)
		const uploadDir = path.join(process.cwd(), "public", "uploads", targetFolder);
		await mkdir(uploadDir, { recursive: true });
		const filePath = path.join(uploadDir, safeName);
		const bytes = await file.arrayBuffer();
		await writeFile(filePath, Buffer.from(bytes));
		const url = `/uploads/${targetFolder}/${safeName}`;
		return NextResponse.json({ url });
	} catch (err) {
		console.error("Upload error:", err);
		return NextResponse.json(
			{ error: "Upload failed" },
			{ status: 500 }
		);
	}
}

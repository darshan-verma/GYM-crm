/* global process */
/* eslint-disable no-undef, no-unused-vars */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	console.log("Creating admin user...");

	const hashedPassword = await bcrypt.hash("admin123", 10);

	const _admin = await prisma.user.create({
		data: {
			email: "admin@probodyline.com",
			password: hashedPassword,
			name: "Admin User",
			role: "ADMIN",
		},
	});

	console.log("✓ Admin user created successfully!");
	console.log("Email: admin@probodyline.com");
	console.log("Password: admin123");
}

main()
	.catch((e) => {
		console.error("Error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

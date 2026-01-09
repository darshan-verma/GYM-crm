/* global process */
/* eslint-disable no-undef, no-unused-vars */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	console.log("Creating admin user...");

	const hashedPassword = await bcrypt.hash("admin123", 10);

	try {
		const admin = await prisma.user.create({
			data: {
				email: "admin@probodyline.com",
				password: hashedPassword,
				name: "Super Admin",
				role: "SUPER_ADMIN",
			},
		});

		console.log("✓ Admin user created successfully!");
		console.log("Email: admin@probodyline.com");
		console.log("Password: admin123");
		console.log("Role: SUPER_ADMIN");
	} catch (error) {
		if (error.code === "P2002") {
			console.log("✓ Admin user already exists!");
			console.log("Email: admin@probodyline.com");
			console.log("Password: admin123");
			console.log("Role: SUPER_ADMIN");
		} else {
			throw error;
		}
	}
}

main()
	.catch((e) => {
		console.error("Error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

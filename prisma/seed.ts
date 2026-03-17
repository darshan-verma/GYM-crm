import { PrismaClient, Payment } from "@prisma/client";
import { hash } from "bcryptjs";
import { getDefaultPermissionsForRole } from "@/lib/utils/permissions";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting seed...");

	// Create Gym Profile
	const existingGym = await prisma.gymProfile.findFirst({
		where: { name: "Pro Bodyline Fitness" },
	});
	const gym =
		existingGym ??
		(await prisma.gymProfile.create({
			data: {
				name: "Pro Bodyline Fitness",
				email: "admin@probodyline.com",
				phone: "9876543210",
				address: "Mumbai, Maharashtra",
			},
		}));
	console.log("✅ Created gym profile:", gym.name);

	// Create Super Admin User (default login)
	const adminPassword = await hash("admin123", 10);
	const superAdminPermissions = getDefaultPermissionsForRole("SUPER_ADMIN");
	const admin = await prisma.user.upsert({
		where: { email: "admin@probodyline.com" },
		update: {
			gymProfileId: gym.id,
			role: "SUPER_ADMIN",
			permissions: superAdminPermissions,
			active: true,
			name: "Super Admin",
		},
		create: {
			email: "admin@probodyline.com",
			password: adminPassword,
			name: "Super Admin",
			role: "SUPER_ADMIN",
			permissions: superAdminPermissions,
			phone: "9876543210",
			active: true,
			gymProfileId: gym.id,
		},
	});
	console.log("✅ Created super admin user:", admin.email);

	// Create Trainer
	const trainerPassword = await hash("trainer123", 10);
	const trainer = await prisma.user.upsert({
		where: { email: "trainer@probodyline.com" },
		update: { gymProfileId: gym.id },
		create: {
			email: "trainer@probodyline.com",
			password: trainerPassword,
			name: "John Trainer",
			role: "TRAINER",
			phone: "9876543211",
			active: true,
			gymProfileId: gym.id,
		},
	});
	console.log("✅ Created trainer user:", trainer.email);

	// Create Membership Plans (idempotent: use findFirst + create so seed can be re-run)
	const planSpecs = [
		{
			name: "Monthly Basic",
			description: "Basic gym access for 1 month",
			duration: 30,
			price: 1500,
			features: JSON.parse('["Gym Access", "Locker"]'),
			color: "#3b82f6",
			popular: false,
			sortOrder: 1,
		},
		{
			name: "Quarterly Pro",
			description: "Pro membership for 3 months with trainer",
			duration: 90,
			price: 4000,
			features: JSON.parse(
				'["Gym Access", "Locker", "Personal Trainer", "Diet Plan"]'
			),
			color: "#10b981",
			popular: true,
			sortOrder: 2,
		},
		{
			name: "Annual Elite",
			description: "Premium membership for 1 year",
			duration: 365,
			price: 15000,
			features: JSON.parse(
				'["Gym Access", "Locker", "Personal Trainer", "Diet Plan", "Supplement Guidance", "Priority Support"]'
			),
			color: "#f59e0b",
			popular: false,
			sortOrder: 3,
		},
	];
	const plans = [];
	for (const spec of planSpecs) {
		const existing = await prisma.membershipPlan.findFirst({
			where: { gymProfileId: gym.id, name: spec.name },
		});
		const plan =
			existing ??
			(await prisma.membershipPlan.create({
				data: {
					gymProfileId: gym.id,
					...spec,
					active: true,
				},
			}));
		plans.push(plan);
	}
	console.log("✅ Created", plans.length, "membership plans");

	// Create Sample Members (upsert so seed can be re-run without unique constraint errors)
	const members = [];
	for (let i = 1; i <= 10; i++) {
		const membershipNumber = `PBF${String(1000 + i).padStart(4, "0")}`;
		const member = await prisma.member.upsert({
			where: { membershipNumber },
			update: {
				gymProfileId: gym.id,
				name: `Member ${i}`,
				email: `member${i}@example.com`,
				phone: `98765432${String(i).padStart(2, "0")}`,
				address: `Street ${i}, City`,
				city: "Mumbai",
				state: "Maharashtra",
				pincode: "400001",
				gender: i % 2 === 0 ? "Male" : "Female",
				status: i <= 7 ? "ACTIVE" : "PENDING",
				trainerId: i % 3 === 0 ? trainer.id : null,
				joiningDate: new Date(2024, 0, i),
			},
			create: {
				gymProfileId: gym.id,
				membershipNumber,
				name: `Member ${i}`,
				email: `member${i}@example.com`,
				phone: `98765432${String(i).padStart(2, "0")}`,
				address: `Street ${i}, City`,
				city: "Mumbai",
				state: "Maharashtra",
				pincode: "400001",
				gender: i % 2 === 0 ? "Male" : "Female",
				status: i <= 7 ? "ACTIVE" : "PENDING",
				trainerId: i % 3 === 0 ? trainer.id : null,
				joiningDate: new Date(2024, 0, i),
			},
		});
		members.push(member);
	}
	console.log("✅ Created", members.length, "members");

	// Create Memberships for Active Members (idempotent: skip if already exists)
	const activeMembersMemberships = [];
	for (let i = 0; i < 7; i++) {
		const member = members[i];
		const plan = plans[i % plans.length];
		const startDate = new Date(2024, 10, 1);
		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + plan.duration);

		const existing = await prisma.membership.findFirst({
			where: {
				gymProfileId: gym.id,
				memberId: member.id,
				planId: plan.id,
			},
		});
		if (existing) {
			activeMembersMemberships.push(existing);
			continue;
		}
		const membership = await prisma.membership.create({
			data: {
				gymProfileId: gym.id,
				memberId: member.id,
				planId: plan.id,
				startDate,
				endDate,
				amount: plan.price,
				finalAmount: plan.price,
				active: true,
			},
		});
		activeMembersMemberships.push(membership);
	}
	console.log(
		"✅ Created",
		activeMembersMemberships.length,
		"active memberships"
	);

	// Create Sample Payments (idempotent: skip if seed payment already exists)
	const payments: Payment[] = [];
	const paymentModes = ["CASH", "ONLINE", "UPI", "CARD"] as const;
	for (let idx = 0; idx < activeMembersMemberships.length; idx++) {
		const membership = activeMembersMemberships[idx];
		const invoiceNumber = `INV-SEED-${String(idx + 1).padStart(3, "0")}`;
		const existing = await prisma.payment.findFirst({
			where: { invoiceNumber },
		});
		if (existing) {
			payments.push(existing);
			continue;
		}
		const payment = await prisma.payment.create({
			data: {
				gymProfileId: gym.id,
				memberId: membership.memberId,
				amount: membership.finalAmount,
				paymentMode: paymentModes[idx % 4],
				paymentDate: membership.startDate,
				invoiceNumber,
				createdBy: admin.id,
			},
		});
		payments.push(payment);
	}
	console.log("✅ Created", payments.length, "payments");

	// Create Sample Attendance Records
	const attendanceRecords = [];
	const last7Days = Array.from({ length: 7 }, (_, i) => {
		const date = new Date();
		date.setDate(date.getDate() - i);
		date.setHours(0, 0, 0, 0);
		return date;
	});

	for (const date of last7Days) {
		for (let i = 0; i < 5; i++) {
			const member = members[i];
			const checkIn = new Date(date);
			checkIn.setHours(
				8 + Math.floor(Math.random() * 10),
				Math.floor(Math.random() * 60)
			);

			const checkOut = new Date(checkIn);
			checkOut.setHours(checkIn.getHours() + 1 + Math.floor(Math.random() * 2));

			const duration = Math.floor(
				(checkOut.getTime() - checkIn.getTime()) / (1000 * 60)
			);

			try {
				const attendance = await prisma.attendance.create({
					data: {
						gymProfileId: gym.id,
						memberId: member.id,
						checkIn,
						checkOut,
						date,
						duration,
					},
				});
				attendanceRecords.push(attendance);
			} catch (_e) {
				// Skip if already exists
			}
		}
	}
	console.log("✅ Created", attendanceRecords.length, "attendance records");

	// Create Sample Leads (always ensure 15 seed leads: remove old seed leads then create)
	const leadSources = [
		"WALK_IN",
		"PHONE_CALL",
		"WEBSITE",
		"SOCIAL_MEDIA",
		"REFERRAL",
	];
	const leadStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "CONVERTED", "LOST"];
	const seedLeadEmails = Array.from({ length: 15 }, (_, i) => `lead${i + 1}@example.com`);
	await prisma.lead.deleteMany({
		where: {
			gymProfileId: gym.id,
			email: { in: seedLeadEmails },
		},
	});
	const leads = [];
	for (let i = 1; i <= 15; i++) {
		const lead = await prisma.lead.create({
			data: {
				gymProfileId: gym.id,
				name: `Lead ${i}`,
				phone: `91234567${String(i).padStart(2, "0")}`,
				email: `lead${i}@example.com`,
				source: leadSources[i % leadSources.length] as
					| "WALK_IN"
					| "PHONE_CALL"
					| "WEBSITE"
					| "SOCIAL_MEDIA"
					| "REFERRAL",
				status: leadStatuses[i % leadStatuses.length] as
					| "NEW"
					| "CONTACTED"
					| "FOLLOW_UP"
					| "CONVERTED"
					| "LOST",
				interestedPlan: plans[i % plans.length].name,
				budget: [1500, 4000, 15000][i % 3],
				assignedTo: admin.id,
				notes: `Interested in ${plans[i % plans.length].name}`,
				createdAt: new Date(2024, 10, i),
			},
		});
		leads.push(lead);
	}
	console.log("✅ Created", leads.length, "leads");

	console.log("✨ Seed completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Error during seed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createUser } from "@/lib/actions/users";

export function StaffForm() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		role: "RECEPTIONIST" as "ADMIN" | "TRAINER" | "RECEPTIONIST",
		phone: "",
		password: "",
		confirmPassword: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validate passwords
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			setLoading(false);
			return;
		}

		const result = await createUser({
			name: formData.name,
			email: formData.email,
			role: formData.role,
			phone: formData.phone || undefined,
			password: formData.password,
		});

		if (result.success) {
			router.push("/staff");
			router.refresh();
		} else {
			setError(result.error || "Something went wrong");
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
					{error}
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="name">Full Name *</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, name: e.target.value }))
					}
					placeholder="John Doe"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email *</Label>
				<Input
					id="email"
					type="email"
					value={formData.email}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, email: e.target.value }))
					}
					placeholder="john@example.com"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="phone">Phone</Label>
				<Input
					id="phone"
					type="tel"
					value={formData.phone}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, phone: e.target.value }))
					}
					placeholder="+1234567890"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="role">Role *</Label>
				<Select
					value={formData.role}
					onValueChange={(value) =>
						setFormData((prev) => ({
							...prev,
							role: value as "ADMIN" | "TRAINER" | "RECEPTIONIST",
						}))
					}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ADMIN">Admin</SelectItem>
						<SelectItem value="TRAINER">Trainer</SelectItem>
						<SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
					</SelectContent>
				</Select>
				<p className="text-sm text-gray-500">
					{formData.role === "ADMIN" && "Full access to all features"}
					{formData.role === "TRAINER" &&
						"Can manage members, workouts, and attendance"}
					{formData.role === "RECEPTIONIST" &&
						"Can manage members, attendance, and payments"}
				</p>
			</div>

			<div className="border-t pt-4">
				<h3 className="text-lg font-medium mb-4">Password *</h3>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password">Password *</Label>
						<Input
							id="password"
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, password: e.target.value }))
							}
							placeholder="••••••••"
							required
							minLength={6}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password *</Label>
						<Input
							id="confirmPassword"
							type="password"
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									confirmPassword: e.target.value,
								}))
							}
							placeholder="••••••••"
							required
							minLength={6}
						/>
					</div>
				</div>
			</div>

			<div className="flex gap-3 pt-4">
				<Button type="submit" disabled={loading}>
					{loading ? "Saving..." : "Create User"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/staff")}
					disabled={loading}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}

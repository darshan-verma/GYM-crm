"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dumbbell, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				toast.error("Login Failed", {
					description: "Invalid email or password",
				});
			} else {
				toast.success("Login Successful", {
					description: "Welcome back!",
				});
				router.push("/");
				router.refresh();
			}
		} catch (_error) {
			toast.error("Error", {
				description: "Something went wrong",
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
			<div className="w-full max-w-md">
				{/* Logo & Branding */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 mb-4 shadow-lg">
						<Dumbbell className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
						Pro Bodyline Fitness
					</h1>
					<p className="text-muted-foreground mt-2">CRM Management System</p>
				</div>

				{/* Login Card */}
				<Card className="border-0 shadow-xl">
					<CardHeader>
						<CardTitle>Welcome Back</CardTitle>
						<CardDescription>
							Sign in to your account to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="admin@probodyline.com"
									required
									disabled={loading}
									className="h-11"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="••••••••"
									required
									disabled={loading}
									className="h-11"
								/>
							</div>

							<Button
								type="submit"
								className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Signing in...
									</>
								) : (
									"Sign In"
								)}
							</Button>
						</form>

						<div className="mt-6 text-center text-sm text-muted-foreground">
							<p>Demo Credentials:</p>
							<p className="font-mono text-xs mt-1">
								admin@probodyline.com / admin123
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<p className="text-center text-sm text-muted-foreground mt-8">
					© 2025 Pro Bodyline Fitness. All rights reserved.
				</p>
			</div>
		</div>
	);
}

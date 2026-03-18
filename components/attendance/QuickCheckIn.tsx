"use client";

import { useEffect, useRef, useState } from "react";
import { quickCheckIn } from "@/lib/actions/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Scan } from "lucide-react";

export default function QuickCheckIn() {
	const [membershipNumber, setMembershipNumber] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [queuedCount, setQueuedCount] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const queueRef = useRef<string[]>([]);
	const processingRef = useRef(false);

	useEffect(() => {
		setQueuedCount(queueRef.current.length);
	}, []);

	const startProcessorIfNeeded = async () => {
		if (processingRef.current) return;
		processingRef.current = true;
		setIsProcessing(true);

		try {
			while (queueRef.current.length > 0) {
				const next = queueRef.current.shift();
				setQueuedCount(queueRef.current.length);
				if (!next) continue;

				try {
					const result = await quickCheckIn(next);
					if (result.success) {
						toast.success("Check-In Successful", {
							description: `Member ${next} checked in at ${new Date().toLocaleTimeString()}`,
						});
					} else {
						toast.error("Check-In Failed", {
							description: result.error,
						});
					}
				} catch (_error) {
					toast.error("Error", {
						description: `Failed to check in ${next}`,
					});
				}
			}
		} finally {
			processingRef.current = false;
			setIsProcessing(false);
			setQueuedCount(queueRef.current.length);
		}
	};

	async function handleCheckIn(e: React.FormEvent) {
		e.preventDefault();
		const next = membershipNumber.trim().toUpperCase();
		if (!next) return;

		// Optimistic: clear immediately so scanning can continue.
		setMembershipNumber("");
		inputRef.current?.focus();

		queueRef.current.push(next);
		setQueuedCount(queueRef.current.length);
		void startProcessorIfNeeded();
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-blue-100">
						<Scan className="w-5 h-5 text-blue-600" />
					</div>
					<div>
						<CardTitle>Quick Check-In</CardTitle>
						<CardDescription>Scan or enter membership number</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleCheckIn} className="space-y-4">
					<div
						className={[
							"flex gap-2",
							isProcessing ? "opacity-90" : "",
						].join(" ")}
					>
						<Input
							ref={inputRef}
							type="text"
							placeholder="Enter membership number (e.g., PBF1001)"
							value={membershipNumber}
							onChange={(e) =>
								setMembershipNumber(e.target.value.toUpperCase())
							}
							className="flex-1 text-lg"
							autoFocus
						/>
						<Button
							type="submit"
							disabled={!membershipNumber.trim()}
							className="bg-gradient-to-r from-green-600 to-green-700"
						>
							{isProcessing ? (
								<span className="inline-flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
									Processing
									{queuedCount > 0 ? ` (${queuedCount})` : ""}
								</span>
							) : queuedCount > 0 ? (
								<span>Queued ({queuedCount})</span>
							) : (
								"Check In"
							)}
						</Button>
					</div>

					<div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
						<p>💡 Tip: Use a barcode scanner for faster check-ins</p>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

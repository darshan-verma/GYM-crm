"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateLeadStatus } from "@/lib/actions/leads";
import { toast } from "sonner";
import { LeadStatus } from "@prisma/client";

interface ConvertLeadDialogProps {
	leadId: string;
	leadName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function ConvertLeadDialog({
	leadId,
	leadName,
	open,
	onOpenChange,
}: ConvertLeadDialogProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleConfirm() {
		setLoading(true);
		try {
			// Update lead status to CONVERTED
			const result = await updateLeadStatus(leadId, "CONVERTED" as LeadStatus);
			
			if (result.success) {
				toast.success("Lead converted successfully");
				onOpenChange(false);
				// Navigate to add member form with lead data
				router.push(`/members/new?leadId=${leadId}`);
			} else {
				toast.error(result.error || "Failed to convert lead");
			}
		} catch (_error) {
			toast.error("Failed to convert lead");
		} finally {
			setLoading(false);
		}
	}

	async function handleCancel() {
		setLoading(true);
		try {
			// Update lead status to LOST
			const result = await updateLeadStatus(leadId, "LOST" as LeadStatus);
			
			if (result.success) {
				toast.success("Lead marked as lost");
				onOpenChange(false);
				router.refresh();
			} else {
				toast.error(result.error || "Failed to update lead");
				setLoading(false);
			}
		} catch (_error) {
			toast.error("Failed to update lead");
			setLoading(false);
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={(newOpen) => {
			// Prevent closing while loading
			if (!loading) {
				onOpenChange(newOpen);
			}
		}}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Convert Lead to Member?</AlertDialogTitle>
					<AlertDialogDescription>
						Do you want to add <strong>{leadName}</strong> as a member? If you
						confirm, you will be redirected to the add member form with their
						details pre-filled. If you select no, the lead will be marked as lost.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleCancel} disabled={loading}>
						No
					</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm} disabled={loading}>
						{loading ? "Processing..." : "Yes, Add Member"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

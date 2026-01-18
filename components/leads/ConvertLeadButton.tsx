"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import ConvertLeadDialog from "./ConvertLeadDialog";

interface ConvertLeadButtonProps {
	leadId: string;
	leadName: string;
}

export default function ConvertLeadButton({
	leadId,
	leadName,
}: ConvertLeadButtonProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				variant="outline"
				className="w-full"
				onClick={() => setOpen(true)}
			>
				<User className="w-4 h-4 mr-2" />
				Convert to Member
			</Button>
			<ConvertLeadDialog
				leadId={leadId}
				leadName={leadName}
				open={open}
				onOpenChange={setOpen}
			/>
		</>
	);
}

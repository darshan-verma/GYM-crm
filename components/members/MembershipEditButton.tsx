"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import EditMembershipDialog from "./EditMembershipDialog";

interface MembershipEditButtonProps {
	membership: {
		id: string;
		memberId: string;
		planId: string;
		startDate: Date | string;
		endDate: Date | string;
		amount: number;
		discount?: number;
		discountType?: string;
		finalAmount: number;
		notes?: string;
		plan: {
			id: string;
			name: string;
			price: number;
			duration: number;
		};
	};
}

export default function MembershipEditButton({
	membership,
}: MembershipEditButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
				<Edit className="w-4 h-4 mr-2" />
				Edit Plan
			</Button>
			<EditMembershipDialog
				membership={membership}
				open={isOpen}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
}

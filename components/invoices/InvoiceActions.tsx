"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, Printer } from "lucide-react";

interface InvoiceActionsProps {
	invoiceId: string;
}

export function InvoiceActions({ invoiceId }: InvoiceActionsProps) {
	const handlePrint = () => {
		window.print();
	};

	return (
		<div className="flex gap-2">
			<Button variant="outline" onClick={handlePrint}>
				<Printer className="h-4 w-4 mr-2" />
				Print
			</Button>
			<Link href={`/api/invoices/${invoiceId}/download`} target="_blank">
				<Button>
					<Download className="h-4 w-4 mr-2" />
					Download PDF
				</Button>
			</Link>
		</div>
	);
}

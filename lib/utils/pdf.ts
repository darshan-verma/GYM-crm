import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceData {
	invoiceNumber: string;
	paymentDate: Date;
	memberName: string;
	memberEmail?: string;
	memberPhone: string;
	amount: number;
	paymentMode: string;
	transactionId?: string;
	planName?: string;
	planDuration?: string;
	startDate?: Date;
	endDate?: Date;
	discount?: number;
	notes?: string;
	gstNumber?: string;
	gstPercentage?: number;
	gstAmount?: number;
}

export function generateInvoicePDF(data: InvoiceData) {
	const doc = new jsPDF();

	// Set font
	doc.setFont("helvetica");

	// Header - Company Logo and Name
	doc.setFontSize(24);
	doc.setTextColor(37, 99, 235); // Blue color
	doc.text("Pro Bodyline Fitness", 20, 20);

	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Complete Gym Management System", 20, 27);
	doc.text("Email: info@probodyline.com | Phone: +91 9876543210", 20, 32);
	doc.text("Address: 123 Fitness Street, Gym City, GC 12345", 20, 37);

	// Draw line
	doc.setDrawColor(200, 200, 200);
	doc.line(20, 42, 190, 42);

	// Invoice Title
	doc.setFontSize(20);
	doc.setTextColor(0, 0, 0);
	doc.text("PAYMENT RECEIPT", 105, 55, { align: "center" });

	// Invoice Details - Right side
	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Invoice Number:", 140, 70);
	doc.setTextColor(0, 0, 0);
	doc.text(data.invoiceNumber, 140, 75);

	doc.setTextColor(100, 100, 100);
	doc.text("Payment Date:", 140, 82);
	doc.setTextColor(0, 0, 0);
	doc.text(new Date(data.paymentDate).toLocaleDateString("en-IN"), 140, 87);

	// Member Details - Left side
	doc.setFontSize(12);
	doc.setTextColor(37, 99, 235);
	doc.text("Bill To:", 20, 70);

	doc.setFontSize(10);
	doc.setTextColor(0, 0, 0);
	doc.text(data.memberName, 20, 77);
	if (data.memberEmail) {
		doc.text(data.memberEmail, 20, 82);
	}
	doc.text(data.memberPhone, 20, data.memberEmail ? 87 : 82);

	// Payment Details Table
	const tableStartY = 100;

	const paymentDetails: (string | number)[][] = [];

	if (data.planName) {
		paymentDetails.push(["Membership Plan", data.planName]);
	}

	if (data.planDuration) {
		paymentDetails.push(["Plan Duration", data.planDuration]);
	}

	if (data.startDate && data.endDate) {
		paymentDetails.push([
			"Membership Period",
			`${new Date(data.startDate).toLocaleDateString("en-IN")} - ${new Date(
				data.endDate
			).toLocaleDateString("en-IN")}`,
		]);
	}

	paymentDetails.push(["Payment Mode", data.paymentMode]);

	if (data.transactionId) {
		paymentDetails.push(["Transaction ID", data.transactionId]);
	}

	if (data.gstNumber) {
		paymentDetails.push(["GST Number", data.gstNumber]);
	}

	if (data.gstPercentage) {
		paymentDetails.push(["GST Percentage", `${data.gstPercentage}%`]);
	}

	autoTable(doc, {
		startY: tableStartY,
		head: [["Description", "Details"]],
		body: paymentDetails,
		theme: "striped",
		headStyles: {
			fillColor: [37, 99, 235],
			textColor: 255,
			fontSize: 11,
			fontStyle: "bold",
		},
		styles: {
			fontSize: 10,
			cellPadding: 5,
		},
		columnStyles: {
			0: { cellWidth: 70, fontStyle: "bold" },
			1: { cellWidth: "auto" },
		},
	});

	// Amount Details Table
	const amountTableY =
		(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
			.finalY + 10;

	const amountDetails: (string | number)[][] = [];
	const baseAmount = data.discount ? data.amount + data.discount : data.amount;

	if (data.discount) {
		amountDetails.push(["Membership Amount", `₹${baseAmount.toFixed(2)}`]);
		amountDetails.push(["Discount", `-₹${data.discount.toFixed(2)}`]);
	}
	// Add GST breakdown if GST is applied
	if (data.gstAmount && data.gstAmount > 0) {
		const subtotal = data.amount - data.gstAmount;
		amountDetails.push(["Subtotal", `₹${subtotal.toFixed(2)}`]);
		amountDetails.push(["GST Amount", `₹${data.gstAmount.toFixed(2)}`]);
	}
	amountDetails.push(["Total Amount Paid", `₹${data.amount.toFixed(2)}`]);

	autoTable(doc, {
		startY: amountTableY,
		body: amountDetails,
		theme: "plain",
		styles: {
			fontSize: 11,
			cellPadding: 5,
		},
		columnStyles: {
			0: {
				cellWidth: 130,
				fontStyle: "bold",
				halign: "right",
			},
			1: {
				cellWidth: "auto",
				fontStyle: "bold",
				halign: "right",
				textColor: [37, 99, 235],
				fontSize: 12,
			},
		},
	});

	// Notes section
	if (data.notes) {
		const notesY =
			(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
				.finalY + 15;
		doc.setFontSize(10);
		doc.setTextColor(100, 100, 100);
		doc.text("Notes:", 20, notesY);
		doc.setTextColor(0, 0, 0);
		doc.text(data.notes, 20, notesY + 5, { maxWidth: 170 });
	}

	// Footer
	const footerY = 270;
	doc.setDrawColor(200, 200, 200);
	doc.line(20, footerY, 190, footerY);

	doc.setFontSize(9);
	doc.setTextColor(100, 100, 100);
	doc.text("Thank you for your payment!", 105, footerY + 7, {
		align: "center",
	});
	doc.text(
		"This is a computer-generated receipt and does not require a signature.",
		105,
		footerY + 12,
		{ align: "center" }
	);
	doc.text(
		"For any queries, please contact us at info@probodyline.com",
		105,
		footerY + 17,
		{ align: "center" }
	);

	// Save the PDF
	const fileName = `Invoice_${data.invoiceNumber}_${data.memberName.replace(
		/\s+/g,
		"_"
	)}.pdf`;
	doc.save(fileName);

	return fileName;
}

// Export invoice as blob for server-side usage
export function generateInvoicePDFBlob(data: InvoiceData): Blob {
	const doc = new jsPDF();

	// Same PDF generation logic as above
	doc.setFont("helvetica");

	doc.setFontSize(24);
	doc.setTextColor(37, 99, 235);
	doc.text("Pro Bodyline Fitness", 20, 20);

	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Complete Gym Management System", 20, 27);
	doc.text("Email: info@probodyline.com | Phone: +91 9876543210", 20, 32);
	doc.text("Address: 123 Fitness Street, Gym City, GC 12345", 20, 37);

	doc.setDrawColor(200, 200, 200);
	doc.line(20, 42, 190, 42);

	doc.setFontSize(20);
	doc.setTextColor(0, 0, 0);
	doc.text("PAYMENT RECEIPT", 105, 55, { align: "center" });

	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Invoice Number:", 140, 70);
	doc.setTextColor(0, 0, 0);
	doc.text(data.invoiceNumber, 140, 75);

	doc.setTextColor(100, 100, 100);
	doc.text("Payment Date:", 140, 82);
	doc.setTextColor(0, 0, 0);
	doc.text(new Date(data.paymentDate).toLocaleDateString("en-IN"), 140, 87);

	doc.setFontSize(12);
	doc.setTextColor(37, 99, 235);
	doc.text("Bill To:", 20, 70);

	doc.setFontSize(10);
	doc.setTextColor(0, 0, 0);
	doc.text(data.memberName, 20, 77);
	if (data.memberEmail) {
		doc.text(data.memberEmail, 20, 82);
	}
	doc.text(data.memberPhone, 20, data.memberEmail ? 87 : 82);

	const tableStartY = 100;
	const paymentDetails: (string | number)[][] = [];

	if (data.planName) {
		paymentDetails.push(["Membership Plan", data.planName]);
	}

	if (data.planDuration) {
		paymentDetails.push(["Plan Duration", data.planDuration]);
	}

	if (data.startDate && data.endDate) {
		paymentDetails.push([
			"Membership Period",
			`${new Date(data.startDate).toLocaleDateString("en-IN")} - ${new Date(
				data.endDate
			).toLocaleDateString("en-IN")}`,
		]);
	}

	paymentDetails.push(["Payment Mode", data.paymentMode]);

	if (data.transactionId) {
		paymentDetails.push(["Transaction ID", data.transactionId]);
	}

	if (data.gstNumber) {
		paymentDetails.push(["GST Number", data.gstNumber]);
	}

	if (data.gstPercentage) {
		paymentDetails.push(["GST Percentage", `${data.gstPercentage}%`]);
	}

	autoTable(doc, {
		startY: tableStartY,
		head: [["Description", "Details"]],
		body: paymentDetails,
		theme: "striped",
		headStyles: {
			fillColor: [37, 99, 235],
			textColor: 255,
			fontSize: 11,
			fontStyle: "bold",
		},
		styles: {
			fontSize: 10,
			cellPadding: 5,
		},
		columnStyles: {
			0: { cellWidth: 70, fontStyle: "bold" },
			1: { cellWidth: "auto" },
		},
	});

	const amountTableY =
		(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
			.finalY + 10;
	const amountDetails: (string | number)[][] = [];
	const baseAmount = data.discount ? data.amount + data.discount : data.amount;

	if (data.discount) {
		amountDetails.push(["Membership Amount", `₹${baseAmount.toFixed(2)}`]);
		amountDetails.push(["Discount", `-₹${data.discount.toFixed(2)}`]);
	}
	// Add GST breakdown if GST is applied
	if (data.gstAmount && data.gstAmount > 0) {
		const subtotal = data.amount - data.gstAmount;
		amountDetails.push(["Subtotal", `₹${subtotal.toFixed(2)}`]);
		amountDetails.push(["GST Amount", `₹${data.gstAmount.toFixed(2)}`]);
	}
	amountDetails.push(["Total Amount Paid", `₹${data.amount.toFixed(2)}`]);

	autoTable(doc, {
		startY: amountTableY,
		body: amountDetails,
		theme: "plain",
		styles: {
			fontSize: 11,
			cellPadding: 5,
		},
		columnStyles: {
			0: {
				cellWidth: 130,
				fontStyle: "bold",
				halign: "right",
			},
			1: {
				cellWidth: "auto",
				fontStyle: "bold",
				halign: "right",
				textColor: [37, 99, 235],
				fontSize: 12,
			},
		},
	});

	if (data.notes) {
		const notesY =
			(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
				.finalY + 15;
		doc.setFontSize(10);
		doc.setTextColor(100, 100, 100);
		doc.text("Notes:", 20, notesY);
		doc.setTextColor(0, 0, 0);
		doc.text(data.notes, 20, notesY + 5, { maxWidth: 170 });
	}

	const footerY = 270;
	doc.setDrawColor(200, 200, 200);
	doc.line(20, footerY, 190, footerY);

	doc.setFontSize(9);
	doc.setTextColor(100, 100, 100);
	doc.text("Thank you for your payment!", 105, footerY + 7, {
		align: "center",
	});
	doc.text(
		"This is a computer-generated receipt and does not require a signature.",
		105,
		footerY + 12,
		{ align: "center" }
	);
	doc.text(
		"For any queries, please contact us at info@probodyline.com",
		105,
		footerY + 17,
		{ align: "center" }
	);

	return doc.output("blob");
}

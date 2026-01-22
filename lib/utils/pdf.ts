import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceData {
	invoiceNumber: string;
	paymentDate: Date;
	memberName: string;
	memberEmail?: string;
	memberPhone: string;
	amount: number; // Total payment amount (including GST)
	paymentMode: string;
	transactionId?: string;
	planName?: string;
	planDuration?: string;
	startDate?: Date;
	endDate?: Date;
	discount?: number;
	notes?: string;
	membershipBaseAmount?: number; // Base membership amount (ex-GST, before discount)
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
	
	// Rule 7: Invoice Generation - Clear breakdown
	// Calculate from stored payment data
	const finalPayable = data.amount; // Total payment received
	const discountAmount = data.discount || 0;
	const gstAmount = data.gstAmount || 0;
	const taxableAmount = finalPayable - gstAmount; // Taxable = Final - GST
	const baseAmount = taxableAmount + discountAmount; // Base = Taxable + Discount
	
	// Show breakdown following Rule 7 format
	amountDetails.push(["Base Amount", `₹${baseAmount.toFixed(2)}`]);
	if (discountAmount > 0) {
		amountDetails.push(["Discount", `-₹${discountAmount.toFixed(2)}`]);
		amountDetails.push(["Taxable Value", `₹${taxableAmount.toFixed(2)}`]);
	}
	if (gstAmount > 0) {
		amountDetails.push([`GST (${data.gstPercentage}%)`, `₹${gstAmount.toFixed(2)}`]);
	}
	amountDetails.push(["Final Payable", `₹${finalPayable.toFixed(2)}`]);
	amountDetails.push(["Payment Received", `₹${finalPayable.toFixed(2)}`]);

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
	
	// Rule 7: Invoice Generation - Clear breakdown
	// Calculate from stored payment data
	const finalPayable = data.amount; // Total payment received
	const discountAmount = data.discount || 0;
	const gstAmount = data.gstAmount || 0;
	const taxableAmount = finalPayable - gstAmount; // Taxable = Final - GST
	const baseAmount = taxableAmount + discountAmount; // Base = Taxable + Discount
	
	// Show breakdown following Rule 7 format
	amountDetails.push(["Base Amount", `₹${baseAmount.toFixed(2)}`]);
	if (discountAmount > 0) {
		amountDetails.push(["Discount", `-₹${discountAmount.toFixed(2)}`]);
		amountDetails.push(["Taxable Value", `₹${taxableAmount.toFixed(2)}`]);
	}
	if (gstAmount > 0) {
		amountDetails.push([`GST (${data.gstPercentage}%)`, `₹${gstAmount.toFixed(2)}`]);
	}
	amountDetails.push(["Final Payable", `₹${finalPayable.toFixed(2)}`]);
	amountDetails.push(["Payment Received", `₹${finalPayable.toFixed(2)}`]);

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

// Workout Plan PDF Export
interface Exercise {
	name: string;
	sets?: number;
	reps?: number;
	weight?: number;
	restTime?: number;
	notes?: string;
}

interface WorkoutDay {
	day: string;
	exercises: Exercise[];
}

interface WorkoutPlanData {
	name: string;
	description?: string;
	difficulty?: string;
	goal?: string;
	startDate: Date;
	endDate?: Date | null;
	exercises: Exercise[] | WorkoutDay[]; // Support both old and new format
	memberName: string;
	memberEmail?: string | null;
	memberPhone?: string | null;
	membershipNumber: string;
}

export function generateWorkoutPlanPDF(data: WorkoutPlanData) {
	const doc = new jsPDF();

	// Set font
	doc.setFont("helvetica");

	// Header - Brand Information
	doc.setFontSize(24);
	doc.setTextColor(37, 99, 235); // Blue color
	doc.text("Pro BodyLine Fitness", 20, 20);

	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Complete Gym Management System", 20, 27);
	doc.text("Email: info@probodyline.com | Phone: +91 9876543210", 20, 32);
	doc.text("Address: 123 Fitness Street, Gym City, GC 12345", 20, 37);

	// Draw line
	doc.setDrawColor(200, 200, 200);
	doc.line(20, 42, 190, 42);

	// Workout Plan Title
	doc.setFontSize(20);
	doc.setTextColor(0, 0, 0);
	doc.text("WORKOUT PLAN", 105, 55, { align: "center" });

	// Plan Name
	doc.setFontSize(16);
	doc.setTextColor(37, 99, 235);
	doc.text(data.name, 105, 65, { align: "center" });

	// Plan Details
	let currentY = 75;
	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Plan Details:", 20, currentY);
	currentY += 8;

	doc.setTextColor(0, 0, 0);
	if (data.difficulty) {
		doc.text(`Difficulty: ${data.difficulty}`, 20, currentY);
		currentY += 6;
	}
	if (data.goal) {
		doc.text(`Goal: ${data.goal.replace("_", " ")}`, 20, currentY);
		currentY += 6;
	}
	doc.text(
		`Duration: ${new Date(data.startDate).toLocaleDateString("en-IN")}${
			data.endDate ? ` - ${new Date(data.endDate).toLocaleDateString("en-IN")}` : ""
		}`,
		20,
		currentY
	);
	currentY += 10;

	// Member Information
	doc.setDrawColor(200, 200, 200);
	doc.line(20, currentY, 190, currentY);
	currentY += 8;

	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Member Information:", 20, currentY);
	currentY += 8;

	doc.setTextColor(0, 0, 0);
	doc.text(`Name: ${data.memberName}`, 20, currentY);
	currentY += 6;
	doc.text(`Member ID: ${data.membershipNumber}`, 20, currentY);
	currentY += 6;
	if (data.memberEmail) {
		doc.text(`Email: ${data.memberEmail}`, 20, currentY);
		currentY += 6;
	}
	if (data.memberPhone) {
		doc.text(`Phone: ${data.memberPhone}`, 20, currentY);
		currentY += 6;
	}
	currentY += 5;

	// Description
	if (data.description) {
		doc.setDrawColor(200, 200, 200);
		doc.line(20, currentY, 190, currentY);
		currentY += 8;

		doc.setFontSize(10);
		doc.setTextColor(100, 100, 100);
		doc.text("Description:", 20, currentY);
		currentY += 6;

		doc.setTextColor(0, 0, 0);
		const descriptionLines = doc.splitTextToSize(data.description, 170);
		descriptionLines.forEach((line: string) => {
			doc.text(line, 20, currentY);
			currentY += 6;
		});
		currentY += 5;
	}

	// Exercises Section
	doc.setDrawColor(200, 200, 200);
	doc.line(20, currentY, 190, currentY);
	currentY += 8;

	// Check if it's day-wise format or flat format
	const isDayWise = data.exercises.length > 0 && 'day' in data.exercises[0];
	
	if (isDayWise) {
		// Day-wise format
		const days = data.exercises as WorkoutDay[];
		days.forEach((day) => {
			// Check if we need a new page
			if (currentY > 250) {
				doc.addPage();
				currentY = 20;
			}

			// Day Header
			doc.setFontSize(14);
			doc.setTextColor(37, 99, 235);
			doc.text(day.day, 20, currentY);
			currentY += 8;

			// Prepare exercise data for table
			const exerciseRows: (string | number)[][] = [];
			day.exercises.forEach((exercise, index) => {
				exerciseRows.push([
					index + 1,
					exercise.name,
					exercise.sets || "N/A",
					exercise.reps || "N/A",
					exercise.weight ? `${exercise.weight} kg` : "N/A",
					exercise.restTime ? `${exercise.restTime}s` : "N/A",
				]);
			});

			autoTable(doc, {
				startY: currentY,
				head: [["#", "Exercise", "Sets", "Reps", "Weight", "Rest"]],
				body: exerciseRows,
				theme: "striped",
				headStyles: {
					fillColor: [37, 99, 235],
					textColor: 255,
					fontSize: 10,
					fontStyle: "bold",
				},
				styles: {
					fontSize: 9,
					cellPadding: 3,
				},
				columnStyles: {
					0: { cellWidth: 15, halign: "center" },
					1: { cellWidth: 70 },
					2: { cellWidth: 25, halign: "center" },
					3: { cellWidth: 25, halign: "center" },
					4: { cellWidth: 30, halign: "center" },
					5: { cellWidth: 25, halign: "center" },
				},
			});

			// Add exercise notes if any
			const tableEndY =
				(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
			let notesY = tableEndY;

			day.exercises.forEach((exercise, index) => {
				if (exercise.notes) {
					if (notesY > 270) {
						doc.addPage();
						notesY = 20;
					}
					doc.setFontSize(9);
					doc.setTextColor(100, 100, 100);
					doc.text(`${index + 1}. ${exercise.name}:`, 20, notesY);
					notesY += 5;
					doc.setTextColor(0, 0, 0);
					const noteLines = doc.splitTextToSize(exercise.notes, 170);
					noteLines.forEach((line: string) => {
						doc.text(line, 25, notesY);
						notesY += 5;
					});
					notesY += 3;
				}
			});

			currentY = notesY + 5;
		});
	} else {
		// Old flat format (backward compatibility)
		doc.setFontSize(14);
		doc.setTextColor(37, 99, 235);
		doc.text("Exercises", 20, currentY);
		currentY += 10;

		// Prepare exercise data for table
		const exerciseRows: (string | number)[][] = [];
		(data.exercises as Exercise[]).forEach((exercise, index) => {
			exerciseRows.push([
				index + 1,
				exercise.name,
				exercise.sets || "N/A",
				exercise.reps || "N/A",
				exercise.weight ? `${exercise.weight} kg` : "N/A",
				exercise.restTime ? `${exercise.restTime}s` : "N/A",
			]);
		});

		autoTable(doc, {
			startY: currentY,
			head: [["#", "Exercise", "Sets", "Reps", "Weight", "Rest"]],
			body: exerciseRows,
			theme: "striped",
			headStyles: {
				fillColor: [37, 99, 235],
				textColor: 255,
				fontSize: 10,
				fontStyle: "bold",
			},
			styles: {
				fontSize: 9,
				cellPadding: 3,
			},
			columnStyles: {
				0: { cellWidth: 15, halign: "center" },
				1: { cellWidth: 70 },
				2: { cellWidth: 25, halign: "center" },
				3: { cellWidth: 25, halign: "center" },
				4: { cellWidth: 30, halign: "center" },
				5: { cellWidth: 25, halign: "center" },
			},
		});

		// Add exercise notes if any
		const tableEndY =
			(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
		let notesY = tableEndY;

		(data.exercises as Exercise[]).forEach((exercise, index) => {
			if (exercise.notes) {
				if (notesY > 270) {
					doc.addPage();
					notesY = 20;
				}
				doc.setFontSize(9);
				doc.setTextColor(100, 100, 100);
				doc.text(`${index + 1}. ${exercise.name}:`, 20, notesY);
				notesY += 5;
				doc.setTextColor(0, 0, 0);
				const noteLines = doc.splitTextToSize(exercise.notes, 170);
				noteLines.forEach((line: string) => {
					doc.text(line, 25, notesY);
					notesY += 5;
				});
				notesY += 3;
			}
		});
		
		// Update currentY to the final position after notes
		currentY = notesY + 5;
	}

	// Footer
	const footerY = Math.min(currentY + 10, 270);
	doc.setDrawColor(200, 200, 200);
	doc.line(20, footerY, 190, footerY);

	doc.setFontSize(9);
	doc.setTextColor(100, 100, 100);
	doc.text("Generated by Pro BodyLine Fitness", 105, footerY + 7, {
		align: "center",
	});
	doc.text(
		"For any queries, please contact us at info@probodyline.com",
		105,
		footerY + 12,
		{ align: "center" }
	);

	// Save the PDF
	const fileName = `WorkoutPlan_${data.name.replace(/\s+/g, "_")}_${data.memberName.replace(
		/\s+/g,
		"_"
	)}.pdf`;
	doc.save(fileName);

	return fileName;
}

// Diet Plan PDF Export
interface FoodItem {
	foodName?: string;
	name?: string;
	portion?: number;
	unit?: string;
}

interface Meal {
	mealTime?: string;
	mealName?: string;
	items?: FoodItem[];
	foods?: FoodItem[];
}

interface DietDay {
	day: string;
	meals: Meal[];
}

interface DietPlanData {
	name: string;
	description?: string | null;
	goal?: string | null;
	totalCalories?: number | null;
	totalProtein?: number | null;
	startDate: Date;
	endDate?: Date | null;
	meals: Meal[] | DietDay[]; // Support both old and new format
	memberName: string;
	memberEmail?: string | null;
	memberPhone?: string | null;
	membershipNumber: string;
}

export function generateDietPlanPDF(data: DietPlanData) {
	const doc = new jsPDF();

	// Set font
	doc.setFont("helvetica");

	// Header - Brand Information
	doc.setFontSize(24);
	doc.setTextColor(37, 99, 235); // Blue color
	doc.text("Pro BodyLine Fitness", 20, 20);

	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Complete Gym Management System", 20, 27);
	doc.text("Email: info@probodyline.com | Phone: +91 9876543210", 20, 32);
	doc.text("Address: 123 Fitness Street, Gym City, GC 12345", 20, 37);

	// Draw line
	doc.setDrawColor(200, 200, 200);
	doc.line(20, 42, 190, 42);

	// Diet Plan Title
	doc.setFontSize(20);
	doc.setTextColor(0, 0, 0);
	doc.text("DIET PLAN", 105, 55, { align: "center" });

	// Plan Name
	doc.setFontSize(16);
	doc.setTextColor(37, 99, 235);
	doc.text(data.name, 105, 65, { align: "center" });

	// Plan Details
	let currentY = 75;
	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Plan Details:", 20, currentY);
	currentY += 8;

	doc.setTextColor(0, 0, 0);
	if (data.goal) {
		doc.text(`Goal: ${data.goal.replace("_", " ")}`, 20, currentY);
		currentY += 6;
	}
	if (data.totalCalories) {
		doc.text(`Daily Calories: ${data.totalCalories} kcal`, 20, currentY);
		currentY += 6;
	}
	if (data.totalProtein) {
		doc.text(`Daily Protein: ${data.totalProtein} g`, 20, currentY);
		currentY += 6;
	}
	doc.text(
		`Duration: ${new Date(data.startDate).toLocaleDateString("en-IN")}${
			data.endDate ? ` - ${new Date(data.endDate).toLocaleDateString("en-IN")}` : ""
		}`,
		20,
		currentY
	);
	currentY += 10;

	// Member Information
	doc.setDrawColor(200, 200, 200);
	doc.line(20, currentY, 190, currentY);
	currentY += 8;

	doc.setFontSize(10);
	doc.setTextColor(100, 100, 100);
	doc.text("Member Information:", 20, currentY);
	currentY += 8;

	doc.setTextColor(0, 0, 0);
	doc.text(`Name: ${data.memberName}`, 20, currentY);
	currentY += 6;
	doc.text(`Member ID: ${data.membershipNumber}`, 20, currentY);
	currentY += 6;
	if (data.memberEmail) {
		doc.text(`Email: ${data.memberEmail}`, 20, currentY);
		currentY += 6;
	}
	if (data.memberPhone) {
		doc.text(`Phone: ${data.memberPhone}`, 20, currentY);
		currentY += 6;
	}
	currentY += 5;

	// Description
	if (data.description) {
		doc.setDrawColor(200, 200, 200);
		doc.line(20, currentY, 190, currentY);
		currentY += 8;

		doc.setFontSize(10);
		doc.setTextColor(100, 100, 100);
		doc.text("Description:", 20, currentY);
		currentY += 6;

		doc.setTextColor(0, 0, 0);
		const descriptionLines = doc.splitTextToSize(data.description, 170);
		descriptionLines.forEach((line: string) => {
			doc.text(line, 20, currentY);
			currentY += 6;
		});
		currentY += 5;
	}

	// Meals Section
	doc.setDrawColor(200, 200, 200);
	doc.line(20, currentY, 190, currentY);
	currentY += 8;

	// Check if it's day-wise format or flat format
	const isDayWise = data.meals.length > 0 && 'day' in data.meals[0];
	
	if (isDayWise) {
		// Day-wise format
		const days = data.meals as DietDay[];
		days.forEach((day) => {
			// Check if we need a new page
			if (currentY > 250) {
				doc.addPage();
				currentY = 20;
			}

			// Day Header
			doc.setFontSize(14);
			doc.setTextColor(37, 99, 235);
			doc.text(day.day, 20, currentY);
			currentY += 8;

			// Process each meal in the day
			day.meals.forEach((meal, mealIndex) => {
				// Check if we need a new page
				if (currentY > 250) {
					doc.addPage();
					currentY = 20;
				}

				// Meal Name
				doc.setFontSize(12);
				doc.setTextColor(0, 0, 0);
				doc.text(`${mealIndex + 1}. ${meal.mealName || meal.mealTime || "Meal"}`, 20, currentY);
				currentY += 8;

				// Food Items
				const foodItems = meal.foods || meal.items || [];
				if (foodItems.length > 0) {
					const foodRows: (string | number)[][] = [];
					foodItems.forEach((food) => {
						const foodName = food.foodName || food.name || "Unknown";
						const portion = food.portion || 1;
						const unit = food.unit || "serving";
						foodRows.push([foodName, `${portion} ${unit}`]);
					});

					autoTable(doc, {
						startY: currentY,
						head: [["Food Item", "Portion"]],
						body: foodRows,
						theme: "striped",
						headStyles: {
							fillColor: [37, 99, 235],
							textColor: 255,
							fontSize: 9,
							fontStyle: "bold",
						},
						styles: {
							fontSize: 8,
							cellPadding: 3,
						},
						columnStyles: {
							0: { cellWidth: 140 },
							1: { cellWidth: 50, halign: "center" },
						},
					});

					currentY =
						(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
				} else {
					doc.setFontSize(9);
					doc.setTextColor(100, 100, 100);
					doc.text("No items added", 20, currentY);
					currentY += 8;
				}

				currentY += 5;
			});
		});
	} else {
		// Old flat format (backward compatibility)
		doc.setFontSize(14);
		doc.setTextColor(37, 99, 235);
		doc.text("Daily Meal Plan", 20, currentY);
		currentY += 10;

		// Process each meal
		(data.meals as Meal[]).forEach((meal, mealIndex) => {
			// Check if we need a new page
			if (currentY > 250) {
				doc.addPage();
				currentY = 20;
			}

			// Meal Name
			doc.setFontSize(12);
			doc.setTextColor(37, 99, 235);
			doc.text(`${mealIndex + 1}. ${meal.mealName || meal.mealTime || "Meal"}`, 20, currentY);
			currentY += 8;

			// Food Items
			const foodItems = meal.foods || meal.items || [];
			if (foodItems.length > 0) {
				const foodRows: (string | number)[][] = [];
				foodItems.forEach((food) => {
					const foodName = food.foodName || food.name || "Unknown";
					const portion = food.portion || 1;
					const unit = food.unit || "serving";
					foodRows.push([foodName, `${portion} ${unit}`]);
				});

				autoTable(doc, {
					startY: currentY,
					head: [["Food Item", "Portion"]],
					body: foodRows,
					theme: "striped",
					headStyles: {
						fillColor: [37, 99, 235],
						textColor: 255,
						fontSize: 9,
						fontStyle: "bold",
					},
					styles: {
						fontSize: 8,
						cellPadding: 3,
					},
					columnStyles: {
						0: { cellWidth: 140 },
						1: { cellWidth: 50, halign: "center" },
					},
				});

				currentY =
					(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
			} else {
				doc.setFontSize(9);
				doc.setTextColor(100, 100, 100);
				doc.text("No items added", 20, currentY);
				currentY += 8;
			}

			currentY += 5;
		});
	}

	// Footer
	const footerY = Math.min(currentY + 10, 270);
	doc.setDrawColor(200, 200, 200);
	doc.line(20, footerY, 190, footerY);

	doc.setFontSize(9);
	doc.setTextColor(100, 100, 100);
	doc.text("Generated by Pro BodyLine Fitness", 105, footerY + 7, {
		align: "center",
	});
	doc.text(
		"For any queries, please contact us at info@probodyline.com",
		105,
		footerY + 12,
		{ align: "center" }
	);

	// Save the PDF
	const fileName = `DietPlan_${data.name.replace(/\s+/g, "_")}_${data.memberName.replace(
		/\s+/g,
		"_"
	)}.pdf`;
	doc.save(fileName);

	return fileName;
}

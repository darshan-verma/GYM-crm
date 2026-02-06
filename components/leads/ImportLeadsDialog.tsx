"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { importLeadsFromFile, type ImportLeadsResult } from "@/lib/actions/leads";

export default function ImportLeadsDialog() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<ImportLeadsResult | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!file) {
			toast.error("No file selected", {
				description: "Please choose an Excel file to import.",
			});
			return;
		}

		setLoading(true);
		setResult(null);

		try {
			const formData = new FormData();
			formData.set("file", file);

			const res = await importLeadsFromFile(formData);
			setResult(res);

			if (res.imported > 0) {
				toast.success("Import complete", {
					description: `Successfully imported ${res.imported} lead${res.imported === 1 ? "" : "s"}.${res.skipped > 0 ? ` ${res.skipped} row(s) skipped.` : ""}`,
				});
				router.refresh();
				setFile(null);
				if (fileInputRef.current) fileInputRef.current.value = "";
				if (res.imported > 0 && res.errors.length === 0) setOpen(false);
			} else if (res.errors.length > 0) {
				toast.error("Import failed", {
					description: res.errors[0],
				});
			}
		} catch (err) {
			toast.error("Import failed", {
				description: err instanceof Error ? err.message : "Something went wrong",
			});
		} finally {
			setLoading(false);
		}
	}

	function handleOpenChange(isOpen: boolean) {
		if (!loading) {
			setOpen(isOpen);
			if (!isOpen) {
				setFile(null);
				setResult(null);
				if (fileInputRef.current) fileInputRef.current.value = "";
			}
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" type="button">
					<Upload className="w-4 h-4 mr-2" />
					Import
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileSpreadsheet className="w-5 h-5" />
						Import leads from Excel
					</DialogTitle>
					<DialogDescription>
						Upload an Excel file (.xlsx or .xls) with columns matching the export format: Name, Phone,
						Email, Age, Gender, Source, Status, Interested Plan, Budget, Preferred Time, Follow-up
						Date, Notes, Priority. Name and Phone are required for each row.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="lead-import-file"
							className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
						>
							<div className="flex flex-col items-center justify-center pt-5 pb-6">
								<Upload className="w-8 h-8 mb-2 text-muted-foreground" />
								<p className="mb-1 text-sm text-muted-foreground">
									<span className="font-medium">Click to upload</span> or drag and drop
								</p>
								<p className="text-xs text-muted-foreground">.xlsx or .xls</p>
							</div>
							<input
								ref={fileInputRef}
								id="lead-import-file"
								type="file"
								className="hidden"
								accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
								onChange={(e) => setFile(e.target.files?.[0] ?? null)}
								disabled={loading}
							/>
						</label>
						{file && (
							<p className="text-sm text-muted-foreground truncate" title={file.name}>
								Selected: {file.name}
							</p>
						)}
					</div>

					{result && (
						<div
							className={`rounded-lg border p-3 text-sm ${
								result.imported > 0
									? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
									: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
							}`}
						>
							<div className="flex items-center gap-2 font-medium">
								{result.imported > 0 ? (
									<CheckCircle2 className="w-4 h-4 text-green-600" />
								) : (
									<AlertCircle className="w-4 h-4 text-amber-600" />
								)}
								<span>
									Imported: {result.imported} | Skipped: {result.skipped}
								</span>
							</div>
							{result.errors.length > 0 && (
								<ul className="mt-2 max-h-32 overflow-y-auto list-disc list-inside space-y-0.5 text-muted-foreground">
									{result.errors.slice(0, 10).map((msg, i) => (
										<li key={i}>{msg}</li>
									))}
									{result.errors.length > 10 && (
										<li>... and {result.errors.length - 10} more</li>
									)}
								</ul>
							)}
						</div>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={loading}
						>
							{result && result.imported > 0 ? "Close" : "Cancel"}
						</Button>
						<Button type="submit" disabled={!file || loading}>
							{loading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Importing...
								</>
							) : (
								<>
									<Upload className="w-4 h-4 mr-2" />
									Import leads
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

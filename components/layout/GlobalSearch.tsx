"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2, LayoutDashboard, User, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { globalSearch, type GlobalSearchResult } from "@/lib/actions/global-search";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

export default function GlobalSearch() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<GlobalSearchResult>({
		pages: [],
		members: [],
		payments: [],
	});
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const runSearch = useCallback(async (q: string) => {
		setLoading(true);
		try {
			const data = await globalSearch(q);
			setResults(data);
			setSelectedIndex(0);
		} finally {
			setLoading(false);
		}
	}, []);

	// Search when open: immediate if empty query, debounced otherwise
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		if (!open) return;
		if (query === "") {
			runSearch("");
			return;
		}
		debounceRef.current = setTimeout(() => {
			runSearch(query);
		}, DEBOUNCE_MS);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, open, runSearch]);

	// Click outside to close
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				panelRef.current?.contains(e.target as Node) ||
				inputRef.current?.contains(e.target as Node)
			) {
				return;
			}
			setOpen(false);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const flatItems: { type: "page" | "member" | "payment"; href: string; label: string }[] = [
		...results.pages.map((p) => ({ type: "page" as const, href: p.href, label: p.name })),
		...results.members.map((m) => ({
			type: "member" as const,
			href: `/members/${m.id}`,
			label: `${m.name} (${m.membershipNumber})`,
		})),
		...results.payments.map((p) => ({
			type: "payment" as const,
			href: `/billing/invoices/${p.id}`,
			label: `${p.invoiceNumber} — ${formatCurrency(p.amount)}${p.memberName ? ` — ${p.memberName}` : ""}`,
		})),
	];

	const hasResults =
		results.pages.length > 0 ||
		results.members.length > 0 ||
		results.payments.length > 0;

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!open) return;
		if (e.key === "Escape") {
			setOpen(false);
			inputRef.current?.blur();
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
			return;
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((i) => Math.max(i - 1, 0));
			return;
		}
		if (e.key === "Enter" && flatItems[selectedIndex]) {
			e.preventDefault();
			router.push(flatItems[selectedIndex].href);
			setOpen(false);
			setQuery("");
		}
	};

	const handleSelect = (href: string) => {
		router.push(href);
		setOpen(false);
		setQuery("");
	};

	return (
		<div className="relative flex-1 max-w-md">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
				<Input
					ref={inputRef}
					type="search"
					placeholder="Search members, payments, or go to page..."
					className="pl-9 h-10"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setOpen(true)}
					onKeyDown={handleKeyDown}
					aria-expanded={open}
					aria-autocomplete="list"
					role="combobox"
				/>
			</div>

			{open && (
				<div
					ref={panelRef}
					className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden"
				>
					{loading ? (
						<div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
							<Loader2 className="h-5 w-5 animate-spin" />
							<span className="text-sm">Searching...</span>
						</div>
					) : (
						<div className="max-h-[min(60vh,400px)] overflow-y-auto p-1">
							{!hasResults && (
								<div className="px-3 py-6 text-center text-sm text-muted-foreground">
									{query.length < 2
										? "Type a member code (e.g. PBF1001) or invoice number to search."
										: "No results found."}
								</div>
							)}

							{results.pages.length > 0 && (
								<>
									<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
										<LayoutDashboard className="h-3.5 w-3.5" />
										Pages
									</div>
									{results.pages.map((p) => {
										const idx = flatItems.findIndex(
											(item) => item.type === "page" && item.href === p.href
										);
										return (
											<Link
												key={p.href}
												href={p.href}
												onClick={() => handleSelect(p.href)}
												className={cn(
													"flex items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent",
													selectedIndex === idx && "bg-accent"
												)}
											>
												{p.name}
											</Link>
										);
									})}
								</>
							)}

							{results.members.length > 0 && (
								<>
									<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2 mt-1">
										<User className="h-3.5 w-3.5" />
										Members
									</div>
									{results.members.map((m) => {
										const idx = flatItems.findIndex(
											(item) =>
												item.type === "member" && item.href === `/members/${m.id}`
										);
										return (
											<Link
												key={m.id}
												href={`/members/${m.id}`}
												onClick={() => handleSelect(`/members/${m.id}`)}
												className={cn(
													"flex items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent",
													selectedIndex === idx && "bg-accent"
												)}
											>
												<span className="font-medium">{m.name}</span>
												<span className="text-muted-foreground">
													{m.membershipNumber}
												</span>
											</Link>
										);
									})}
								</>
							)}

							{results.payments.length > 0 && (
								<>
									<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2 mt-1">
										<FileText className="h-3.5 w-3.5" />
										Payments / Invoices
									</div>
									{results.payments.map((p) => {
										const idx = flatItems.findIndex(
											(item) =>
												item.type === "payment" &&
												item.href === `/billing/invoices/${p.id}`
										);
										return (
											<Link
												key={p.id}
												href={`/billing/invoices/${p.id}`}
												onClick={() =>
													handleSelect(`/billing/invoices/${p.id}`)
												}
												className={cn(
													"flex items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent",
													selectedIndex === idx && "bg-accent"
												)}
											>
												<span className="font-medium">{p.invoiceNumber}</span>
												<span>{formatCurrency(p.amount)}</span>
												{p.memberName && (
													<span className="text-muted-foreground truncate">
														{p.memberName}
													</span>
												)}
											</Link>
										);
									})}
								</>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

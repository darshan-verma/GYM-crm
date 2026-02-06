"use client";

import React from "react";
import { cn } from "@/lib/utils";

type TiptapNode = {
	type: string;
	content?: TiptapNode[];
	text?: string;
	attrs?: Record<string, unknown>;
};

function renderNode(node: TiptapNode, key: number): React.ReactNode {
	if (node.type === "text") {
		return node.text ?? "";
	}

	switch (node.type) {
		case "paragraph":
			return (
				<p key={key} className="mb-2 last:mb-0">
					{node.content?.map((c, i) => renderNode(c, i))}
				</p>
			);
		case "heading": {
			const level = (node.attrs?.level as number) ?? 1;
			const Tag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements;
			return (
				<Tag
					key={key}
					className={cn(
						"font-semibold mb-2 mt-3 first:mt-0",
						level === 1 && "text-lg",
						level === 2 && "text-base",
						level === 3 && "text-sm"
					)}
				>
					{node.content?.map((c, i) => renderNode(c, i))}
				</Tag>
			);
		}
		case "bulletList":
			return (
				<ul key={key} className="list-disc pl-5 mb-2 space-y-1">
					{node.content?.map((c, i) => renderNode(c, i))}
				</ul>
			);
		case "orderedList":
			return (
				<ol key={key} className="list-decimal pl-5 mb-2 space-y-1">
					{node.content?.map((c, i) => renderNode(c, i))}
				</ol>
			);
		case "listItem":
			return (
				<li key={key}>
					{node.content?.map((c, i) => renderNode(c, i))}
				</li>
			);
		case "hardBreak":
			return <br key={key} />;
		default:
			return (
				<span key={key}>
					{node.content?.map((c, i) => renderNode(c, i))}
				</span>
			);
	}
}

export default function PromotionContentView({
	content,
	className,
}: {
	content: unknown;
	className?: string;
}) {
	if (!content || typeof content !== "object") return null;

	const doc = content as { content?: TiptapNode[] };
	const nodes = doc.content ?? [];

	return (
		<div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
			{nodes.map((node, i) => renderNode(node, i))}
		</div>
	);
}

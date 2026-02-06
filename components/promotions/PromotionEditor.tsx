"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const defaultContent = {
	type: "doc",
	content: [{ type: "paragraph", content: [] }],
};

export default function PromotionEditor({
	value,
	onChange,
	className,
	placeholder: _placeholder = "Write your promotion description…",
}: {
	value: unknown;
	onChange: (json: unknown) => void;
	className?: string;
	placeholder?: string;
}) {
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [StarterKit],
		content: value && typeof value === "object" ? value : defaultContent,
		editorProps: {
			attributes: {
				class:
					"prose prose-sm dark:prose-invert max-w-none min-h-[120px] px-3 py-2 focus:outline-none",
			},
		},
		onUpdate: ({ editor }) => {
			onChange(editor.getJSON());
		},
	});

	useEffect(() => {
		if (!editor) return;
		const v = value && typeof value === "object" ? value : defaultContent;
		const current = JSON.stringify(editor.getJSON());
		const next = JSON.stringify(v);
		if (current !== next) {
			editor.commands.setContent(v as object);
		}
	}, [value, editor]);

	if (!editor) return null;

	return (
		<div
			className={cn(
				"rounded-lg border border-input bg-background text-foreground",
				className
			)}
		>
			<EditorContent editor={editor} />
		</div>
	);
}

"use client";

import { DRAFT_KEYS } from "@/lib/utils/draft";
import { useFormDraft } from "@/lib/hooks/useFormDraft";
import LeadForm from "@/components/forms/LeadForm";
import type { LeadFormDraft } from "@/components/forms/LeadForm";

export default function NewLeadFormWrapper() {
	const { draft, saveDraft, clearDraft } = useFormDraft<LeadFormDraft>(
		DRAFT_KEYS.LEAD_NEW,
		{ enabled: true, debounceMs: 600 }
	);

	return (
		<LeadForm
			initialFromDraft={draft}
			onSaveDraft={saveDraft}
			onClearDraft={clearDraft}
		/>
	);
}

"use client";

import { DRAFT_KEYS } from "@/lib/utils/draft";
import { useFormDraft } from "@/lib/hooks/useFormDraft";
import MemberForm, { type MemberFormDraft } from "@/components/forms/MemberForm";

interface NewMemberFormWrapperProps {
	trainers: Array<{ id: string; name: string }>;
	membershipPlans: Array<{
		id: string;
		name: string;
		price: number;
		duration: number;
	}>;
	leadId?: string;
	leadData?: { name?: string; phone?: string; email?: string };
	draftKey?: string;
}

export default function NewMemberFormWrapper({
	trainers,
	membershipPlans,
	leadId,
	leadData,
	draftKey = DRAFT_KEYS.MEMBER_NEW,
}: NewMemberFormWrapperProps) {
	const { draft, saveDraft, clearDraft } = useFormDraft<MemberFormDraft>(
		draftKey,
		{ enabled: true, debounceMs: 600 }
	);

	return (
		<MemberForm
			trainers={trainers}
			membershipPlans={membershipPlans}
			leadId={leadId}
			leadData={leadData}
			initialFromDraft={draft}
			onSaveDraft={saveDraft}
			onClearDraft={clearDraft}
		/>
	);
}

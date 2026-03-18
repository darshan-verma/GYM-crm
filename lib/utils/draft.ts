const DRAFT_PREFIX = "crm_draft_";

export const DRAFT_KEYS = {
	MEMBER_NEW: `${DRAFT_PREFIX}member_new`,
	MEMBER_FROM_LEAD: (leadId: string) => `${DRAFT_PREFIX}member_from_lead_${leadId}`,
	LEAD_NEW: `${DRAFT_PREFIX}lead_new`,
	PAYMENT: `${DRAFT_PREFIX}payment`,
	WORKOUT: `${DRAFT_PREFIX}workout`,
	DIET: `${DRAFT_PREFIX}diet`,
	ASSIGN_MEMBERSHIP: (memberId: string) =>
		`${DRAFT_PREFIX}assign_membership_${memberId}`,
} as const;

export function getDraft<T>(key: string): T | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(key);
		if (raw == null) return null;
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

export function setDraft(key: string, data: unknown): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch {
		// no-op on quota or other errors
	}
}

export function clearDraft(key: string): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(key);
	} catch {
		// no-op
	}
}

"use client";

import { useCallback, useMemo, useRef } from "react";
import { getDraft, setDraft, clearDraft } from "@/lib/utils/draft";

export interface UseFormDraftOptions {
	enabled?: boolean;
	debounceMs?: number;
}

export function useFormDraft<T>(key: string, options: UseFormDraftOptions = {}) {
	const { enabled = true, debounceMs = 600 } = options;
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingRef = useRef<T | null>(null);

	const draft = useMemo(() => {
		if (!enabled) return null;
		return getDraft<T>(key);
	}, [key, enabled]);
	const hasDraft = draft != null;

	const saveDraft = useCallback(
		(data: T) => {
			if (!enabled) return;
			pendingRef.current = data;
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => {
				timerRef.current = null;
				const payload = pendingRef.current;
				if (payload != null) {
					setDraft(key, payload);
				}
			}, debounceMs);
		},
		[key, enabled, debounceMs]
	);

	const clearDraftCallback = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		pendingRef.current = null;
		clearDraft(key);
	}, [key]);

	return {
		draft,
		saveDraft,
		clearDraft: clearDraftCallback,
		hasDraft,
	};
}

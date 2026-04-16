/** @format */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type CookieConsent = {
	essential: true;
	analytics: boolean;
};

type CookieContextType = {
	consent: CookieConsent | null;
	setConsent: (value: CookieConsent) => void;
};

const CookieCtx = createContext<CookieContextType | null>(null);

const COOKIE_NAME = 'xernerx:consent';

export function CookieProvider({ children }: { children: React.ReactNode }) {
	const [consent, setConsentState] = useState<CookieConsent | null>(null);

	useEffect(() => {
		const raw = document.cookie.split('; ').find((row) => row.startsWith(COOKIE_NAME + '='));

		if (raw) {
			try {
				const parsed = JSON.parse(decodeURIComponent(raw.split('=')[1]));
				setConsentState(parsed);
			} catch {
				setConsentState(null);
			}
		}
	}, []);

	function setConsent(value: CookieConsent) {
		document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; ` + 'path=/; max-age=31536000; SameSite=Lax';

		setConsentState(value);
	}

	return <CookieCtx.Provider value={{ consent, setConsent }}>{children}</CookieCtx.Provider>;
}

export function useCookies() {
	const ctx = useContext(CookieCtx);
	if (!ctx) throw new Error('useCookies must be used inside CookieProvider');
	return ctx;
}

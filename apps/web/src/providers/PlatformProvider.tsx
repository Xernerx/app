/** @format */

'use client';

import { createContext, useContext } from 'react';

type PlatformContextType = { platform: string };

const PlatformContext = createContext<PlatformContextType | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
	const platform = navigator.userAgent.toLowerCase().includes('electron') ? 'application' : 'browser';

	return <PlatformContext.Provider value={{ platform }}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
	const ctx = useContext(PlatformContext);

	if (!ctx) throw new Error('PlatformProvider missing');

	return ctx;
}

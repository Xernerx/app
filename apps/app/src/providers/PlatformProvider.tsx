/** @format */

'use client';

import { createContext, useContext } from 'react';

type PlatformContextType = { type: string; platform: string };

const PlatformContext = createContext<PlatformContextType | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
	const type = navigator.userAgent.toLowerCase().includes('electron') ? 'application' : 'browser';
	const platform = navigator.userAgent.toLowerCase().includes('win')
		? 'windows'
		: navigator.userAgent.toLowerCase().includes('mac')
			? 'macos'
			: navigator.userAgent.toLowerCase().includes('linux')
				? 'linux'
				: 'other';

	return <PlatformContext.Provider value={{ type, platform }}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
	const ctx = useContext(PlatformContext);

	if (!ctx) throw new Error('PlatformProvider missing');

	return ctx;
}

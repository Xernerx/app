/** @format */

'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

type BackgroundStyle =
	| 'nebula'
	| 'none'
	| 'gradient-v'
	| 'gradient-h'
	| 'gradient-diag-l'
	| 'gradient-diag-r'
	| 'aurora'
	| 'spotlight'
	| 'halo'
	| 'edge-glow'
	| 'top-fade'
	| 'corners'
	| 'mesh'
	| 'ring';

type UISettings = {
	uiSpacing: 'compact' | 'default' | 'spacious';
	zoom: number;
};

type ThemeState = {
	mode: ThemeMode;
	accentColor: string;
	syncAcrossClients: boolean;
	background: BackgroundStyle;

	ui: UISettings;
};

type ThemeContextType = ThemeState & {
	setMode: (mode: ThemeMode) => void;
	setAccentColor: (color: string) => void;
	setSyncAcrossClients: (sync: boolean) => void;
	setBackground: (background: BackgroundStyle) => void;
	setUISpacing: (spacing: UISettings['uiSpacing']) => void;
	setZoom: (zoom: UISettings['zoom']) => void;
};

const STORAGE_KEY = 'xernerx-theme';
const CHANNEL = 'xernerx-theme-sync';

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyTheme(state: ThemeState) {
	const root = document.documentElement;

	let resolved = state.mode;

	if (state.mode === 'system') {
		resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	root.dataset.theme = resolved;
	root.style.setProperty('--accent', state.accentColor);

	const map: Record<BackgroundStyle, string> = {
		'nebula': 'var(--bg-nebula)',
		'none': '',
		'gradient-v': 'var(--bg-gradient-v)',
		'gradient-h': 'var(--bg-gradient-h)',
		'gradient-diag-l': 'var(--bg-gradient-diag-l)',
		'gradient-diag-r': 'var(--bg-gradient-diag-r)',
		'aurora': 'var(--bg-aurora)',
		'spotlight': 'var(--bg-spotlight)',
		'halo': 'var(--bg-halo)',
		'edge-glow': 'var(--bg-edge-glow)',
		'top-fade': 'var(--bg-edge-glow)',
		'corners': 'var(--bg-edge-glow)',
		'mesh': 'var(--bg-edge-glow)',
		'ring': 'var(--bg-edge-glow)',
	};

	root.style.setProperty('--bg-effect', map[state.background]);

	/* zoom */
	root.style.setProperty('--ui-zoom-scale', `${state.ui.zoom / 100}`);

	/* spacing */
	root.dataset.spacing = state.ui.uiSpacing;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const channelRef = useRef<BroadcastChannel | null>(null);
	const [state, setState] = useState<ThemeState>({
		mode: 'system',
		accentColor: '#8b7cf6',
		syncAcrossClients: true,
		background: 'nebula',

		ui: {
			uiSpacing: 'default',
			zoom: 100,
		},
	});

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);

		if (stored) {
			try {
				setState(JSON.parse(stored));
			} catch {}
		}
	}, []);

	useEffect(() => {
		channelRef.current = new BroadcastChannel(CHANNEL);

		channelRef.current.onmessage = (event) => {
			setState((prev) => {
				if (JSON.stringify(prev) === JSON.stringify(event.data)) return prev;
				return event.data;
			});
		};

		return () => channelRef.current?.close();
	}, []);

	useEffect(() => {
		applyTheme(state);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

		if (state.syncAcrossClients) {
			channelRef.current?.postMessage(state);
		}
	}, [state]);

	useEffect(() => {
		const channel = new BroadcastChannel(CHANNEL);

		channel.onmessage = (event) => {
			setState((prev) => {
				const next = event.data;

				// ignore identical state updates
				if (JSON.stringify(prev) === JSON.stringify(next)) return prev;

				return next;
			});
		};

		return () => channel.close();
	}, []);

	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)');

		const listener = () => {
			if (state.mode === 'system') applyTheme(state);
		};

		media.addEventListener('change', listener);
		return () => media.removeEventListener('change', listener);
	}, [state]);

	const value: ThemeContextType = {
		...state,

		setMode: (mode) => setState((s) => ({ ...s, mode })),

		setAccentColor: (color) => setState((s) => ({ ...s, accentColor: color })),

		setSyncAcrossClients: (sync) => setState((s) => ({ ...s, syncAcrossClients: sync })),

		setBackground: (background) => setState((s) => ({ ...s, background })),

		setUISpacing: (spacing) => setState((s) => ({ ...s, ui: { ...s.ui, uiSpacing: spacing } })),

		setZoom: (zoom) => setState((s) => ({ ...s, ui: { ...s.ui, zoom } })),
	};

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
	return ctx;
}

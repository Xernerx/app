/** @format */

import './globals.css';

import { CookieBanner } from '@/components/Cookie';
import { CookieProvider } from '@/providers/CookieProvider';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Main from '@/components/Main';
import type { Metadata } from 'next';
import { SessionProvider } from '@/providers/SessionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
	title: 'Xernerx Studios',
	description: 'Xernerx Studios',
	icons: {
		icon: '/icon.svg',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
try {
	const theme = JSON.parse(localStorage.getItem('xernerx-theme'));

	if (theme?.accentColor) {
		document.documentElement.style.setProperty('--accent', theme.accentColor);
	}

	if (theme?.mode) {
		document.documentElement.dataset.theme =
			theme.mode === 'system'
				? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
				: theme.mode;
	}

	if (theme?.ui?.uiSpacing) {
		document.documentElement.dataset.spacing = theme.ui.uiSpacing;
	}

	if (theme?.ui?.zoom) {
		document.documentElement.style.setProperty('--ui-zoom-scale', theme.ui.zoom / 100);
	}
} catch {}
`,
					}}
				/>
			</head>

			<body className='h-full'>
				<SessionProvider>
					<ThemeProvider>
						<div id='app-root' className='h-full w-full overflow-hidden bg-(--bg-main)'>
							<div className='flex flex-col h-full'>
								<CookieProvider>
									<div className='flex flex-col h-full'>
										<Header />

										<div
											className='flex flex-1'
											style={{
												paddingTop: 60,
												background: 'var(--bg-main)',
											}}>
											<div className='flex flex-1 overflow-hidden rounded-xl bg-(--bg-panel)'>
												<Main>{children}</Main>
											</div>
										</div>

										<CookieBanner />
										<Footer />
									</div>
								</CookieProvider>
							</div>
						</div>
					</ThemeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}

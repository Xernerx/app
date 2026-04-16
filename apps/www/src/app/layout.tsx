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
	description: 'Xernerx Studios builds scalable tools, platforms, and infrastructure for modern communities and developers. Discover our story and what we are creating.',

	metadataBase: new URL('https://www.xernerx.com'),

	openGraph: {
		title: 'Xernerx Studios',
		description: 'A platform-focused studio building modern tools, infrastructure, and applications for developers and communities.',
		url: 'https://www.xernerx.com',
		siteName: 'Xernerx Studios',
		images: [
			{
				url: '/banner.png',
				width: 1200,
				height: 630,
				alt: 'Xernerx Studios',
			},
		],
		type: 'website',
		locale: 'en_US',
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Xernerx Studios',
		description: 'Building modern tools, scalable platforms, and infrastructure for the next generation of applications.',
		images: ['/banner.png'],
	},

	icons: {
		icon: '/logo.png',
	},

	alternates: {
		canonical: 'https://www.xernerx.com',
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

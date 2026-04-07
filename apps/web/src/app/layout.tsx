/** @format */

import './globals.css';

import { DebugProvider } from '@/providers/DebugProvider';
import Header from '@/components/Header';
import Main from '@/components/Main';
import type { Metadata } from 'next';
import { PlatformProvider } from '@/providers/PlatformProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { UserProvider } from '@/providers/UserProvider';
import { authOptions } from '@/lib/schema/auth';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
	title: 'Xernerx',
	description: 'yes',
	icons: {
		icon: '/logo.png',
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getServerSession(authOptions);

	return (
		<html lang='en' className='h-full' suppressHydrationWarning>
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
				<SessionProvider session={session}>
					<UserProvider>
						<ThemeProvider>
							<DebugProvider>
								<ToastProvider>
									<PlatformProvider>
										<div id='app-root' className='h-full w-full overflow-hidden bg-(--bg-main)'>
											<SidebarProvider>
												<div className='flex flex-col h-full'>
													{/* Header */}
													<Header />

													{/* Sidebar + Main */}
													<div className='flex flex-1 overflow-hidden'>
														<Sidebar />

														<Main>{children}</Main>
													</div>
												</div>
											</SidebarProvider>
										</div>
									</PlatformProvider>
								</ToastProvider>
							</DebugProvider>
						</ThemeProvider>
					</UserProvider>
				</SessionProvider>
			</body>
		</html>
	);
}

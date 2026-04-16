/** @format */

'use client';

import { signOut, useSession } from 'next-auth/react';

import { useEffect } from 'react';
import { useSidebar } from '@/providers/SidebarProvider';

export default function Main({ children }: { children: React.ReactNode }) {
	const { state } = useSidebar();
	const { data: session } = useSession();

	useEffect(() => {
		if (session?.message === '401: Unauthorized') signOut();
	});

	return (
		<main
			className={`flex-1 overflow-y-auto bg-(--bg-panel) ${state == 'hidden' ? 'rounded-xl' : 'rounded-tl-xl'} p-8`}
			style={{
				background: `var(--bg-effect), var(--bg-panel)`,
			}}>
			{children}
		</main>
	);
}

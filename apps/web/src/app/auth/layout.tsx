/** @format */
'use client';

import { signOut, useSession } from 'next-auth/react';

import { useEffect } from 'react';
import { useSidebar } from '@/providers/SidebarProvider';

export default function Layout({ children }: { children: React.Component }) {
	const { hide } = useSidebar();
	const { data: session } = useSession();

	useEffect(() => {
		if (session?.message === '401: Unauthorized') signOut();

		hide();
	}, [hide]);

	return <>{children}</>;
}

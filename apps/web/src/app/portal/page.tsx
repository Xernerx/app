/** @format */

'use client';

import { Bot, Building2, LucideHome } from 'lucide-react';

import Bots from '@/components/portal/Bots';
import Organizations from '@/components/portal/Organizations';
import { useEffect } from 'react';
import { useSidebar } from '@/providers/SidebarProvider';

export default function Page() {
	const { clearNavItems, setNavItems, view, setView } = useSidebar();

	useEffect(() => {
		setView('bots');
		setNavItems([
			{ label: 'Home', icon: <LucideHome />, href: '/' },
			{ label: 'Bots', icon: <Bot />, onClick: () => setView('bots'), view: 'bots' },
			{ label: 'Organizations', icon: <Building2 />, onClick: () => setView('organizations'), view: 'organizations' },
		]);

		return () => clearNavItems();
	}, []);

	return (
		<div>
			{view === 'bots' && <Bots />}
			{view === 'organizations' && <Organizations />}
		</div>
	);
}

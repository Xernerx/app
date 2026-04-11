/** @format */

'use client';

import { Bot, Link, LucideHome, Server, Settings, Terminal, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import AdminOverview from '@/components/admin/Overview';
import ConsolePanel from '@/components/admin/Console';
import InviteManager from '@/components/admin/Invite';
import { Roles } from '@/lib/roles';
import { useSidebar } from '@/providers/SidebarProvider';
import { useUser } from '@/providers/UserProvider';

export default function Page() {
	const { setNavItems, clearNavItems, setView, view } = useSidebar();
	const user = useUser();

	const [permissions, setPermissions] = useState<string[]>([]);

	useEffect(() => {
		const permissions: string[] = [];
		const items: any = [];
		setView('overview');

		if (user.role === Roles.Owner) permissions.push('owner', 'admin', 'moderator');
		if (user.role === Roles.Admin) permissions.push('admin', 'moderator');
		if (user.role === Roles.Moderator) permissions.push('moderator');

		setPermissions(permissions);

		if (permissions.includes('owner')) items.push({ label: 'console', icon: <Terminal />, onClick: () => setView('console'), view: 'console' });
		if (permissions.includes('admin'))
			items.push(
				{ label: 'Bots', icon: <Bot />, onClick: () => setView('bots'), view: 'bots' },
				{ label: 'Servers', icon: <Server />, onClick: () => setView('servers'), view: 'servers' },
				{ label: 'Users', icon: <User />, onClick: () => setView('users'), view: 'users' }
			);
		if (permissions.includes('moderator')) items.push({ label: 'Invite', icon: <Link />, onClick: () => setView('invite'), view: 'invite' });

		setNavItems([{ label: 'Home', icon: <LucideHome />, href: '/' }, { label: 'Overview', icon: <LucideHome />, onClick: () => setView('overview'), view: 'overview' }, ...items]);

		return () => clearNavItems();
	}, [user]);

	return (
		<>
			{view === 'overview' && <AdminOverview />}
			{view === 'console' && <ConsolePanel permissions={permissions} />}
			{view === 'bots' && <>bots</>}
			{view === 'servers' && <>servers</>}
			{view === 'users' && <>users</>}
			{view === 'invite' && <InviteManager />}
		</>
	);
}

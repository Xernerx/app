/** @format */
'use client';

import { Home, KeyRound, Palette, User } from 'lucide-react';

import Account from '@/components/account/Account';
import Appearance from '@/components/account/Appearance';
import Tokens from '@/components/account/Tokens';
import { useEffect } from 'react';
import { useSidebar } from '@/providers/SidebarProvider';

export default function Page() {
	const { setNavItems, clearNavItems, view, setView } = useSidebar();

	useEffect(() => {
		setView('Account');

		setNavItems([
			{ icon: <Home />, label: 'Home', href: '/' },
			{ icon: <User />, label: 'Account', onClick: () => setView('Account'), view: 'Account' },
			{ icon: <Palette />, label: 'Appearance', onClick: () => setView('Appearance'), view: 'Appearance' },
			{ icon: <KeyRound />, label: 'Tokens', onClick: () => setView('Tokens'), view: 'Tokens' },
		]);

		return () => clearNavItems();
	}, []);

	return (
		<div className='flex flex-col gap-8'>
			{/* Page Header */}
			<div className='flex flex-col gap-1'>
				<h1 className='text-3xl font-semibold text-(--text-main)'>Account Settings</h1>
			</div>

			{/* Page Content */}
			<div className='flex flex-col gap-6'>
				{view === 'Account' && (
					<div className='flex flex-col gap-6'>
						<Account />
					</div>
				)}

				{view === 'Appearance' && (
					<div className='flex flex-col gap-6'>
						<Appearance />
					</div>
				)}

				{view === 'Tokens' && (
					<div className='flex flex-col gap-6'>
						<Tokens />
					</div>
				)}
			</div>
		</div>
	);
}

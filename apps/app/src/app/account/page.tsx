/** @format */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Home, KeyRound, Palette, User } from 'lucide-react';

import Account from '@/components/account/Account';
import Appearance from '@/components/account/Appearance';
import Profile from '@/components/account/Profile';
import Tokens from '@/components/account/Tokens';
import { useEffect } from 'react';
import { useSidebar } from '@/providers/SidebarProvider';
import { useUser } from '@/providers/UserProvider';

export default function Page() {
	const { setNavItems, clearNavItems, view, setView } = useSidebar();
	const { user } = useUser();

	useEffect(() => {
		setView('Account');

		setNavItems([
			{ icon: <Home />, label: 'Home', href: '/' },
			{ icon: <User />, label: 'Account', onClick: () => setView('Account'), view: 'Account' },
			{ icon: <User />, label: 'Profile', onClick: () => setView('Profile'), view: 'Profile' },
			{ icon: <Palette />, label: 'Appearance', onClick: () => setView('Appearance'), view: 'Appearance' },
			{ icon: <KeyRound />, label: 'Tokens', onClick: () => setView('Tokens'), view: 'Tokens' },
		]);

		return () => clearNavItems();
	}, []);

	return (
		<div
			className='flex flex-col w-full'
			style={{
				padding: 'calc(var(--ui-gap) * 2)',
				gap: 'calc(var(--ui-gap) * 2)',
			}}>
			{/* HEADER */}
			<div className='flex flex-col' style={{ gap: 4 }}>
				<h1 className='text-xl font-semibold'>Account Settings</h1>
				<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
					Manage your account, profile, and preferences.
				</p>
			</div>

			{/* CONTENT */}
			<AnimatePresence mode='wait'>
				<motion.div
					key={view}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -6 }}
					transition={{ duration: 0.15 }}
					className='flex flex-col w-full'
					style={{ gap: 'calc(var(--ui-gap) * 2)' }}>
					{view === 'Account' && <Account />}
					{view === 'Profile' && <Profile />}
					{view === 'Appearance' && <Appearance />}
					{view === 'Tokens' && <Tokens />}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

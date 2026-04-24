/** @format */
'use client';

import Banner from '@/../public/banner.svg';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function Header() {
	const { data: session } = useSession();
	const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

	return (
		<motion.header
			initial={{ y: -16, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.25, ease: 'easeOut' }}
			style={{
				width: '100%',
				height: 60,
				display: 'flex',
				alignItems: 'center',
				padding: '0 calc(var(--ui-gap) * 1.6)',
				background: 'var(--bg-main)',
				color: 'var(--text-main)',
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				zIndex: 50,
			}}>
			{/* LEFT */}
			<Link href='/'>
				<div className='h-8 flex items-center'>
					<Banner className='h-full w-auto' style={{ color: 'var(--accent)' }} />
				</div>
			</Link>

			{/* SPACER */}
			<div style={{ flex: 1 }} />

			{/* RIGHT */}
			<div className='flex items-center'>
				<Link href={appUrl || 'https://canary.xernerx.com'} className='group relative flex items-center h-9 rounded-full px-2 transition-all duration-200'>
					{/* BACKGROUND */}
					<div
						className='absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition'
						style={{
							background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
						}}
					/>

					{/* CONTENT */}
					<div className='relative flex items-center'>
						{/* ICON / AVATAR */}
						<div className='flex items-center justify-center w-6 h-6'>
							{session?.user?.image ? <Image src={session.user.image} alt='User' width={24} height={24} className='rounded-full' /> : <LayoutDashboard size={18} />}
						</div>

						{/* TEXT */}
						<span
							className='ml-2 text-sm whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-30 group-hover:opacity-100 transition-all duration-200'
							style={{ color: 'var(--text-main)' }}>
							Dashboard
						</span>
					</div>
				</Link>
			</div>
		</motion.header>
	);
}

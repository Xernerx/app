/** @format */

'use client';

import { signIn, useSession } from 'next-auth/react';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { redirect } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
	const { data: session } = useSession();

	const [loading, setLoading] = useState(false);

	async function handleLogin() {
		setLoading(true);
		await signIn('discord');
	}

	if (session) return redirect('/');

	return (
		<div className='h-full flex items-center justify-center px-6'>
			<motion.div
				initial={{ opacity: 0, scale: 0.96, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
				className='flex flex-col items-center text-center'
				style={{
					gap: 'calc(var(--ui-gap) * 1.5)',
				}}>
				<div className='flex flex-col items-center gap-4'>
					<Image src='/banner.png' alt='Xernerx' width={740} height={240} priority className='select-none pointer-events-none' />
				</div>

				<motion.button
					onClick={handleLogin}
					disabled={loading}
					whileHover={!loading ? { scale: 1.02, y: -1 } : undefined}
					whileTap={!loading ? { scale: 0.985 } : undefined}
					className='rounded-xl px-6 py-3 text-sm font-medium border transition disabled:opacity-60 disabled:cursor-not-allowed'
					style={{
						background: 'var(--accent)',
						borderColor: 'color-mix(in srgb, var(--accent) 18%, white 8%)',
						color: 'var(--text-main)',
						boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
						minWidth: 240,
					}}>
					{loading ? 'Redirecting…' : 'Continue with Discord'}
				</motion.button>
			</motion.div>
		</div>
	);
}

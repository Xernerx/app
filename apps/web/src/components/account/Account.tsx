/** @format */
'use client';

import { LogOut, Trash2, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

import { motion } from 'framer-motion';

export default function Account() {
	const { data: session } = useSession();

	return (
		<div className='flex flex-col mx-auto w-full max-w-4xl' style={{ gap: 'var(--ui-gap)' }}>
			{/* USER INFO */}
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className='rounded-xl border border-white/10 p-5 flex flex-col gap-4'
				style={{ background: 'var(--container)' }}>
				<div className='flex items-center gap-3'>
					<User size={18} style={{ color: 'var(--accent)' }} />
					<div>
						<h2 className='text-lg font-semibold'>User Information</h2>
						<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
							Account details for your Xernerx profile.
						</p>
					</div>
				</div>

				<div className='flex flex-col text-sm gap-1'>
					<p>
						Signed in as <span className='font-medium'>@{session?.username}</span>
					</p>
					<p>
						Using <span className='font-medium'>{session?.email}</span> as email
					</p>
				</div>
			</motion.div>

			{/* LOG OUT */}
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.05 }}
				className='rounded-xl border border-white/10 p-5 flex flex-col gap-4'
				style={{ background: 'var(--container)' }}>
				<div className='flex items-center gap-3'>
					<LogOut size={18} style={{ color: 'var(--accent)' }} />
					<div>
						<h2 className='text-lg font-semibold'>Log Out</h2>
						<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
							End your current session.
						</p>
					</div>
				</div>

				<button
					onClick={() => signOut()}
					className='flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition border'
					style={{
						background: 'var(--accent)',
						color: 'white',
						border: 'transparent',
					}}>
					<LogOut size={14} />
					Log Out
				</button>
			</motion.div>

			{/* DELETE DATA */}
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2, delay: 0.1 }}
				className='rounded-xl border border-red-500/20 p-5 flex flex-col gap-4'
				style={{ background: 'var(--container)' }}>
				<div className='flex items-center gap-3'>
					<Trash2 size={18} className='text-red-400' />
					<div>
						<h2 className='text-lg font-semibold'>User Data</h2>
						<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
							Permanently delete your stored user data.
						</p>
					</div>
				</div>

				<button className='flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition border border-red-500/40 text-red-400 hover:bg-red-500/10' onClick={() => true}>
					<Trash2 size={14} />
					Delete User Data
				</button>
			</motion.div>
		</div>
	);
}

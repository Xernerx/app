/** @format */

'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { motion } from 'framer-motion';

type Member = {
	id: string;
	username: string;
	avatar_url: string;
	status: 'online' | 'idle' | 'dnd' | 'offline';
};

const statusColor: Record<Member['status'], string> = {
	online: 'bg-green-500',
	idle: 'bg-yellow-400',
	dnd: 'bg-red-500',
	offline: 'bg-gray-400',
};

export default function Supporters() {
	const [supporters, setSupporters] = useState<Member[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch('https://canary.discord.com/api/guilds/687429190165069838/widget.json');
				const guild = await res.json();
				setSupporters(guild.members || []);
			} catch {
				setSupporters([]);
			}
		};

		fetchData();
		const interval = setInterval(fetchData, 60000);
		return () => clearInterval(interval);
	}, []);

	if (!supporters.length) return null;

	return (
		<div className='space-y-4'>
			<h1 className='text-xl font-semibold'>Our Supporting Members</h1>

			<div className='flex flex-wrap gap-3'>
				{supporters.map((s, i) => (
					<div className='group' key={i}>
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.03 }}
							className='flex items-center rounded-xl border transition-all cursor-pointer'
							style={{
								borderColor: 'var(--border)',
								background: 'var(--bg-main)',
								padding: '6px 8px',
							}}>
							{/* avatar */}
							<div className='relative flex-shrink-0'>
								<Image src={s.avatar_url} alt={s.username} width={36} height={36} className='h-10 w-10 rounded-full object-cover' />

								<span
									className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2`}
									style={{
										borderColor: 'var(--bg-main)',
										background: s.status === 'online' ? 'rgb(34,197,94)' : s.status === 'idle' ? 'rgb(234,179,8)' : s.status === 'dnd' ? 'rgb(239,68,68)' : 'rgb(148,163,184)',
									}}
								/>
							</div>

							{/* username */}
							<div className='overflow-hidden max-w-0 group-hover:max-w-[140px] transition-all duration-300'>
								<span
									className='text-sm whitespace-nowrap'
									style={{
										color: 'var(--text-main)',
										paddingLeft: 8,
										paddingRight: 8,
									}}>
									{s.username}
								</span>
							</div>
						</motion.div>
					</div>
				))}
			</div>
		</div>
	);
}

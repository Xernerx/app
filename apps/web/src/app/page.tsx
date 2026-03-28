/** @format */
'use client';

import { Compass, Layers, LayoutDashboard, Search, Shield, ShieldCheck } from 'lucide-react';

import { Roles } from '@/lib/roles';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { usePlatform } from '@/providers/PlatformProvider';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/providers/SidebarProvider';

export default function Home() {
	const { type } = usePlatform();
	const { setNavItems, clearNavItems, show } = useSidebar();
	const { data: session } = useSession();

	useEffect(() => {
		show();

		const items = [
			{ label: 'Explore', icon: <Compass />, href: '/explore' },
			{ label: 'Dashboard', icon: <LayoutDashboard />, href: '/dashboard' },
			{ label: 'Portal', icon: <Layers />, href: '/portal' },
		];

		if (session?.role === Roles.Owner || session?.role === Roles.Admin) items.push({ label: 'Admin', icon: <ShieldCheck />, href: '/admin' });

		setNavItems(items);

		return () => clearNavItems();
	}, []);

	return (
		<div className='flex flex-col gap-6'>
			{/* HERO */}
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				className='relative overflow-hidden rounded-3xl border p-8'
				style={{
					borderColor: 'var(--border)',
					background: 'var(--bg-panel)',
				}}>
				{/* subtle background glow */}
				<div
					className='absolute inset-0'
					style={{
						background: 'radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 14%, transparent), transparent 40%)',
					}}
				/>

				<div className='relative flex flex-col gap-6'>
					<div className='flex flex-col gap-2'>
						<h1 className='text-3xl font-semibold tracking-tight' style={{ color: 'var(--text-main)' }}>
							Xernerx App
						</h1>

						<p
							className='max-w-xl text-sm leading-6'
							style={{
								color: 'color-mix(in srgb, var(--text-main) 65%, transparent)',
							}}>
							Manage bots, servers, and organizations in one place. Clean, structured, and not held together by duct tape. Mostly.
						</p>
					</div>

					{/* SEARCH */}
					<div
						className='flex items-center gap-3 rounded-2xl border px-4 py-3'
						style={{
							borderColor: 'var(--border)',
							background: 'color-mix(in srgb, var(--bg-main) 45%, var(--bg-panel))',
						}}>
						<Search
							className='h-4 w-4'
							style={{
								color: 'color-mix(in srgb, var(--text-main) 55%, transparent)',
							}}
						/>

						<input type='search' placeholder='Search bots, servers, organizations...' className='w-full bg-transparent text-sm outline-none' style={{ color: 'var(--text-main)' }} />
					</div>
				</div>
			</motion.div>

			{/* QUICK ACTIONS */}
			<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className='grid gap-4 md:grid-cols-3'>
				{[
					{
						label: 'Explore',
						desc: 'Browse public bots and servers',
						icon: <Compass className='h-5 w-5' />,
						href: '/explore',
					},
					{
						label: 'Dashboard',
						desc: 'Manage your servers and our services for your servers',
						icon: <LayoutDashboard className='h-5 w-5' />,
						href: '/dashboard',
					},
					{
						label: 'Portal',
						desc: 'Developer portal for developers to manage their bots and organizations',
						icon: <Layers className='h-5 w-5' />,
						href: '/portal',
					},
				].map((item) => (
					<a
						key={item.label}
						href={item.href}
						className='group rounded-3xl border p-5 transition hover:scale-[1.02]'
						style={{
							borderColor: 'var(--border)',
							background: 'color-mix(in srgb, var(--bg-panel) 82%, transparent)',
						}}>
						<div className='flex flex-col gap-3'>
							<div
								className='flex h-10 w-10 items-center justify-center rounded-2xl border'
								style={{
									borderColor: 'var(--border)',
									background: 'color-mix(in srgb, var(--bg-main) 35%, var(--bg-panel))',
								}}>
								{item.icon}
							</div>

							<div className='flex flex-col gap-1'>
								<span className='text-sm font-semibold' style={{ color: 'var(--text-main)' }}>
									{item.label}
								</span>

								<span
									className='text-xs'
									style={{
										color: 'color-mix(in srgb, var(--text-main) 60%, transparent)',
									}}>
									{item.desc}
								</span>
							</div>
						</div>
					</a>
				))}
			</motion.div>

			{/* SESSION NOTICE */}
			{/* SESSION NOTICE */}
			{!session && (
				<motion.a
					href='/api/auth/signin'
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					whileHover={{ scale: 1.01 }}
					className='group relative overflow-hidden rounded-2xl border px-4 py-4 text-sm transition'
					style={{
						borderColor: 'color-mix(in srgb, var(--accent) 22%, var(--border))',
						background: 'color-mix(in srgb, var(--accent) 10%, var(--bg-panel))',
					}}>
					{/* glow */}
					<div
						className='absolute inset-0 opacity-0 transition group-hover:opacity-100'
						style={{
							background: 'radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 18%, transparent), transparent 45%)',
						}}
					/>

					<div className='relative flex items-center justify-between gap-4'>
						<div className='flex flex-col'>
							<span className='font-medium' style={{ color: 'var(--text-main)' }}>
								Sign in required
							</span>

							<span
								className='text-xs'
								style={{
									color: 'color-mix(in srgb, var(--text-main) 65%, transparent)',
								}}>
								Unlock dashboard, bots, and organizations.
							</span>
						</div>

						<span className='text-xs font-medium opacity-70 transition group-hover:opacity-100' style={{ color: 'var(--text-main)' }}>
							Sign in →
						</span>
					</div>
				</motion.a>
			)}

			{/* INSTALL NOTICE */}
			{type === 'browser' && (
				<motion.a
					href='/download' // or wherever you handle install
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					whileHover={{ scale: 1.01 }}
					className='group relative overflow-hidden rounded-2xl border px-4 py-4 text-sm transition'
					style={{
						borderColor: 'color-mix(in srgb, var(--accent) 22%, var(--border))',
						background: 'color-mix(in srgb, var(--accent) 10%, var(--bg-panel))',
					}}>
					{/* glow */}
					<div
						className='absolute inset-0 opacity-0 transition group-hover:opacity-100'
						style={{
							background: 'radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 18%, transparent), transparent 45%)',
						}}
					/>

					<div className='relative flex items-center justify-between gap-4'>
						<div className='flex flex-col'>
							<span className='font-medium' style={{ color: 'var(--text-main)' }}>
								Install Xernerx App
							</span>

							<span
								className='text-xs'
								style={{
									color: 'color-mix(in srgb, var(--text-main) 65%, transparent)',
								}}>
								Get a faster, native experience with full features.
							</span>
						</div>

						<span className='text-xs font-medium opacity-70 transition group-hover:opacity-100' style={{ color: 'var(--text-main)' }}>
							Install →
						</span>
					</div>
				</motion.a>
			)}
		</div>
	);
}

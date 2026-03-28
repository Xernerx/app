/** @format */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Folder, Globe, IdCard, LogIn, Monitor, PieChart, QrCode, Settings, Timer, TimerIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import QRCode from 'react-qr-code';
import { usePlatform } from '@/providers/PlatformProvider';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/providers/SidebarProvider';

export default function Sidebar() {
	const profileRef = useRef<HTMLDivElement | null>(null);
	const profileButtonRef = useRef<HTMLButtonElement | null>(null);
	const { state, navItems, view, setView } = useSidebar();
	const { type } = usePlatform();
	const { data: session } = useSession();
	const router = useRouter();

	const [openProfile, setOpenProfile] = useState(false);
	const [profileView, setProfileView] = useState<'card' | 'status'>('card');
	const [status, setStatus] = useState<any>({});
	const [qr, setQr] = useState(false);
	const [profileMenu, setProfileMenu] = useState(false);

	useEffect(() => {
		async function fetchStatus() {
			const start = performance.now();

			const response = await fetch('/api/v1/status').then((res) => res.json());

			response.server.latency = Math.round(performance.now() - start);

			setStatus(response);

			setTimeout(fetchStatus, 10000);
		}

		fetchStatus();
	}, []);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			const target = event.target as Node;

			if (profileRef.current && !profileRef.current.contains(target) && profileButtonRef.current && !profileButtonRef.current.contains(target)) {
				setOpenProfile(false);
				setProfileMenu(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	if (state === 'hidden') return null;

	const avatarDecoration = session?.avatar_decoration_data?.asset && `https://cdn.discordapp.com/avatar-decoration-presets/${session.avatar_decoration_data.asset}.webp`;

	const nameplate = session?.collectibles?.nameplate && `https://cdn.discordapp.com/assets/collectibles/${session.collectibles.nameplate.asset}asset.webm`;

	return (
		<motion.aside
			animate={{ width: state === 'open' ? 300 : 70 }}
			transition={{ duration: 0.25, ease: 'easeOut' }}
			className='h-full flex flex-col px-[calc(var(--ui-gap)*0.75)] py-[calc(var(--ui-gap)*0.75)]'
			style={{
				gap: 'calc(var(--ui-gap) * 0.5)',
				background: 'var(--bg-main)',
				color: 'var(--text-main)',
			}}>
			<div className='flex flex-col gap-1'>
				{navItems.map((item, i) => {
					const active = view === item.view;

					return (
						<button
							key={i}
							onClick={() => {
								if (item.view) setView(item.view);
								if (item.href) router.push(item.href);
								item.onClick?.();
							}}
							className={`flex items-center rounded-md transition px-3 py-2 ${state === 'open' ? 'gap-2 justify-start' : 'justify-center'}`}
							style={{
								background: active ? 'var(--accent)' : 'transparent',
								color: active ? '#fff' : 'var(--text-main)',
							}}
							onMouseEnter={(e) => {
								if (!active) e.currentTarget.style.background = 'var(--container)';
							}}
							onMouseLeave={(e) => {
								if (!active) e.currentTarget.style.background = 'transparent';
							}}>
							{item.icon}

							<AnimatePresence>
								{state === 'open' && (
									<motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }} className='whitespace-nowrap'>
										{item.label}
									</motion.span>
								)}
							</AnimatePresence>
						</button>
					);
				})}
			</div>

			<div className='mt-auto relative'>
				{session ? (
					<>
						{/* OPEN SIDEBAR PROFILE */}
						{state === 'open' && (
							<div className='relative rounded-xl overflow-hidden backdrop-blur p-2' style={{ background: 'var(--container)' }}>
								{nameplate && (
									<video autoPlay loop muted playsInline className='absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none'>
										<source src={nameplate} type='video/webm' />
									</video>
								)}

								<div className='relative flex items-center justify-between gap-2'>
									<button ref={profileButtonRef} onClick={() => setOpenProfile(!openProfile)} className='flex items-center gap-3 group w-full text-left'>
										<div className='relative'>
											<img src={`https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}.png`} className='w-10 h-10 rounded-full' />

											{avatarDecoration && <img src={avatarDecoration} className='absolute inset-0 scale-[1.15] pointer-events-none' />}

											<div className='absolute -bottom-1 -right-1 bg-(--bg-main) p-1 rounded-full'>{type === 'browser' ? <Globe size={12} /> : <Monitor size={12} />}</div>
										</div>

										<div className='flex flex-col overflow-hidden'>
											<span className='text-sm font-medium truncate'>{session.global_name ?? session.username}</span>
											<span className='text-xs opacity-60 truncate'>@{session.username}</span>
										</div>
									</button>

									<button onClick={() => router.push('/account')} className='p-2 rounded-lg hover:bg-white/10 transition'>
										<Settings size={16} />
									</button>
								</div>
							</div>
						)}

						{/* COLLAPSED SIDEBAR PROFILE */}
						{state !== 'open' && (
							<div className='flex justify-center'>
								<button onClick={() => setProfileMenu(!profileMenu)} className='relative'>
									<img src={`https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}.png`} className='w-10 h-10 rounded-full' />

									{avatarDecoration && <img src={avatarDecoration} className='absolute inset-0 scale-[1.15] pointer-events-none' />}
								</button>
							</div>
						)}

						{/* COLLAPSED PROFILE MENU */}
						<AnimatePresence>
							{profileMenu && state !== 'open' && (
								<motion.div
									ref={profileRef}
									initial={{ x: -10, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									exit={{ x: -10, opacity: 0 }}
									transition={{ duration: 0.15 }}
									className='absolute bottom-0 left-full ml-2 bg-[#020617] border border-white/10 rounded-lg shadow-xl p-2 flex flex-col gap-2'>
									<button
										onClick={() => {
											setProfileMenu(false);
											setOpenProfile(true);
										}}
										className='p-2 rounded-md hover:bg-white/10'>
										<IdCard size={18} />
									</button>

									<button onClick={() => router.push('/account')} className='p-2 rounded-md hover:bg-white/10'>
										<Settings size={18} />
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</>
				) : (
					<Nav icon={<LogIn size={18} />} label='Sign In' onClick={() => router.push('/auth/login')} />
				)}
			</div>

			<AnimatePresence>
				{openProfile && session && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{
							duration: 0.18,
							ease: [0.22, 1, 0.36, 1],
						}}
						style={{ background: 'var(--bg-panel)', width: 'calc(16rem * var(--zoom) / 100)' }}
						className='absolute min-w-[16rem] bottom-20 left-3 rounded-xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl'>
						{profileView === 'card' && (
							<div>
								<div className='relative'>
									{session.banner && <img src={`https://cdn.discordapp.com/banners/${session.id}/${session.banner}?size=4096`} className='w-full h-24 object-cover' />}

									<img src={`https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}?size=4096`} className='absolute left-3 -bottom-8 w-16 h-16 rounded-full border-4 border-[#020617]' />
								</div>

								<div className='pt-10 px-4 pb-4 space-y-2'>
									<div className='font-semibold'>{session.global_name ?? session.username}</div>

									<div className='text-xs opacity-60'>@{session.username}</div>

									{session.clan?.identity_enabled && (
										<div className='flex items-center gap-2 text-xs opacity-80'>
											<img src={`https://cdn.discordapp.com/clan-badges/${session.clan.identity_guild_id}/${session.clan.badge}.png`} className='h-4 w-4' />

											<span className='font-semibold'>{session.clan.tag}</span>
										</div>
									)}

									<button
										onClick={() => navigator.clipboard.writeText(session.id)}
										className='flex items-center justify-center gap-2 w-full text-xs bg-black/30 px-3 py-2 rounded-md hover:bg-black/40 transition'>
										<IdCard size={14} />
										Copy ID
									</button>
								</div>
							</div>
						)}

						{profileView === 'status' && !qr && (
							<div className='p-4 space-y-4 text-xs'>
								<h1 className='font-semibold mb-2 flex items-center gap-2' style={{ color: 'var(--accent)' }}>
									<Globe size={16} /> Environment
								</h1>

								<div className='space-y-2 text-xs'>
									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span>Mode</span>
										<span className='font-semibold' style={{ color: 'var(--accent)' }}>
											{status.environment}
										</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span className='flex items-center gap-2'>
											<Monitor size={14} /> Web
										</span>

										<div className='flex gap-2'>
											<a style={{ color: 'var(--accent)' }} className='p-1 rounded hover:bg-blue-500/30 text-blue-400' href={status.urls?.https}>
												<Globe size={14} />
											</a>

											<a style={{ color: 'var(--accent)' }} className='px-2 py-1 text-[10px] rounded' href={`${status.urls?.http}:${status.ports?.web}`}>
												LAN
											</a>

											<a style={{ color: 'var(--accent)' }} className='p-1 rounded  ' href={`${status.urls?.host}:${status.ports?.web}`}>
												<Monitor size={14} />
											</a>
										</div>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span className='flex items-center gap-2'>
											<Monitor size={14} /> Mobile
										</span>

										<div className='flex gap-2'>
											<a style={{ color: 'var(--accent)' }} className='p-1 rounded text-blue-400' href={`${status.urls?.http}:${status.ports?.mobile}`}>
												<Globe size={14} />
											</a>

											<button style={{ color: 'var(--accent)' }} onClick={() => setQr(true)} className='p-1 rounded'>
												<QrCode size={14} />
											</button>
										</div>
									</div>
								</div>

								<h1 className='font-semibold mb-2 flex items-center gap-2' style={{ color: 'var(--accent)' }}>
									<Timer size={16} /> Server
								</h1>

								<div className='space-y-2 text-xs'>
									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span className='flex items-center gap-2'>
											<Clock size={14} />
											Time
										</span>

										<span style={{ color: 'var(--accent)' }}>{status.server?.time}</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span className='flex items-center gap-2'>
											<TimerIcon size={14} />
											Timezone
										</span>

										<span style={{ color: 'var(--accent)' }}>{status.server?.timezone}</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span>Uptime</span>
										<span className='text-emerald-400 font-semibold'>{status.server?.uptime}s</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span>Memory</span>
										<span className='text-blue-400'>
											{status.server?.memory?.usedMB}/{status.server?.memory?.totalMB}
										</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span>Latency</span>
										<span className='text-yellow-400'>{status.server?.latency}ms</span>
									</div>
								</div>

								<h1 className='font-semibold mb-2 flex items-center gap-2' style={{ color: 'var(--accent)' }}>
									<Folder size={16} /> Database
								</h1>

								<div className='space-y-2 text-xs'>
									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span>Connection</span>

										<span className={`font-semibold ${status.database?.status === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>{status.database?.status}</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span>Pool Size</span>
										<span>{status.database?.poolSize}</span>
									</div>
								</div>
							</div>
						)}

						{profileView === 'status' && qr && (
							<div className='p-6 flex flex-col items-center gap-3'>
								<QRCode value={`exp://${status.urls?.http}:${status.ports?.mobile}`} size={120} />

								<button onClick={() => setQr(false)} className='text-xs bg-black/30 px-3 py-1 rounded-md'>
									Close
								</button>
							</div>
						)}

						<div className='flex '>
							<TabButton active={profileView === 'card'} onClick={() => setProfileView('card')} icon={<IdCard size={16} />} position={'left'} />

							<TabButton active={profileView === 'status'} onClick={() => setProfileView('status')} icon={<PieChart size={16} />} position='right' />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.aside>
	);
}

function Nav({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
	return (
		<motion.button
			whileHover={{ x: 4 }}
			whileTap={{ scale: 0.97 }}
			onClick={onClick}
			className='group flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition
			bg-transparent hover:bg-slate-800/60'>
			<div className='flex items-center justify-center w-8 h-8 rounded-md group-hover:text-indigo-400 transition'>
				<span className='text-slate-300 group-hover:text-indigo-400'>{icon}</span>
			</div>

			<span className='truncate text-slate-200 group-hover:text-indigo-400'>{label}</span>
		</motion.button>
	);
}

function TabButton({ active, onClick, icon, position }: { active: boolean; onClick: () => void; icon: React.ReactNode; position: 'left' | 'right' }) {
	const inactiveShape = position === 'left' ? 'rounded-tr-lg' : 'rounded-tl-lg';

	return (
		<button
			onClick={onClick}
			className={`flex-1 flex justify-center items-center py-2 transition relative ${active ? 'bg-transparent' : `border border-white/10 border-b-0 ${inactiveShape} bg-[rgba(0,0,0,0.2)]`}`}>
			<span className={`transition `} style={{ color: active ? 'var(--accent)' : 'var(--text-muted) hover:bg-accent-hover)' }}>
				{icon}
			</span>
		</button>
	);
}

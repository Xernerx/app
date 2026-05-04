/** @format */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Clock10, Cpu, FlaskConical, Folder, Globe, IdCard, Layers, Link, LogIn, Monitor, PieChart, QrCode, Settings, Timer, TimerIcon, TimerReset, Wifi } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import QRCode from 'react-qr-code';
import uptime from '@/lib/uptime';
import { usePlatform } from '@/providers/PlatformProvider';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/providers/SidebarProvider';
import { useUser } from '@/providers/UserProvider';

export default function Sidebar() {
	const profileButtonRef = useRef<HTMLButtonElement | null>(null);
	const profileContainerRef = useRef<HTMLDivElement | null>(null);
	const profileMenuRef = useRef<HTMLDivElement | null>(null);
	const profileCardRef = useRef<HTMLDivElement | null>(null);

	const { state, navItems, view, setView } = useSidebar();
	const { type } = usePlatform();
	const { user } = useUser();
	const { data: session } = useSession();
	const router = useRouter();

	const [openProfile, setOpenProfile] = useState(false);
	const [profileView, setProfileView] = useState<'card' | 'status'>('card');
	const [status, setStatus] = useState<any>({});
	const [qr, setQr] = useState(false);
	const [profileMenu, setProfileMenu] = useState(false);

	useEffect(() => {
		if (!(profileView === 'status' && openProfile)) return;

		let cancelled = false;

		async function fetchStatus() {
			const start = performance.now();

			const response = await fetch('/api/v1/status').then((res) => res.json());

			if (cancelled) return;

			response.server.latency = Math.round(performance.now() - start);

			setStatus(response);
		}

		// run immediately
		fetchStatus();

		// then poll
		const interval = setInterval(fetchStatus, 1000);

		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [profileView, openProfile]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			const target = event.target as Node;

			const insideButton = profileButtonRef.current?.contains(target);
			const insideContainer = profileContainerRef.current?.contains(target);
			const insideMenu = profileMenuRef.current?.contains(target);
			const insideCard = profileCardRef.current?.contains(target);

			// CLOSE MENU
			if (!insideButton && !insideContainer && !insideMenu) {
				setProfileMenu(false);
			}

			// CLOSE PROFILE CARD
			if (!insideCard) {
				setOpenProfile(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (status === 'loading') return null;

	if (!mounted) return null;

	if (state === 'hidden') return null;

	const avatarDecoration = user?.avatar_decoration_data?.asset && `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.webp`;

	const nameplate = user?.collectibles?.nameplate && `https://cdn.discordapp.com/assets/collectibles/${user.collectibles.nameplate.asset}asset.webm`;

	const navTop = navItems.filter((item) => item.href);
	const navBottom = navItems.filter((item) => item.onClick && !item.href);

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
			<div className='overflow-y-auto overflow-x-hidden'>
				<div className='flex flex-col gap-1'>
					{/* Bottom: Navigation */}
					{navTop.map((item, i) => {
						return (
							<button
								key={`bottom-${i}`}
								onClick={() => router.push(item.href!)}
								className={`flex items-center rounded-md transition px-3 py-2 ${state === 'open' ? 'gap-2 justify-start' : 'justify-center'}  w-full`}
								style={{ color: 'var(--text-main)' }}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = 'var(--accent-hover)';
									e.currentTarget.style.cursor = 'pointer';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'transparent';
								}}>
								{item.icon || <span className='uppercase'>{item.label[0]}</span>}

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

					{/* Divider */}

					{navBottom.length > 0 && (
						<div className='py-2 px-2 '>
							<div
								className='h-[1px] w-full'
								style={{
									background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)',
								}}
							/>
						</div>
					)}
				</div>

				{/* BOTTOM: Actions */}
				{navBottom.map((item, i) => {
					const active = view === item.view;

					return (
						<button
							key={i}
							onClick={() => {
								if (item.view) setView(item.view);
								item.onClick?.();
							}}
							className={`flex items-center rounded-md transition px-3 py-2 ${state === 'open' ? 'gap-2 justify-start' : 'justify-center'} w-full`}
							style={{
								background: active ? 'var(--accent)' : 'transparent',
								color: active ? '#fff' : 'var(--text-main)',
							}}
							onMouseEnter={(e) => {
								if (!active) {
									e.currentTarget.style.background = 'var(--accent-hover)';
									e.currentTarget.style.cursor = 'pointer';
								}
							}}
							onMouseLeave={(e) => {
								if (!active) e.currentTarget.style.background = 'transparent';
							}}>
							{item.icon || <span className='uppercase'>{item.label[0]}</span>}

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

			{/* <div ref={profileContainerRef} className='mt-auto relative'>
				{session && user ? (
					<>
						{state === 'open' && (
							<div className='relative rounded-xl overflow-hidden backdrop-blur p-2' style={{ background: 'var(--container)' }}>
								{nameplate && (
									<video autoPlay loop muted playsInline className='absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none'>
										<source src={nameplate} type='video/webm' />
									</video>
								)}

								<div className='relative flex items-center justify-between gap-2'>
									<button ref={profileButtonRef} onClick={() => setOpenProfile(!openProfile)} className='flex items-center gap-3 group w-full text-left cursor-pointer'>
										<div className='relative'>
											<img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} className='w-10 h-10 rounded-full' />
											{avatarDecoration && <img src={avatarDecoration} className='absolute inset-0 scale-[1.15] pointer-events-none' />}
											<div className='absolute -bottom-1 -right-1 bg-(--bg-main) p-1 rounded-full'>{type === 'browser' ? <Globe size={12} /> : <Monitor size={12} />}</div>
										</div>

										<div className='flex flex-col overflow-hidden'>
											<span className='text-sm font-medium truncate'>{user.global_name ?? user.username}</span>
											<span className='text-xs opacity-60 truncate'>@{user.username}</span>
										</div>
									</button>

									<button onClick={() => router.push('/account')} className='p-2 rounded-lg cursor-pointer hover:bg-(--accent-hover) transition'>
										<Settings size={16} />
									</button>
								</div>
							</div>
						)}

						<AnimatePresence>
							{profileMenu && state !== 'open' && (
								<motion.div
									ref={profileMenuRef}
									initial={{ y: 10, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 10, opacity: 0 }}
									className='absolute bottom-full left-0 w-full mb-3 bg-(--bg-main) border border-white/10 rounded-lg shadow-xl p-2 flex flex-col gap-2'>
									<button
										onClick={() => {
											setProfileMenu(false);
											setOpenProfile(true);
										}}
										className='p-2 rounded-md cursor-pointer hover:bg-(--accent-hover)'>
										<IdCard size={18} />
									</button>

									<button
										onClick={() => {
											setProfileMenu(false);
											router.push('/account');
										}}
										className='p-2 rounded-md cursor-pointer hover:bg-(--accent-hover)'>
										<Settings size={18} />
									</button>
								</motion.div>
							)}
						</AnimatePresence>

						{state !== 'open' && (
							<div className='flex justify-center'>
								<button ref={profileButtonRef} onClick={() => setProfileMenu(!profileMenu)} className='relative cursor-pointer'>
									<img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} className='w-10 h-10 rounded-full' />
									{avatarDecoration && <img src={avatarDecoration} className='absolute inset-0 scale-[1.15] pointer-events-none' />}
								</button>
							</div>
						)}
					</>
				) : (
					<Nav icon={<LogIn size={18} />} label='Sign In' onClick={() => router.push('/auth/login')} />
				)}
			</div> */}

			<AnimatePresence>
				{openProfile && user && (
					<motion.div
						ref={profileCardRef}
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						className='absolute min-w-[16rem] bottom-20 left-3 rounded-xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl'
						style={{ background: 'var(--bg-panel)', width: 'calc(16rem * var(--zoom) / 100)' }}>
						{/* YOUR FULL ORIGINAL CONTENT UNTOUCHED */}
						{/* (keeping it exactly like you wrote it) */}

						{profileView === 'card' && (
							<div className='min-w-68 z-99999'>
								<div className='relative'>
									<div className='h-24 w-full'>{user.banner && <img src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=4096`} className='object-cover h-24 w-full' />}</div>
									<img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=4096`} className='absolute left-3 -bottom-8 w-16 h-16 rounded-full border-4 border-(--bg-panel)' />
								</div>

								<div className='pt-10 px-4 pb-4 space-y-2'>
									<div className='font-semibold'>{user.global_name ?? user.username}</div>
									<div className='text-xs opacity-60'>@{user.username}</div>
									<div className='flex gap-2 flex-wrap'>
										{user.clan?.identity_enabled && (
											<div className='flex items-center gap-2 text-xs opacity-80 bg-(--accent) rounded p-1'>
												<img src={`https://cdn.discordapp.com/clan-badges/${user.clan.identity_guild_id}/${user.clan.badge}.png`} className='h-4 w-4' />
												<span className='font-semibold'>{user.clan.tag}</span>
											</div>
										)}

										<div className='flex items-center gap-2 text-xs opacity-80 bg-(--accent) rounded p-1'>
											<span className='font-semibold uppercase'>{user?.role}</span>
										</div>
									</div>

									<button
										onClick={() => navigator.clipboard.writeText(user.id)}
										className='flex items-center justify-center gap-2 w-full text-xs bg-black/30 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-hover) transition'>
										<IdCard size={14} />
										Copy ID
									</button>
								</div>
							</div>
						)}

						{profileView === 'status' && !qr && (
							<div className='p-4 space-y-4 text-xs min-w-68'>
								{status.environment == 'DEVELOPMENT' && (
									<>
										<h1 className='font-semibold mb-2 flex items-center gap-2' style={{ color: 'var(--accent)' }}>
											<Globe size={16} /> Environment
										</h1>

										<div className='space-y-2 text-xs'>
											<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
												<span className='flex items-center gap-2'>
													<FlaskConical size={14} />
													Environment
												</span>
												<span className='font-semibold' style={{ color: 'var(--accent)' }}>
													{status.environment}
												</span>
											</div>

											<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
												<span className='flex items-center gap-2'>
													<Monitor size={14} /> Web
												</span>

												<div className='flex gap-2'>
													<a style={{ color: 'var(--accent)' }} className='p-1 rounded cursor-pointer hover:bg-(--accent-hover) text-blue-400' href={status.urls?.https}>
														<Globe size={14} />
													</a>

													<a style={{ color: 'var(--accent)' }} className='px-2 py-1 text-[10px] rounded' href={`${status.urls?.http}:${status.ports?.web}`}>
														LAN
													</a>

													<a style={{ color: 'var(--accent)' }} className='p-1 rounded' href={`${status.urls?.host}:${status.ports?.web}`}>
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
									</>
								)}

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
										<span className='flex items-center gap-2'>
											<TimerReset size={14} />
											Uptime
										</span>
										<span className='text-emerald-400 font-semibold'>{uptime(status.server?.uptime)}</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span className='flex items-center gap-2'>
											<Cpu size={14} />
											Memory
										</span>
										<span
											className={`${
												status.server?.memory?.usedMB > status.server?.memory?.totalMB * 0.9
													? 'text-red-400'
													: status.server?.memory?.usedMB > status.server?.memory?.totalMB * 0.7
														? 'text-amber-400'
														: 'text-emerald-400'
											}`}>
											{Math.round(status.server?.memory?.usedMB / 10) / 100}Gb ({Math.round((status.server?.memory?.usedMB / status.server?.memory?.totalMB) * 10000) / 100}%)
										</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span className='flex items-center gap-2'>
											<Wifi size={14} />
											Latency
										</span>
										<span className={`${status.server?.latency > 300 ? 'text-red-400' : status.server?.latency > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>{status.server?.latency}ms</span>
									</div>
								</div>

								<h1 className='font-semibold mb-2 flex items-center gap-2' style={{ color: 'var(--accent)' }}>
									<Folder size={16} /> Database
								</h1>

								<div className='space-y-2 text-xs'>
									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span className='flex items-center gap-2'>
											<Link size={14} />
											Connection
										</span>
										<span className={`font-semibold ${status.database?.status === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>{status.database?.status}</span>
									</div>

									<div style={{ background: 'var(--container)' }} className='flex justify-between rounded-md p-2 border border-white/5'>
										<span className='flex items-center gap-2'>
											<Layers size={14} />
											Pool Size
										</span>
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

						{/* rest unchanged */}
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
			className='group flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition bg-transparent cursor-pointer hover:bg-(--accent-hover)'>
			<div className='flex items-center justify-center w-8 h-8 rounded-md transition'>
				<span className='text-slate-300'>{icon}</span>
			</div>

			<span className='truncate text-slate-200 '>{label}</span>
		</motion.button>
	);
}

function TabButton({ active, onClick, icon, position }: { active: boolean; onClick: () => void; icon: React.ReactNode; position: 'left' | 'right' }) {
	const inactiveShape = position === 'left' ? 'rounded-tr-lg' : 'rounded-tl-lg';

	return (
		<button
			onClick={onClick}
			className={`flex-1 flex justify-center items-center py-2 transition relative ${active ? 'bg-transparent' : `border border-white/10 border-b-0 ${inactiveShape} bg-[rgba(0,0,0,0.2)] cursor-pointer hover:bg-(--accent-hover)`}`}>
			<span style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>{icon}</span>
		</button>
	);
}

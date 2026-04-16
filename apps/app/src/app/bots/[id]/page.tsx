/** @format */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BarChart3, IdCard, LucideHome, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useSidebar } from '@/providers/SidebarProvider';

type Bot = {
	id: string;
	description?: string;
	info?: string;
	owners?: string[];
	organization?: string;
	verified?: boolean;
	privacy?: 'public' | 'private' | 'limited';
	links?: Record<string, string>;
	commands?: { id: string; name: string; description: string }[];
};

type DiscordProfile = {
	id: string;
	username: string;
	avatar?: string;
	banner?: string;
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { setNavItems, setView, view } = useSidebar();

	const [id, setId] = useState<string>();
	const [loading, setLoading] = useState(true);

	const [bot, setBot] = useState<Bot | null>(null);
	const [profile, setProfile] = useState<DiscordProfile | null>(null);
	const [profileExists, setProfileExists] = useState<boolean | null>(null);

	// =========================
	// INIT
	// =========================
	useEffect(() => {
		(async () => {
			setView('about');

			setNavItems([
				{ label: 'Home', href: '/', icon: <LucideHome /> },
				{ label: 'Back to explore', href: '/explore', icon: <ArrowLeft /> },
				{ label: 'about', onClick: () => setView('about'), icon: <IdCard />, view: 'about' },
				{ label: 'statistics', onClick: () => setView('statistics'), icon: <BarChart3 />, view: 'statistics' },
				{ label: 'commands', onClick: () => setView('commands'), icon: <Terminal />, view: 'commands' },
			]);

			const resolved = await params;
			setId(resolved.id);
		})();
	}, []);

	// =========================
	// FETCH
	// =========================
	useEffect(() => {
		if (!id) return;

		(async () => {
			try {
				const [botRes, profileRes] = await Promise.all([fetch(`/api/v1/bots/${id}/profile`), fetch(`/api/v1/discord/users/${id}/profile`)]);

				if (profileRes.ok) {
					const data = await profileRes.json();
					setProfile(data.user);
					setProfileExists(true);
				} else {
					setProfile(null);
					setProfileExists(false);
				}

				if (botRes.ok) {
					const data = await botRes.json();
					setBot(data);
				} else {
					setBot(null);
				}
			} catch {
				setBot(null);
				setProfile(null);
				setProfileExists(false);
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	// =========================
	// LOADING
	// =========================
	if (loading || profileExists === null) {
		return (
			<div style={{ padding: '2rem' }}>
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
					Loading...
				</motion.div>
			</div>
		);
	}

	const banner = profile?.banner && `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}?size=2048`;
	const avatar = profile?.avatar && `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;

	// =========================
	// BOT NOT IN SYSTEM / DOESNT EXIST
	// =========================
	if (!bot) {
		const title = profile?.username || id;
		const message = profileExists ? 'This bot exists but is not registered in our system.' : 'This bot does not exist.';

		return (
			<div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					style={{
						borderRadius: '1rem',
						overflow: 'hidden',
						border: '1px solid var(--border)',
						background: 'var(--container)',
					}}>
					<div style={{ height: '140px', background: '#111' }}>
						{banner && (
							<img
								src={banner}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									filter: 'brightness(0.5)',
								}}
							/>
						)}
					</div>

					<div style={{ padding: '1.5rem', paddingTop: '3rem', position: 'relative' }}>
						<div
							style={{
								position: 'absolute',
								top: '-40px',
								left: '1.5rem',
								width: '80px',
								height: '80px',
								borderRadius: '50%',
								border: '4px solid var(--container)',
								overflow: 'hidden',
								background: '#222',
							}}>
							{avatar && <img src={avatar} style={{ width: '100%', height: '100%' }} />}
						</div>

						<div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{title}</div>
						<div style={{ opacity: 0.6 }}>{id}</div>

						<div
							style={{
								marginTop: '1rem',
								padding: '0.75rem',
								borderRadius: '0.5rem',
								background: 'rgba(239,68,68,0.15)',
								color: '#ef4444',
								fontSize: '0.9rem',
							}}>
							{message}
						</div>
					</div>
				</motion.div>
			</div>
		);
	}

	// =========================
	// MAIN PAGE
	// =========================
	return (
		<div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
			{/* HEADER */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25 }}
				style={{
					borderRadius: '1rem',
					overflow: 'hidden',
					border: '1px solid var(--border)',
					background: 'var(--container)',
				}}>
				<div style={{ height: '180px', background: '#111' }}>
					{banner && (
						<img
							src={banner}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								filter: 'brightness(0.6)',
							}}
						/>
					)}
				</div>

				<div style={{ padding: '1.5rem', paddingTop: '3rem', position: 'relative' }}>
					<div
						style={{
							position: 'absolute',
							top: '-40px',
							left: '1.5rem',
							width: '80px',
							height: '80px',
							borderRadius: '50%',
							border: '4px solid var(--container)',
							overflow: 'hidden',
							background: '#222',
						}}>
						{avatar && <img src={avatar} style={{ width: '100%', height: '100%' }} />}
					</div>

					<div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile?.username || bot.id}</div>
					<div style={{ opacity: 0.6 }}>{bot.id}</div>

					<div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
						{bot.verified && <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>Verified</span>}
						<span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{bot.privacy}</span>
					</div>
				</div>
			</motion.div>

			{/* VIEWS */}
			<div style={{ marginTop: '1.5rem' }}>
				<AnimatePresence mode='wait'>
					<motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
						{view === 'about' && (
							<>
								<h2>Description</h2>
								<p>{bot.description || 'No description provided.'}</p>

								{bot.info && (
									<>
										<h2 style={{ marginTop: '1rem' }}>About</h2>
										<p>{bot.info}</p>
									</>
								)}
							</>
						)}

						{view === 'statistics' && <div style={{ opacity: 0.6 }}>Statistics coming soon.</div>}

						{view === 'commands' && (
							<>
								<h2>Commands</h2>

								{bot.commands?.length ? (
									<div style={{ display: 'grid', gap: '0.5rem' }}>
										{bot.commands.map((cmd) => (
											<motion.div
												key={cmd.id}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												initial={{ opacity: 0, y: 6 }}
												animate={{ opacity: 1, y: 0 }}
												style={{
													padding: '0.75rem',
													borderRadius: '0.5rem',
													background: 'var(--container)',
													border: '1px solid var(--border)',
												}}>
												<div style={{ fontWeight: 600 }}>{cmd.name}</div>
												<div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{cmd.description}</div>
											</motion.div>
										))}
									</div>
								) : (
									<div style={{ opacity: 0.6 }}>No commands available.</div>
								)}
							</>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}

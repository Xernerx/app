/** @format */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bot as BotIcon, LucideHome, Server } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { useSidebar } from '@/providers/SidebarProvider';

type Bot = {
	_id: string;
	id: string;
	privacy: 'public' | 'private' | 'limited';
	description: string;
};

type ProfileMap = Record<string, any>;

export default function Page() {
	const { setNavItems, clearNavItems, setView, view } = useSidebar();

	const [search, setSearch] = useState('');
	const [bots, setBots] = useState<Bot[]>([]);
	const [profiles, setProfiles] = useState<ProfileMap>({});

	// INIT
	useEffect(() => {
		setView(['Bots', 'Servers'].includes(view!) ? view : 'Bots');

		setNavItems([
			{ label: 'Home', href: '/', icon: <LucideHome /> },
			{ label: 'Bots', onClick: () => setView('Bots'), icon: <BotIcon />, view: 'Bots' },
			{ label: 'Servers', onClick: () => setView('Servers'), icon: <Server />, view: 'Servers' },
		]);

		return () => clearNavItems();
	}, []);

	// FETCH BOTS
	useEffect(() => {
		(async () => {
			const b = await fetch('/api/v1/bots?all=true&privacy=public').then((res) => res.json());
			setBots(b);
		})();
	}, []);

	const filtered = bots.filter((b) => b.id.toLowerCase().includes(search.toLowerCase()));

	return (
		<>
			{/* SEARCH */}
			<motion.input
				type='search'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder={view === 'Servers' ? 'Search servers...' : 'Search bots...'}
				initial={{ opacity: 0, y: -5 }}
				animate={{ opacity: 1, y: 0 }}
				style={{
					marginBottom: '1rem',
					padding: '0.5rem 0.75rem',
					borderRadius: '0.5rem',
					border: '1px solid var(--border)',
					background: 'var(--container)',
					width: '100%',
				}}
			/>

			{/* VIEW SWITCH */}
			<AnimatePresence mode='wait'>
				<motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
					{/* ================= BOTS ================= */}
					{view === 'Bots' && (
						<motion.div
							layout
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
								gap: '1rem',
							}}>
							<AnimatePresence>
								{filtered.map((bot) => (
									<BotCard key={bot.id} bot={bot} profiles={profiles} setProfiles={setProfiles} />
								))}
							</AnimatePresence>
						</motion.div>
					)}

					{/* ================= SERVERS ================= */}
					{view === 'Servers' && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.7 }}
							style={{
								padding: '2rem',
								borderRadius: '0.75rem',
								border: '1px dashed var(--border)',
								background: 'var(--container)',
								textAlign: 'center',
							}}>
							<div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Servers</div>
							<div style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.6 }}>This is a placeholder. Nothing lives here yet. Just like your backend dreams.</div>
						</motion.div>
					)}
				</motion.div>
			</AnimatePresence>
		</>
	);
}

function BotCard({ bot, profiles, setProfiles }: { bot: Bot; profiles: ProfileMap; setProfiles: any }) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [visible, setVisible] = useState(false);

	// INTERSECTION
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15 }
		);

		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	// LAZY FETCH
	useEffect(() => {
		if (!visible) return;
		if (profiles[bot.id]) return;

		(async () => {
			const profile = await fetch(`/api/v1/discord/users/${bot.id}/profile`).then((res) => res.json());

			setProfiles((prev: ProfileMap) => ({
				...prev,
				[bot.id]: profile.user,
			}));
		})();
	}, [visible]);

	const profile = profiles[bot.id];

	const banner = profile?.banner ? `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}?size=1024` : null;

	const avatar = profile?.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null;

	return (
		<motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
			<Link href={`bots/${bot.id}`}>
				<motion.div
					ref={ref}
					whileHover={{ y: -6, scale: 1.02 }}
					whileTap={{ scale: 0.97 }}
					transition={{ type: 'spring', stiffness: 300, damping: 20 }}
					style={{
						position: 'relative',
						borderRadius: '0.75rem',
						overflow: 'hidden',
						border: '1px solid var(--border)',
						background: 'var(--container)',
						cursor: 'pointer',
					}}>
					{/* BANNER */}
					<div style={{ height: '80px', position: 'relative', background: '#111' }}>
						{banner && (
							<motion.img
								src={banner}
								initial={{ scale: 1.05 }}
								animate={{ scale: 1 }}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									filter: 'brightness(0.6)',
								}}
							/>
						)}

						<div
							style={{
								position: 'absolute',
								inset: 0,
								background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))',
							}}
						/>
					</div>

					{/* CONTENT */}
					<div style={{ padding: '1rem', paddingTop: '2.5rem', position: 'relative' }}>
						{/* AVATAR */}
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							style={{
								position: 'absolute',
								top: '-20px',
								left: '1rem',
								borderRadius: '50%',
								border: '3px solid var(--container)',
								overflow: 'hidden',
								width: '40px',
								height: '40px',
								background: '#222',
							}}>
							{avatar && <img src={avatar} style={{ width: '100%', height: '100%' }} />}
						</motion.div>

						<div style={{ fontWeight: 600 }}>{profile ? profile.username : bot.id}</div>
						<div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{bot.id}</div>

						<div
							style={{
								marginTop: '0.75rem',
								fontSize: '0.85rem',
								opacity: 0.8,
								lineHeight: 1.4,
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
							}}>
							{bot.description || 'No description provided.'}
						</div>

						<AnimatePresence>
							{!profile && visible && (
								<motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
									Loading profile...
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			</Link>
		</motion.div>
	);
}

/** @format */

'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

const inputStyle = {
	borderColor: 'var(--border)',
	background: 'color-mix(in srgb, var(--bg-main) 45%, var(--bg-panel))',
	color: 'var(--text-main)',
};
export default function Virtue({ id }: { id?: string }) {
	const [profile, setProfile] = useState<any | null>(null);
	const [loading, setLoading] = useState(false);

	const [state, setState] = useState({
		mode: 'balanced',
		cycles: {
			daily: false,
			weekly: false,
			monthly: false,
		},
		roles: {
			ignored: [] as string[],
			tracked: [] as string[],
		},
		saving: false,
	});

	useEffect(() => {
		if (!id) return;

		let cancelled = false;

		(async () => {
			try {
				setProfile(null);
				setLoading(true);

				const res = await fetch(`/api/v1/virtue/guilds/${id}`);
				const data = await res.json();

				if (!cancelled && res.ok) {
					setProfile(data);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [id]);

	useEffect(() => {
		if (!profile) return;

		setState((prev) => ({
			...prev,
			mode: profile.mode ?? 'balanced',
			cycles: {
				daily: profile.cycles?.daily ?? false,
				weekly: profile.cycles?.weekly ?? false,
				monthly: profile.cycles?.monthly ?? false,
			},
			roles: {
				ignored: profile.roles?.ignored ?? [],
				tracked: profile.roles?.tracked ?? [],
			},
		}));
	}, [profile]);

	if (!id) return null;

	// 🔥 LOADING
	if (loading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='flex items-center gap-2 text-sm opacity-60'>
					<Loader2 className='h-4 w-4 animate-spin' />
					Loading Virtue...
				</div>
			</div>
		);
	}

	// 🚫 BOT NOT INSTALLED / NO PROFILE
	if (!profile) {
		return (
			<div className='w-full py-16'>
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					className='relative w-full rounded-3xl border p-8'
					style={{
						borderColor: 'var(--border)',
						background: 'color-mix(in srgb, var(--bg-panel) 88%, transparent)',
					}}>
					{/* glow */}
					<div
						className='pointer-events-none absolute inset-0 rounded-3xl'
						style={{
							background: 'radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%)',
						}}
					/>

					<div className='relative flex flex-col items-center justify-center gap-5 text-center'>
						<div
							className='flex h-16 w-16 items-center justify-center rounded-2xl border'
							style={{
								borderColor: 'color-mix(in srgb, var(--accent) 30%, var(--border))',
								background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
							}}>
							<Sparkles className='h-7 w-7' />
						</div>

						<div className='max-w-xl'>
							<h2 className='text-xl font-semibold'>Virtue isn’t part of this server yet</h2>

							<p
								className='pt-4 pb-4 text-sm leading-relaxed'
								style={{
									color: 'color-mix(in srgb, var(--text-main) 70%, transparent)',
								}}>
								Virtue is a Discord bot focused on community engagement through leveling systems. Track progress globally or per server, and configure resets for monthly, weekly, or even daily cycles
								— or keep it as a traditional ever-growing system. Invite Virtue to this server to start configuring it.
							</p>
						</div>

						<a
							href='/invite/virtue'
							className='inline-flex items-center justify-center rounded-2xl border px-6 py-3 text-sm font-medium transition hover:scale-[1.04]'
							style={{
								borderColor: 'color-mix(in srgb, var(--accent) 35%, var(--border))',
								background: 'color-mix(in srgb, var(--accent) 16%, transparent)',
								color: 'var(--text-main)',
							}}>
							Invite Virtue
						</a>
					</div>
				</motion.div>
			</div>
		);
	}

	// ✅ BOT EXISTS → actual UI now

	async function save() {
		setState((s) => ({ ...s, saving: true }));

		try {
			await fetch(`/api/v1/virtue/guilds/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mode: state?.mode,
					cycles: state?.cycles,
					roles: state?.roles,
				}),
			});
		} finally {
			setState((s) => ({ ...s, saving: false }));
		}
	}

	return (
		<div
			className='rounded-3xl border p-6'
			style={{
				borderColor: 'var(--border)',
				background: 'color-mix(in srgb, var(--bg-panel) 88%, transparent)',
			}}>
			<div className='flex flex-col gap-6'>
				{/* HEADER */}
				<div>
					<h2 className='text-lg font-semibold'>Virtue Settings</h2>
					<p className='text-sm mt-1' style={{ color: 'color-mix(in srgb, var(--text-main) 65%, transparent)' }}>
						Configure leveling behavior and tracking rules.
					</p>
				</div>

				{/* MODE */}
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-medium'>Level Mode</label>

					<select value={state.mode} onChange={(e) => setState((s) => ({ ...s, mode: e.target.value }))} className='rounded-2xl border px-4 py-3 text-sm outline-none transition' style={inputStyle}>
						{['easy', 'casual', 'balanced', 'hard', 'extreme'].map((m) => (
							<option key={m} value={m}>
								{m.charAt(0).toUpperCase() + m.slice(1)}
							</option>
						))}
					</select>
				</div>

				{/* CYCLES */}
				<div className='flex flex-col gap-3'>
					<label className='text-sm font-medium'>Reset Cycles</label>

					<div className='grid grid-cols-3 gap-2'>
						{(['daily', 'weekly', 'monthly'] as const).map((key) => {
							const active = state.cycles?.[key] ?? false;

							return (
								<button
									key={key}
									onClick={() =>
										setState((s) => ({
											...s,
											cycles: {
												...s.cycles,
												[key]: !active,
											},
										}))
									}
									className='rounded-2xl border px-4 py-2 text-sm transition'
									style={{
										borderColor: active ? 'color-mix(in srgb, var(--accent) 35%, var(--border))' : 'var(--border)',
										background: active ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'color-mix(in srgb, var(--bg-panel) 76%, transparent)',
									}}>
									{key}
								</button>
							);
						})}
					</div>
				</div>

				{/* ROLES */}
				<div className='flex flex-col gap-3'>
					<label className='text-sm font-medium'>Roles</label>

					<input
						value={state.roles?.ignored?.join(',') || ''}
						onChange={(e) =>
							setState((s) => ({
								...s,
								roles: {
									...s.roles,
									ignored: e.target.value
										.split(',')
										.map((r) => r.trim())
										.filter(Boolean),
								},
							}))
						}
						placeholder='Ignored roles (comma separated)'
						className='rounded-2xl border px-4 py-3 text-sm outline-none'
						style={inputStyle}
					/>

					<input
						value={state.roles?.tracked?.join(',') || ''}
						onChange={(e) =>
							setState((s) => ({
								...s,
								roles: {
									...s.roles,
									tracked: e.target.value
										.split(',')
										.map((r) => r.trim())
										.filter(Boolean),
								},
							}))
						}
						placeholder='Tracked roles (comma separated)'
						className='rounded-2xl border px-4 py-3 text-sm outline-none'
						style={inputStyle}
					/>
				</div>

				{/* ACTIONS */}
				<div className='flex justify-end'>
					<button
						onClick={save}
						disabled={state.saving}
						className='rounded-2xl border px-5 py-2.5 text-sm font-medium transition hover:scale-[1.03]'
						style={{
							borderColor: 'color-mix(in srgb, var(--accent) 35%, var(--border))',
							background: 'color-mix(in srgb, var(--accent) 14%, transparent)',
						}}>
						{state.saving ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</div>
		</div>
	);
}

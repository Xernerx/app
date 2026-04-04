/** @format */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Copy, Info, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Token = {
	id: string;
	name: string;
	status: string;
};

type TokenDetails = {
	id: string;
	owners: string[];
	status: string;
	botId: string;
};

function getStatusColor(status?: string) {
	switch (status) {
		case 'active':
			return 'rgba(34,197,94,1)';
		case 'pending':
			return 'rgba(234,179,8,1)';
		case 'suspended':
			return 'rgba(239,68,68,1)';
		default:
			return 'rgba(100,116,139,1)';
	}
}

function withOpacity(color, opacity) {
	return color.replace(/rgba?\(([^)]+)\)/, (_, values) => {
		const [r, g, b] = values.split(',').map((v) => v.trim());
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	});
}

export default function Tokens() {
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [tokens, setTokens] = useState<Token[]>([]);
	const [open, setOpen] = useState<string | null>(null);

	const [tokenDetails, setTokenDetails] = useState<Record<string, TokenDetails>>({});
	const [owners, setOwners] = useState<Record<string, any[]>>({});
	const [bots, setBots] = useState<Record<string, any>>({});
	const [copied, setCopied] = useState<string | null>(null);

	const [creating, setCreating] = useState(false);
	const [newName, setNewName] = useState('');

	const [editing, setEditing] = useState<string | null>(null);
	const [editName, setEditName] = useState('');
	const [editOwners, setEditOwners] = useState<Record<string, string[]>>({});
	const [newOwnerId, setNewOwnerId] = useState<Record<string, string>>({});

	const [deleting, setDeleting] = useState<string | null>(null);

	async function handleTokenData(id: string) {
		if (open === id) return setOpen(null);
		setOpen(id);

		if (tokenDetails[id]) return;

		const t: TokenDetails = await fetch(`/api/v1/tokens/api/${id}`).then((res) => res.json());
		setTokenDetails((prev) => ({ ...prev, [id]: t }));

		const ownerData = await Promise.all(t.owners.map((o) => fetch(`/api/v1/discord/users/${o}`).then((r) => r.json())));
		setOwners((prev) => ({ ...prev, [id]: ownerData.map((d) => d.user) }));

		const bot = await fetch(`/api/v1/discord/users/${t.botId}`).then((r) => r.json());
		setBots((prev) => ({ ...prev, [id]: bot.user }));
	}

	function copyToClipboard(id: string) {
		navigator.clipboard.writeText(id);
		setCopied(id);
		setTimeout(() => setCopied(null), 1200);
	}

	async function createToken() {
		if (!newName.trim()) return;

		const res = await fetch('/api/v1/tokens/api/create', {
			method: 'POST',
			body: JSON.stringify({ name: newName }),
		});

		if (!res.ok) return;

		const token = await res.json();

		setTokens((prev) => [token, ...prev]);
		setNewName('');
		setCreating(false);
	}

	async function saveEdit(id: string) {
		if (!editName.trim()) return;

		const res = await fetch(`/api/v1/tokens/api/${id}`, {
			method: 'PATCH',
			body: JSON.stringify({
				name: editName,
				owners: editOwners[id],
			}),
		});

		if (!res.ok) return;

		const updated = await res.json();

		setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, name: updated.name } : t)));
		setTokenDetails((prev) => ({ ...prev, [id]: updated }));

		const ownerData = await Promise.all(updated.owners.map((o: string) => fetch(`/api/v1/discord/users/${o}`).then((r) => r.json())));
		setOwners((prev) => ({
			...prev,
			[id]: ownerData.map((d) => d.user),
		}));

		setEditing(null);
	}

	async function confirmDelete(id: string) {
		await fetch(`/api/v1/tokens/api/${id}`, { method: 'DELETE' });
		setTokens((prev) => prev.filter((t) => t.id !== id));
		setDeleting(null);
		setOpen(null);
	}

	useEffect(() => {
		(async () => {
			const tokens = await fetch('/api/v1/tokens/api').then((r) => r.json());
			setTokens(tokens);
			setLoading(false);
		})();
	}, []);

	if (loading) {
		return <div className='flex items-center justify-center h-[60vh] text-(--text-muted)'>Loading tokens...</div>;
	}

	return (
		<div className='flex flex-col mx-auto w-full max-w-4xl' style={{ gap: 'calc(var(--ui-gap) * 2)', padding: 'calc(var(--ui-gap) * 2.5)' }}>
			{/* HEADER */}
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold'>Tokens</h1>

				<button onClick={() => setCreating(true)} className='flex items-center gap-2 px-4 py-2 rounded-md text-sm transition' style={{ background: 'var(--accent)', color: '#fff' }}>
					<Plus size={16} />
					New
				</button>
			</div>

			{/* SEARCH */}
			<input
				type='search'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder='Search tokens...'
				className='px-4 py-3 rounded-lg outline-none'
				style={{
					background: 'var(--container)',
					border: '1px solid var(--border)',
				}}
			/>

			{/* CREATE */}
			<AnimatePresence>
				{creating && (
					<motion.div
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						className='flex gap-2 p-4 rounded-xl'
						style={{
							background: 'var(--container)',
							border: '1px solid var(--border)',
						}}>
						<input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='Token name' className='flex-1 bg-transparent outline-none' />

						<button onClick={createToken}>
							<Check size={16} />
						</button>

						<button onClick={() => setCreating(false)}>
							<X size={16} />
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* LIST */}
			{tokens
				.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search))
				.map((t) => {
					const details = tokenDetails[t.id];
					const ownerList = owners[t.id];
					const bot = bots[t.id];
					const statusColor = getStatusColor(t?.status);

					return (
						<motion.div
							key={t.id}
							layout
							whileHover={{ y: -2 }}
							className='rounded-xl relative'
							style={{
								background: `
    linear-gradient(var(--container), var(--container)) padding-box,
    linear-gradient(to right, ${withOpacity(statusColor, 0.5)}, var(--border) 75%) border-box
  `,
								border: '1px solid var(--border)',
								borderRadius: '.5rem',
								padding: 'calc(var(--ui-gap) * 2)',
							}}>
							{/* HEADER */}
							<div className='flex justify-between items-center mb-3 w-full'>
								{editing === t.id ? (
									<input value={editName} onChange={(e) => setEditName(e.target.value)} className='bg-transparent outline-none' />
								) : (
									<h2 className='font-medium text-base'>{t.name}</h2>
								)}

								<div className='flex items-center gap-2'>
									{open === t.id && (
										<>
											{/* EDIT */}
											{editing === t.id ? (
												<>
													<button onClick={() => saveEdit(t.id)}>
														<Check size={16} />
													</button>
													<button onClick={() => setEditing(null)}>
														<X size={16} />
													</button>
												</>
											) : (
												<button
													onClick={() => {
														setEditing(t.id);
														setEditName(t.name);
														setEditOwners((prev) => ({
															...prev,
															[t.id]: [...(tokenDetails[t.id]?.owners || [])],
														}));
													}}>
													<Pencil size={16} />
												</button>
											)}

											{/* DELETE */}
											{deleting === t.id ? (
												<>
													<button onClick={() => confirmDelete(t.id)} className='text-red-400'>
														<Check size={16} />
													</button>
													<button onClick={() => setDeleting(null)}>
														<X size={16} />
													</button>
												</>
											) : (
												<button onClick={() => setDeleting(t.id)}>
													<Trash2 size={16} />
												</button>
											)}
										</>
									)}

									<button onClick={() => handleTokenData(t.id)}>{open === t.id ? <ChevronUp /> : <ChevronDown />}</button>
								</div>
							</div>

							{/* DETAILS */}
							<AnimatePresence>
								{open === t.id && (
									<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
										<div className='flex flex-col text-sm' style={{ gap: 'calc(var(--ui-gap) * 0.75)' }}>
											<div
												onClick={() => copyToClipboard(details?.id)}
												className='group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition'
												style={{
													background: 'var(--bg-main)',
													border: '1px solid var(--border)',
												}}>
												<span className='font-mono text-xs opacity-70 truncate pr-2'>{details?.id}</span>

												<div
													className='flex items-center justify-center w-6 h-6 rounded transition'
													style={{
														background: copied === details?.id ? 'var(--accent)' : 'transparent',
														color: copied === details?.id ? '#fff' : 'var(--text-muted)',
													}}>
													{copied === details?.id ? <Check size={14} /> : <Copy size={14} />}
												</div>
											</div>

											<div
												className='opacity-80 flex gap-2 items-center'
												title={`${details?.status == 'active' ? `This token is linked to ${bot?.username}.` : details?.status == 'suspended' ? 'This token has been suspended and is not allowed to send any requests.' : 'This token is not linked to a bot. When Posting to the API the status will update. Token can be used for anything.'}`}>
												{details?.status}
												<Info size={12} />
											</div>

											{/* BOT */}
											{bot && (
												<div className='flex items-center gap-2'>
													<img src={`https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.webp`} className='w-6 h-6 rounded-full' />
													<span>{bot?.username}</span>
												</div>
											)}

											{/* OWNERS */}
											<div>
												<strong className='text-xs opacity-70'>Owners</strong>

												<div className='mt-2 flex flex-col gap-2'>
													{(editing === t.id ? editOwners[t.id] : ownerList?.map((o) => o.id))?.map((id) => {
														const user = ownerList?.find((o) => o.id === id);

														return (
															<div key={id} className='flex items-center gap-2 px-3 py-2 rounded-md' style={{ background: 'var(--bg-main)' }}>
																{user && <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`} className='w-5 h-5 rounded-full' />}
																<span className='text-xs flex-1'>{user?.username || id}</span>

																{editing === t.id && (
																	<button
																		onClick={() =>
																			setEditOwners((prev) => ({
																				...prev,
																				[t.id]: prev[t.id].filter((o) => o !== id),
																			}))
																		}>
																		<X size={12} />
																	</button>
																)}
															</div>
														);
													})}
												</div>

												{editing === t.id && (
													<div className='flex gap-2 mt-2'>
														<input
															placeholder='User ID'
															value={newOwnerId[t.id] || ''}
															onChange={(e) =>
																setNewOwnerId((prev) => ({
																	...prev,
																	[t.id]: e.target.value,
																}))
															}
															className='flex-1 px-3 py-2 rounded-md w-full'
															style={{ background: 'var(--bg-main)' }}
														/>

														<button
															onClick={() => {
																const id = newOwnerId[t.id]?.trim();
																if (!id) return;

																setEditOwners((prev) => ({
																	...prev,
																	[t.id]: [...(prev[t.id] || []), id],
																}));

																setNewOwnerId((prev) => ({ ...prev, [t.id]: '' }));
															}}>
															<Plus size={14} />
														</button>
													</div>
												)}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					);
				})}
		</div>
	);
}

/** @format */

'use client';

import { AlertCircle, Check, Copy, ExternalLink, List, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { redirect } from 'next/navigation';
import { useSidebar } from '@/providers/SidebarProvider';
import { useToast } from '@/providers/ToastProvider';

export default function Page({ params }: { params: Promise<{ type: string }> }) {
	const invites: Record<string, string> = {
		virtue: 'https://discord.com/oauth2/authorize?client_id=1484880634844287138&permissions=4503874774883392&integration_type=0&scope=bot+applications.commands',
		xernerx: 'https://discord.com/oauth2/authorize?client_id=1319029435655000234&permissions=0&integration_type=0&scope=bot+applications.commands',
		zodiac: 'https://discord.com/oauth2/authorize?client_id=950251264095162418&permissions=0&integration_type=0&scope=bot+applications.commands',
		metamorphosis: 'https://discord.com/oauth2/authorize?client_id=881678826906730547&permissions=0&integration_type=0&scope=bot+applications.commands',
	};

	const { hide } = useSidebar();
	const { toast } = useToast();

	const [type, setType] = useState<string | null>(null);
	const [copied, setCopied] = useState<string | null>(null);

	useEffect(() => {
		hide();

		(async () => {
			const t = (await params).type;
			setType(t);

			if (invites[t]) {
				redirect(invites[t]);
			}
		})();
	}, []);

	function copyLink(key: string, link: string) {
		if (!link) return;

		navigator.clipboard.writeText(link);

		setCopied(key);
		toast(`Copied invite for ${key}`, 'success');

		setTimeout(() => setCopied(null), 1200);
	}

	if (!type) {
		return (
			<div style={{ padding: '2rem' }}>
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}>
					Loading...
				</motion.div>
			</div>
		);
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '2rem',
			}}>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.25 }}
				style={{
					width: '100%',
					maxWidth: '500px',
					borderRadius: '1rem',
					border: '1px solid var(--border)',
					background: 'var(--container)',
					padding: '1.5rem',
					boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
				}}>
				{/* HEADER */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
					<Sparkles size={18} />
					<h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Invite Center</h2>
				</div>

				{/* ERROR */}
				{type !== 'list' && !invites[type] && (
					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							padding: '0.75rem',
							borderRadius: '0.5rem',
							background: 'rgba(239,68,68,0.15)',
							color: '#ef4444',
							fontSize: '0.9rem',
							marginBottom: '1rem',
						}}>
						<AlertCircle size={16} />
						Couldn’t find an invite for "{type}"
					</motion.div>
				)}

				{/* LIST */}
				<div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
						<List size={16} />
						<span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Available invites</span>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
						<AnimatePresence>
							{Object.entries(invites)
								.sort(([a], [b]) => a.localeCompare(b))
								.map(([key, invite]) => {
									const disabled = !invite;
									const isCopied = copied === key;

									return (
										<motion.div key={key} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: '0.5rem' }}>
											{/* MAIN BUTTON */}
											<motion.button
												whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
												whileTap={!disabled ? { scale: 0.98 } : {}}
												onClick={() => !disabled && redirect(invite)}
												style={{
													flex: 1,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													padding: '0.75rem',
													borderRadius: '0.5rem',
													border: '1px solid var(--border)',
													background: disabled ? 'rgba(255,255,255,0.05)' : 'var(--bg-main)',
													cursor: disabled ? 'not-allowed' : 'pointer',
													opacity: disabled ? 0.5 : 1,
												}}>
												<span style={{ fontWeight: 500 }}>Invite {key}</span>
												<ExternalLink size={14} style={{ opacity: 0.6 }} />
											</motion.button>

											{/* COPY BUTTON */}
											<motion.button
												whileHover={!disabled ? { scale: 1.1 } : {}}
												whileTap={!disabled ? { scale: 0.9 } : {}}
												onClick={() => copyLink(key, invite)}
												style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													width: '40px',
													borderRadius: '0.5rem',
													border: '1px solid var(--border)',
													background: isCopied ? 'var(--accent)' : 'var(--bg-main)',
													color: isCopied ? '#fff' : 'inherit',
													cursor: disabled ? 'not-allowed' : 'pointer',
													opacity: disabled ? 0.5 : 1,
													transition: '0.2s',
												}}>
												{isCopied ? <Check size={14} /> : <Copy size={14} />}
											</motion.button>
										</motion.div>
									);
								})}
						</AnimatePresence>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

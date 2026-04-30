/** @format */
'use client';

import { BsDiscord, BsGithub } from 'react-icons/bs';
import { FileText, Package, Shield } from 'lucide-react';

import { motion } from 'framer-motion';

export default function Footer() {
	return (
		<motion.footer
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='mt-auto w-full relative'
			style={{
				background: 'var(--container)',
				borderTop: '1px solid var(--border)',
				backdropFilter: 'blur(14px)',
			}}>
			{/* subtle separator glow */}
			<div
				className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-[85%]'
				style={{
					background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 25%, transparent), transparent)',
				}}
			/>

			<div
				className='mx-auto flex flex-col md:flex-row items-center justify-between'
				style={{
					maxWidth: '1200px',
					padding: 'calc(var(--ui-gap) * 1.2) calc(var(--ui-gap) * 2)',
					gap: 'calc(var(--ui-gap) * 1)',
				}}>
				{/* LEFT */}
				<div className='flex flex-col text-center md:text-left'>
					<span className='text-sm font-medium'>© 2024 - {new Date().getFullYear()} Xernerx Studios</span>

					<div
						className='flex items-center justify-center md:justify-start'
						style={{
							gap: 'calc(var(--ui-gap) * 0.8)',
							marginTop: '4px',
						}}>
						<FooterLink href='/terms' icon={FileText} label='Terms' external={false} />
						<FooterLink href='/privacy' icon={Shield} label='Privacy' external={false} />
					</div>
				</div>

				{/* RIGHT */}
				<div className='flex items-center' style={{ gap: 'calc(var(--ui-gap) * 0.6)' }}>
					<FooterLink href='https://www.npmjs.com/package/xernerx' icon={Package} label='npm' />
					<FooterLink href='https://github.com/xernerx' icon={BsGithub} label='GitHub' />
					<FooterLink href='https://discord.gg/teNWyb69dq' icon={BsDiscord} label='Discord' />
				</div>
			</div>
		</motion.footer>
	);
}

/* ================= COMPONENT ================= */

function FooterLink({ href, icon: Icon, label, external = true }: { href: string; icon: React.ElementType; label: string; external?: boolean }) {
	return (
		<a
			href={href}
			target={external ? '_blank' : undefined}
			rel={external ? 'noopener noreferrer' : undefined}
			className='group inline-flex items-center gap-2 px-2 py-1 rounded-md transition'
			style={{
				color: 'var(--text-muted)',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 12%, transparent)';
				e.currentTarget.style.color = 'var(--text-main)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.background = 'transparent';
				e.currentTarget.style.color = 'var(--text-muted)';
			}}
			title={label}>
			<Icon size={16} />

			<span className='hidden sm:inline text-xs'>{label}</span>
		</a>
	);
}

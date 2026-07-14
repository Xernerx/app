/** @format */
'use client';

import { BookOpen, FileText, Mail, MessageCircle, Package, Shield } from 'lucide-react';

import { BsGithub } from 'react-icons/bs';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
	return (
		<motion.footer
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className='relative mt-auto w-full overflow-hidden'
			style={{
				background: 'var(--container)',
				borderTop: '1px solid var(--border)',
				backdropFilter: 'blur(14px)',
			}}>
			{/* Accent line */}
			<div
				className='pointer-events-none absolute left-1/2 top-0 h-px w-[90%] -translate-x-1/2'
				style={{
					background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 30%, transparent), transparent)',
				}}
			/>

			<div
				className='mx-auto grid w-full grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr_1fr]'
				style={{
					maxWidth: '1400px',
					padding: 'calc(var(--ui-gap) * 2.5)',
				}}>
				{/* ---------------------------------------------------------------- */}
				{/* Brand */}
				{/* ---------------------------------------------------------------- */}

				<div className='flex flex-col justify-between text-center md:text-left'>
					<div>
						<h2
							className='font-semibold'
							style={{
								fontSize: '1.1rem',
							}}>
							Xernerx Studios
						</h2>

						<p
							className='mt-3 max-w-md leading-7'
							style={{
								color: 'var(--text-muted)',
							}}>
							Building modern software, infrastructure and developer tools with a focus on performance, simplicity and long-term maintainability.
						</p>
					</div>

					<div
						className='mt-8 text-sm'
						style={{
							color: 'var(--text-muted)',
						}}>
						© 2024 - {new Date().getFullYear()} Xernerx Studios
					</div>
				</div>

				{/* ---------------------------------------------------------------- */}
				{/* Resources */}
				{/* ---------------------------------------------------------------- */}

				<FooterSection title='Resources'>
					<FooterLink href='/privacy' icon={Shield} label='Privacy' external={false} />

					<FooterLink href='/terms' icon={FileText} label='Terms' external={false} />

					<FooterLink href='/contact' icon={Mail} label='Contact' external={false} />
				</FooterSection>

				{/* ---------------------------------------------------------------- */}
				{/* Developer */}
				{/* ---------------------------------------------------------------- */}

				<FooterSection title='Developer'>
					<FooterLink href='https://github.com/xernerx' icon={BsGithub} label='GitHub' />

					<FooterLink href='https://www.npmjs.com/package/xernerx' icon={Package} label='npm' />

					<FooterLink href='https://app.xernerx.com/docs' icon={BookOpen} label='Documentation' />

					<FooterLink href='https://discord.gg/teNWyb69dq' icon={MessageCircle} label='Discord' />
				</FooterSection>
			</div>
		</motion.footer>
	);
}

/* -------------------------------------------------------------------------- */
/* Sections */
/* -------------------------------------------------------------------------- */

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className='flex flex-col items-center md:items-start'>
			<h3
				className='mb-5 text-sm font-semibold uppercase tracking-[0.2em]'
				style={{
					color: 'var(--text-main)',
				}}>
				{title}
			</h3>

			<div className='flex flex-col gap-1.5'>{children}</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Link */
/* -------------------------------------------------------------------------- */

function FooterLink({ href, icon: Icon, label, external = true }: { href: string; icon: React.ElementType; label: string; external?: boolean }) {
	const className = 'inline-flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200';

	const style = {
		color: 'var(--text-muted)',
	};

	const content = (
		<>
			<Icon size={16} />

			<span className='text-sm'>{label}</span>
		</>
	);

	const handlers = {
		onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
			e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 15%, transparent)';
			e.currentTarget.style.color = 'var(--text-main)';
			e.currentTarget.style.transform = 'translateX(2px)';
		},
		onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
			e.currentTarget.style.background = 'transparent';
			e.currentTarget.style.color = 'var(--text-muted)';
			e.currentTarget.style.transform = 'translateX(0px)';
		},
	};

	if (external) {
		return (
			<a href={href} target='_blank' rel='noopener noreferrer' className={className} style={style} {...handlers}>
				{content}
			</a>
		);
	}

	return (
		<Link href={href} className={className} style={style} {...handlers}>
			{content}
		</Link>
	);
}

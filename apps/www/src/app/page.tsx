/** @format */

'use client';

import { Boxes, ExternalLink, LayoutDashboard, Package } from 'lucide-react';

import Banner from '@/../public/banner.svg';
import Timeline from '@/components/Timeline';
import { useSession } from 'next-auth/react';

export default function Home() {
	const { data: session } = useSession();

	return (
		<div className='flex flex-col'>
			{/* HERO */}
			<section
				className='min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden'
				style={{
					gap: 'calc(var(--ui-gap) * 1.5)',
				}}>
				<div
					className='absolute inset-0 -z-10'
					style={{
						background: 'radial-gradient(circle at center, rgba(var(--accent),0.15), transparent 70%)',
					}}
				/>

				<div className='relative w-full flex justify-center py-24 overflow-hidden'>
					{/* subtle accent glow */}
					<div
						className='absolute inset-0 -z-10'
						style={{
							background: 'radial-gradient(800px 400px at 50% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)',
						}}
					/>

					<Banner className='w-full max-w-6xl h-auto object-contain select-none pointer-events-none' />
				</div>

				<h1 className='text-5xl md:text-6xl font-semibold tracking-tight'>Building Reliable Infrastructure</h1>

				<p className='max-w-2xl text-base opacity-70 leading-relaxed'>Xernerx develops scalable applications, frameworks, and automation tools focused on long-term maintainability and performance.</p>
			</section>

			{/* DIVIDER */}
			<div className='relative h-24'>
				<div
					className='absolute inset-0'
					style={{
						background: 'linear-gradient(to bottom, transparent, rgba(var(--accent),0.08), transparent)',
					}}
				/>
			</div>

			{/* ABOUT */}
			<section className='max-w-5xl mx-auto text-center px-6' style={{ padding: 'calc(var(--ui-gap) * 3) 0' }}>
				<h2 className='text-3xl font-semibold mb-6'>About Xernerx</h2>

				<p className='text-base opacity-70 leading-relaxed'>
					Founded in 2024, Xernerx evolved from a focused development initiative into a structured ecosystem of automation tools and infrastructure frameworks. Every system is built with scalability,
					maintainability, and architectural clarity as first principles.
				</p>
			</section>

			{/* DIVIDER */}
			<div className='relative h-24'>
				<div
					className='absolute inset-0'
					style={{
						background: 'linear-gradient(to bottom, transparent, rgba(var(--accent),0.08), transparent)',
					}}
				/>
			</div>

			{/* SERVICES / PACKAGES / APPS */}
			<section className='px-6' style={{ padding: 'calc(var(--ui-gap) * 4) 0' }}>
				<div className='max-w-6xl mx-auto grid md:grid-cols-3 gap-10'>
					{/* COLUMN */}
					{[
						{
							title: 'Services',
							items: [
								{
									icon: <LayoutDashboard size={18} />,
									title: 'Dashboard',
									desc: 'Manage applications, configure deployments, and monitor system performance.',
									link: 'https://canary.xernerx.com',
								},
							],
						},
						{
							title: 'Packages',
							items: [
								{
									icon: <Package size={18} />,
									title: 'Xernerx Framework',
									desc: 'A modular foundation for scalable Discord applications.',
									link: 'https://www.npmjs.com/package/xernerx',
								},
								{
									icon: <Boxes size={18} />,
									title: 'Xernerx Stats',
									desc: 'Analytics utilities for measuring performance.',
									link: 'https://www.npmjs.com/package/xernerx-stats',
								},
							],
						},
						{
							title: 'Applications',
							items: [
								{
									icon: <Boxes size={18} />,
									title: 'To-Do List Bot',
									desc: 'Structured productivity tooling.',
									link: 'https://canary.xernerx.com/bots/782105629572464652',
								},
								{
									icon: <Boxes size={18} />,
									title: 'Zodiac',
									desc: 'Astrology-based interaction tools.',
									link: 'https://canary.xernerx.com/bots/950251264095162418',
								},
								{
									icon: <Boxes size={18} />,
									title: 'Metamorphosis',
									desc: 'Advanced role transformation utilities.',
									link: 'https://canary.xernerx.com/bots/881678826906730547',
								},
							],
						},
					].map((col) => (
						<div key={col.title}>
							<h2 className='text-xl font-semibold mb-6'>{col.title}</h2>

							<div className='flex flex-col gap-6'>
								{col.items.map((item) => (
									<a
										key={item.title}
										href={item.link}
										className='group rounded-xl p-5 transition relative overflow-hidden'
										style={{
											background: 'var(--container)',
											border: '1px solid var(--border)',
										}}>
										{/* hover glow */}
										<div
											className='absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none'
											style={{
												background: 'radial-gradient(circle at top, rgba(var(--accent),0.1), transparent 70%)',
											}}
										/>

										<div className='relative flex items-center gap-3 mb-2'>
											<div style={{ color: 'rgb(var(--accent))' }}>{item.icon}</div>
											<h3 className='font-medium text-sm'>{item.title}</h3>
											<ExternalLink className='ml-auto opacity-30 group-hover:opacity-100 transition' size={14} />
										</div>

										<p className='text-xs opacity-70 leading-relaxed'>{item.desc}</p>
									</a>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* DIVIDER */}
			<div className='relative h-24'>
				<div
					className='absolute inset-0'
					style={{
						background: 'linear-gradient(to bottom, transparent, rgba(var(--accent),0.08), transparent)',
					}}
				/>
			</div>

			{/* HISTORY */}
			<section style={{ paddingTop: 'calc(var(--ui-gap) * 4)' }}>
				<div className='max-w-4xl mx-auto px-6 mb-16 text-center'>
					<h2 className='text-3xl font-semibold mb-4'>Our History</h2>
					<p className='text-sm opacity-70'>A structured progression from experimentation to stable infrastructure engineering.</p>
				</div>

				<Timeline />
			</section>
		</div>
	);
}

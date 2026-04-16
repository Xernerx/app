/** @format */

'use client';

import { ArrowUpRight, Bot, Building2, Calendar, Globe, LogOut, RefreshCw, ShieldCheck, Star, UserPlus } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

import { useRef } from 'react';

type Milestone = {
	date: string;
	title: string;
	description: string;
	icon: React.ReactNode;
};

const milestones: Milestone[] = [
	{
		date: 'March 2020',
		title: 'Amethyst Development Founded',
		description: 'Thomas, Johannes, and Asher established Amethyst Development with a focus on scalable Discord tooling.',
		icon: <Building2 />,
	},
	{
		date: 'June 2020',
		title: 'Rebranded to Portal Development',
		description: 'Following structural changes, the company was reintroduced under the name Portal Development.',
		icon: <RefreshCw />,
	},
	{
		date: 'June 2020',
		title: 'First Bot Acquisition',
		description: 'Roblox Utilities joined the portfolio, expanding into multi-server utility tooling.',
		icon: <Bot />,
	},
	{
		date: 'November 2020',
		title: 'To-Do List Bot Launched',
		description: 'Clari began development of To-Do List Bot, introducing structured productivity features.',
		icon: <UserPlus />,
	},
	{
		date: 'August 2021',
		title: 'Discord-Translate Begins',
		description: 'Thomas initiated development of Discord-Translate, focused on multilingual communities.',
		icon: <Globe />,
	},
	{
		date: 'December 2021',
		title: 'Acquired DragDev Studios',
		description: 'DragDev Studios and YourApps joined the company, along with three new developers.',
		icon: <ArrowUpRight />,
	},
	{
		date: 'January 2022',
		title: 'Metamorphosis Rewrite',
		description: 'Discord-Translate was rebuilt and relaunched as Metamorphosis with improved infrastructure.',
		icon: <Star />,
	},
	{
		date: 'February 2022',
		title: 'Leadership Transition',
		description: 'Johannes stepped down. Infrastructure responsibilities were restructured internally.',
		icon: <LogOut />,
	},
	{
		date: 'March 2022',
		title: 'Zodiac Development',
		description: 'Max began development of Zodiac, expanding into astrology and personality tooling.',
		icon: <ShieldCheck />,
	},
	{
		date: 'February 2026',
		title: 'Xernerx Studios Rebrand',
		description: 'The company rebranded to Xernerx Studios, reflecting a shift in focus and identity.',
		icon: <RefreshCw />,
	},
	{
		date: `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][new Date().getMonth()]} ${new Date().getFullYear()}`,
		title: 'Today',
		description: "You're all caught up!",
		icon: <Calendar />,
	},
];

export default function Timeline() {
	const containerRef = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start 10%', 'end 90%'],
	});

	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 120,
		damping: 30,
	});

	return (
		<section ref={containerRef} className='relative py-32'>
			<div className='relative max-w-6xl mx-auto'>
				{/* CENTER LINE */}
				<div
					className='absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px]'
					style={{
						background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
					}}>
					<motion.div
						className='absolute inset-0 origin-top'
						style={{
							background: 'rgb(var(--accent))',
							scaleY: smoothProgress,
						}}
					/>
				</div>

				{/* ITEMS */}
				<div className='flex flex-col gap-32'>
					{milestones.map((m, i) => {
						const isLeft = i % 2 === 0;

						return (
							<div key={i} className='grid grid-cols-[1fr_auto_1fr] items-center'>
								{/* LEFT */}
								<div className={isLeft ? 'flex justify-end pr-12' : ''}>{isLeft && <TimelineCard milestone={m} />}</div>

								{/* DOT */}
								<div className='flex justify-center'>
									<div
										style={{
											width: 10,
											height: 10,
											borderRadius: '999px',
											background: 'rgb(var(--accent))',
											boxShadow: '0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent)',
										}}
									/>
								</div>

								{/* RIGHT */}
								<div className={!isLeft ? 'flex justify-start pl-12' : ''}>{!isLeft && <TimelineCard milestone={m} />}</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function TimelineCard({ milestone }: { milestone: Milestone }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.4 }}
			transition={{ duration: 0.35 }}
			className='rounded-xl'
			style={{
				maxWidth: 420,
				background: 'var(--container)',
				border: '1px solid var(--border)',
				padding: 'calc(var(--ui-gap) * 2)',
			}}>
			{/* HEADER */}
			<div className='flex items-center gap-3 mb-3'>
				<div
					className='flex items-center justify-center rounded-md'
					style={{
						width: 36,
						height: 36,
						background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
						color: 'rgb(var(--accent))',
					}}>
					{milestone.icon}
				</div>

				<div className='flex flex-col'>
					<span className='text-[10px] uppercase tracking-wide' style={{ color: 'var(--text-muted)' }}>
						{milestone.date}
					</span>

					<span className='text-sm font-medium'>{milestone.title}</span>
				</div>
			</div>

			{/* DESCRIPTION */}
			<p className='text-sm leading-relaxed' style={{ color: 'var(--text-muted)' }}>
				{milestone.description}
			</p>
		</motion.div>
	);
}

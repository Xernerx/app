/** @format */

import { LayoutGrid, Monitor, Palette, RefreshCw, Sparkles, ZoomIn } from 'lucide-react';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

export default function Appearance() {
	const {
		setAccentColor,
		setSyncAcrossClients,
		setMode,
		syncAcrossClients,
		mode,
		accentColor,
		background,
		setBackground,
		setUISpacing,
		setZoom,
		ui: { uiSpacing, zoom },
	} = useTheme();
	const { data: session } = useSession();

	const [zoomPreview, setZoomPreview] = useState(zoom);

	function modeButton(target: 'light' | 'dark' | 'system') {
		const active = mode === target;

		return (
			<button
				onClick={() => setMode(target)}
				className={`px-4 py-2 rounded-md text-sm transition border
				${active ? 'bg-(--accent) text-white border-transparent' : 'bg-(--container) border-white/10 hover:border-white/30'}`}>
				{target.charAt(0).toUpperCase() + target.slice(1)}
			</button>
		);
	}

	function colorButton(color: string) {
		const active = accentColor === color;

		return (
			<button
				title={`${color}`}
				onClick={() => setAccentColor(color)}
				className={`w-8 h-8 rounded-full border-2 transition
				${active ? 'border-white scale-110' : 'border-white/20 hover:border-white/60'}`}
				style={{ background: color }}
			/>
		);
	}

	function backgroundButton(effect: string) {
		const active = background === effect;

		return (
			<button
				title={`${effect}`}
				onClick={() => setBackground(effect as never)}
				className={`w-8 h-8 rounded border-2 transition
				${active ? 'border-white scale-110' : 'border-white/20 hover:border-white/60'}`}>
				<div style={{ background: `var(--bg-${effect}), var(--bg-panel)` }} className='w-full h-full'></div>
			</button>
		);
	}

	return (
		<div className='flex flex-col mx-auto w-full max-w-4xl' style={{ gap: 'var(--ui-gap)' }}>
			{/* Theme */}
			<SettingsCard>
				<div className='flex items-center gap-3'>
					<Monitor size={18} className='text-(--accent)' />
					<div>
						<h2 className='text-lg font-semibold'>Theme</h2>
						<p className='text-sm text-(--text-muted)'>Choose how Xernerx looks.</p>
					</div>
				</div>

				<div className='flex gap-3'>
					{modeButton('light')}
					{modeButton('dark')}
					{modeButton('system')}
				</div>
			</SettingsCard>

			{/* Accent Color */}
			<SettingsCard>
				<div className='flex items-center gap-3'>
					<Palette size={18} className='text-(--accent)' />
					<div>
						<h2 className='text-lg font-semibold'>Accent Color</h2>
						<p className='text-sm text-(--text-muted)'>Used across buttons, highlights and UI accents.</p>
					</div>
				</div>

				<div className='flex flex-wrap gap-3 flex-col'>
					<div className='flex flex-wrap gap-3'>
						{colorButton('#ef4444')}
						{colorButton('#f97316')}
						{colorButton('#f59e0b')}
						{colorButton('#eab308')}
						{colorButton('#84cc16')}
						{colorButton('#22c55e')}
						{colorButton('#14b8a6')}
						{colorButton('#06b6d4')}
						{colorButton('#3b82f6')}
						{colorButton('#6366f1')}
						{colorButton('#8b5cf6')}
						{session?.accent_color && colorButton('#' + session?.accent_color.toString(16).padStart(6, '0'))}
					</div>
					<div className='flex flex-wrap gap-3'>
						{colorButton('#dc2626')}
						{colorButton('#c2410c')}
						{colorButton('#b45309')}
						{colorButton('#a16207')}
						{colorButton('#4d7c0f')}
						{colorButton('#15803d')}
						{colorButton('#0f766e')}
						{colorButton('#0e7490')}
						{colorButton('#1d4ed8')}
						{colorButton('#4338ca')}
						{colorButton('#6d28d9')}
						{session?.banner_color && colorButton(session?.banner_color)}
					</div>
				</div>
			</SettingsCard>

			<SettingsCard>
				<div className='flex items-center gap-3'>
					<Sparkles size={18} className='text-(--accent)' />
					<div>
						<h2 className='text-lg font-semibold'>Background Effect</h2>
						<p className='text-sm text-(--text-muted)'>Used across page backgrounds.</p>
					</div>
				</div>

				<div className='flex flex-wrap gap-3'>
					{backgroundButton('none')}
					{backgroundButton('nebula')}
					{backgroundButton('gradient-v')}
					{backgroundButton('gradient-h')}
					{backgroundButton('gradient-diag-l')}
					{backgroundButton('gradient-diag-r')}
					{backgroundButton('aurora')}
					{backgroundButton('spotlight')}
					{backgroundButton('halo')}
					{backgroundButton('edge-glow')}
					{backgroundButton('top-fade')}
					{backgroundButton('corners')}
					{backgroundButton('mesh')}
					{backgroundButton('ring')}
				</div>
			</SettingsCard>

			{/* UI Spacing */}
			<SettingsCard>
				<div className='flex items-center gap-3'>
					<LayoutGrid size={18} className='text-(--accent)' />
					<div>
						<h2 className='text-lg font-semibold'>UI Spacing</h2>
						<p className='text-sm text-(--text-muted)'>Adjust the space between interface elements.</p>
					</div>
				</div>

				<div className='flex gap-3 flex-wrap'>
					<button
						onClick={() => setUISpacing('compact')}
						className={`px-4 py-2 rounded-md text-sm border transition
			${uiSpacing === 'compact' ? 'bg-(--accent) text-white border-transparent' : 'bg-(--container) border-white/10 hover:border-white/30'}`}>
						Compact
					</button>

					<button
						onClick={() => setUISpacing('default')}
						className={`px-4 py-2 rounded-md text-sm border transition
			${uiSpacing === 'default' ? 'bg-(--accent) text-white border-transparent' : 'bg-(--container) border-white/10 hover:border-white/30'}`}>
						Default
					</button>

					<button
						onClick={() => setUISpacing('spacious')}
						className={`px-4 py-2 rounded-md text-sm border transition
			${uiSpacing === 'spacious' ? 'bg-(--accent) text-white border-transparent' : 'bg-(--container) border-white/10 hover:border-white/30'}`}>
						Spacious
					</button>
				</div>
			</SettingsCard>

			{/* Zoom */}
			<SettingsCard>
				<div className='flex items-center gap-3'>
					<ZoomIn size={18} className='text-(--accent)' />
					<div>
						<h2 className='text-lg font-semibold'>Zoom</h2>
						<p className='text-sm text-(--text-muted)'>Scale the entire interface.</p>
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<input
						type='range'
						min={75}
						max={150}
						step={5}
						value={zoomPreview}
						onChange={(e) => setZoomPreview(Number(e.target.value))}
						onMouseUp={() => setZoom(zoomPreview)}
						onTouchEnd={() => setZoom(zoomPreview)}
						className='slider w-full'
					/>

					<div className='flex justify-between text-xs text-(--text-muted)'>
						<span>75%</span>
						<span className='text-(--accent)'>{zoomPreview}%</span>
						<span>150%</span>
					</div>
				</div>
			</SettingsCard>

			{/* Sync */}
			<SettingsCard>
				<div className='flex items-center gap-3'>
					<RefreshCw size={18} className='text-(--accent)' />
					<div>
						<h2 className='text-lg font-semibold'>Sync Across Clients</h2>
						<p className='text-sm text-(--text-muted)'>Share theme settings across open apps.</p>
					</div>
				</div>

				<label className='relative inline-flex items-center cursor-pointer'>
					<input type='checkbox' checked={syncAcrossClients} onChange={() => setSyncAcrossClients(!syncAcrossClients)} className='sr-only peer' />

					<div className='w-11 h-6 bg-gray-600 peer-checked:bg-(--accent) rounded-full transition relative'>
						<div className='absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5' />
					</div>
				</label>
			</SettingsCard>
		</div>
	);
}

function SettingsCard({ children }: { children: React.ReactNode }) {
	return (
		<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className='bg-(--container) rounded-xl border border-white/10 p-5 flex flex-col gap-4'>
			{children}
		</motion.div>
	);
}

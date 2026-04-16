/** @format */

'use client';

import { motion } from 'framer-motion';
import { useCookies } from '@/providers/CookieProvider';

export function CookieBanner() {
	const { consent, setConsent } = useCookies();

	if (consent) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20 }}
			className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl'
			style={{
				background: 'var(--container)',
				border: '1px solid var(--border)',
				borderRadius: '1.25rem',
				backdropFilter: 'blur(14px)',
				boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
				padding: 'calc(var(--ui-gap) * 1.5)',
			}}>
			<p className='text-sm leading-relaxed' style={{ color: 'var(--text-muted)' }}>
				We use essential cookies to keep things running. Optional analytics help us understand what breaks so we can pretend we planned it that way.
			</p>

			<div className='flex justify-end flex-wrap' style={{ gap: 'calc(var(--ui-gap) * 0.6)', marginTop: '1rem' }}>
				<button
					onClick={() => setConsent({ essential: true, analytics: false })}
					className='px-4 py-2 text-sm rounded-md transition'
					style={{
						border: '1px solid var(--border)',
						background: 'transparent',
						color: 'var(--text-muted)',
					}}>
					Essential only
				</button>

				<button
					onClick={() => setConsent({ essential: true, analytics: true })}
					className='px-4 py-2 text-sm rounded-md transition'
					style={{
						background: 'var(--accent)',
						color: '#fff',
						boxShadow: '0 8px 25px color-mix(in srgb, var(--accent) 30%, transparent)',
					}}>
					Accept all
				</button>
			</div>
		</motion.div>
	);
}

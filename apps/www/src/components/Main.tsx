/** @format */

'use client';

export default function Main({ children }: { children: React.ReactNode }) {
	return (
		<main
			className={`flex-1 overflow-y-auto bg-(--bg-panel) rounded-t-xl p-8`}
			style={{
				background: `var(--bg-effect), var(--bg-panel)`,
			}}>
			{children}
		</main>
	);
}

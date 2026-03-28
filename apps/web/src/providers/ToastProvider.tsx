/** @format */

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ToastType = 'info' | 'error' | 'warning' | 'success';

type ToastContextType = {
	toast: (message: string, type: ToastType) => void;
};

type ToastItem = {
	id: number;
	message: string;
	type: ToastType;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const toast = useCallback((message: string, type: ToastType) => {
		const id = Date.now() + Math.random();

		setToasts((prev) => [...prev, { id, message, type }]);

		window.setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 3500);
	}, []);

	const removeToast = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const value = useMemo(() => ({ toast }), [toast]);

	return (
		<ToastContext.Provider value={value}>
			{children}

			<div className='pointer-events-none fixed inset-x-0 bottom-6 z-9999 flex justify-center px-4'>
				<div className='flex w-full max-w-md flex-col items-center gap-2'>
					{toasts.map((item) => (
						<Toast key={item.id} id={item.id} message={item.message} type={item.type} onClose={removeToast} />
					))}
				</div>
			</div>
		</ToastContext.Provider>
	);
}

function Toast({ id, message, type, onClose }: { id: number; message: string; type: ToastType; onClose: (id: number) => void }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const enter = window.setTimeout(() => setVisible(true), 10);
		const exit = window.setTimeout(() => setVisible(false), 3000);
		const remove = window.setTimeout(() => onClose(id), 3350);

		return () => {
			window.clearTimeout(enter);
			window.clearTimeout(exit);
			window.clearTimeout(remove);
		};
	}, [id, onClose]);

	const styles = {
		info: 'border-[#2a2a32] bg-[#141418] text-white',
		error: 'border-red-500/30 bg-red-500/10 text-red-200',
		warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
		success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
	};

	return (
		<div
			className={`pointer-events-auto w-full rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 ${styles[type]} ${
				visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
			}`}>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex min-w-0 flex-col'>
					<span className='text-xs font-medium uppercase tracking-[0.16em] opacity-60'>{type}</span>
					<p className='truncate text-sm font-medium'>{message}</p>
				</div>

				<button type='button' onClick={() => onClose(id)} className='cursor-pointer text-xs opacity-60 transition hover:opacity-100'>
					Close
				</button>
			</div>
		</div>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);

	if (!ctx) throw new Error('ToastProvider missing');

	return ctx;
}

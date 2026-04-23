/** @format */

'use client';

import { ArrowLeft, LucideHome } from 'lucide-react';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useSidebar } from '@/providers/SidebarProvider';

type DocType = {
	scope: string;
	type: string;
};

const kindMap: Record<number, string> = {
	1: 'Project',
	2: 'Module',
	4: 'Namespace',
	32: 'Variable',
	64: 'Function',
	128: 'Class',
	256: 'Interface',
	512: 'Constructor',
	1024: 'Property',
	2048: 'Method',
	4096: 'Call signature',
};

function kindToLabel(kind: number) {
	return kindMap[kind] || `Kind ${kind}`;
}

export default function Page() {
	const { clearNavItems, setNavItems, view, setView } = useSidebar();

	const [types, setTypes] = useState<DocType[]>([]);
	const [selected, setSelected] = useState<DocType | null>(null);

	const [versions, setVersions] = useState<string[]>([]);
	const [version, setVersion] = useState('');

	const [search, setSearch] = useState('');
	const [doc, setDoc] = useState<any>(null);

	/* NAV */

	useEffect(() => {
		if (!doc) return;

		const categoriesMap = new Map<string, any[]>();

		(doc.children ?? []).forEach((item: any) => {
			const [category] = item.name.split('/');
			if (!categoriesMap.has(category)) categoriesMap.set(category, []);
			categoriesMap.get(category)!.push(item);
		});

		const categories = Array.from(categoriesMap.keys());

		if (!view && categories.length > 0) setView(categories[0]);

		setNavItems([
			{ label: 'Home', icon: <LucideHome />, href: '/' },
			{ label: 'Back to Portal', icon: <ArrowLeft />, href: '/portal' },
			...categories.map((c) => ({
				label: c,
				view: c,
				onClick: () => setView(c),
			})),
		]);

		return () => clearNavItems();
	}, [doc]);

	/* DATA */

	useEffect(() => {
		(async () => {
			const res = await fetch('/api/docs').then((r) => r.json());
			setTypes(res.types || []);
			if (res.types?.length) setSelected(res.types[0]);
		})();
	}, []);

	useEffect(() => {
		if (!selected) return;

		(async () => {
			const res = await fetch(`/api/docs/${selected.scope}/${selected.type}`).then((r) => r.json());
			setVersions(res.versions ?? []);
			setVersion(res.versions?.[0] ?? '');
		})();
	}, [selected]);

	useEffect(() => {
		if (!selected || !version) return;

		(async () => {
			const res = await fetch(`/api/docs/${selected.scope}/${selected.type}/${version}`).then((r) => r.json());
			setDoc(res.data);
		})();
	}, [selected, version]);

	const categories = (() => {
		if (!doc) return [];

		const map = new Map<string, any[]>();

		(doc.children ?? []).forEach((item: any) => {
			const [category] = item.name.split('/');
			if (!map.has(category)) map.set(category, []);
			map.get(category)!.push(item);
		});

		return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
	})();

	const activeCategory = categories.find((c) => c.name === view);

	/* UI */

	return (
		<div className='flex flex-col' style={{ gap: 'calc(var(--ui-gap) * 2)' }}>
			{/* HEADER */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className='rounded-xl border'
				style={{
					background: 'var(--container)',
					borderColor: 'var(--border)',
					padding: 'calc(var(--ui-gap) * 1.5)',
				}}>
				<div className='flex flex-wrap gap-3'>
					<select
						value={selected ? `${selected.scope}/${selected.type}` : ''}
						onChange={(e) => {
							const [scope, type] = e.target.value.split('/');
							setSelected({ scope, type });
						}}
						className='px-3 py-2 rounded-md text-sm'
						style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
						{types.map((t) => {
							const value = `${t.scope}/${t.type}`;
							return <option key={value}>{value}</option>;
						})}
					</select>

					<select value={version} onChange={(e) => setVersion(e.target.value)} className='px-3 py-2 rounded-md text-sm' style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
						{versions.map((v) => (
							<option key={v}>{v}</option>
						))}
					</select>

					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder='Search docs...'
						className='flex-1 px-3 py-2 rounded-md text-sm'
						style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}
					/>
				</div>
			</motion.div>

			{/* CONTENT */}
			<div className='flex flex-col gap-4'>
				{activeCategory?.items
					.flatMap((i: any) => i.children || [])
					.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()))
					.map((item: any, i: number) => (
						<motion.div
							key={item.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.02 }}
							whileHover={{ y: -2 }}
							className='rounded-xl border'
							style={{
								background: 'var(--container)',
								borderColor: 'var(--border)',
								padding: 'calc(var(--ui-gap) * 1.5)',
							}}>
							<DocRenderer item={item} />
						</motion.div>
					))}
			</div>
		</div>
	);
}

/* ================= FULL RENDER ================= */

function DocRenderer({ item }: { item: any }) {
	const [activeChild, setActiveChild] = useState<any>(null);

	const sig = item.signatures?.[0];

	const summary = sig?.comment?.summary || item.comment?.summary || [];
	const description = summary.map((s: any) => s.text).join('');

	const returns =
		sig?.comment?.blockTags
			?.find((t: any) => t.tag === '@returns')
			?.content?.map((c: any) => c.text)
			.join('') || null;

	const examples = sig?.comment?.blockTags?.filter((t: any) => t.tag === '@example') || [];

	const children = item.children ?? [];

	/* ================= GROUPING ================= */

	const groupMap: Record<number, string> = {
		512: 'Constructors',
		1024: 'Properties',
		2048: 'Methods',
		64: 'Functions',
	};

	const groups = Object.entries(groupMap)
		.map(([kind, label]) => ({
			label,
			items: children.filter((c: any) => c.kind === Number(kind)),
		}))
		.filter((g) => g.items.length > 0);

	/* ================= DEFAULT SELECTION ================= */

	useEffect(() => {
		if (!activeChild && groups.length > 0) {
			setActiveChild(groups[0].items[0] ?? null);
		}
	}, [item]);

	/* ================= UI ================= */

	return (
		<div className='flex flex-col gap-5'>
			{/* HEADER */}
			<div>
				<div className='text-lg font-semibold'>{item.name.replace(/^.*\//, '')}</div>
				<div className='text-xs opacity-50'>{kindToLabel(item.kind)}</div>
			</div>

			{/* DESCRIPTION */}
			{description && <div className='text-sm opacity-80 leading-6'>{description}</div>}

			{/* PARAMETERS */}
			{sig?.parameters?.length > 0 && (
				<div>
					<div className='text-xs opacity-50 mb-2'>Parameters</div>

					<div
						className='grid gap-2'
						style={{
							gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
						}}>
						{sig.parameters.map((p: any) => (
							<div
								key={p.name}
								className='rounded-lg px-3 py-2 border'
								style={{
									borderColor: 'var(--border)',
									background: 'var(--bg-main)',
								}}>
								<b>{p.name}</b> <span className='opacity-60'>{renderType(p.type)}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* RETURNS */}
			{sig?.type && (
				<div>
					<div className='text-xs opacity-50 mb-1'>Returns</div>
					<div className='text-sm'>{renderType(sig.type)}</div>
					{returns && <div className='text-xs opacity-60 mt-1'>{returns}</div>}
				</div>
			)}

			{/* ================= GROUP GRID ================= */}
			{groups.length > 0 && (
				<div
					className='grid gap-4'
					style={{
						gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))`,
					}}>
					{groups.map((group) => (
						<div key={group.label} className='flex flex-col gap-2'>
							{/* GROUP TITLE */}
							<div className='text-xs opacity-50'>{group.label}</div>

							{/* ITEMS */}
							<div
								className='grid gap-2'
								style={{
									gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
								}}>
								{group.items.map((child: any) => (
									<SubItem key={child.id} item={child} active={activeChild?.id === child.id} onClick={() => setActiveChild(child)} />
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* ================= DETAIL PANEL ================= */}
			{activeChild && (
				<div
					className='mt-4 p-4 rounded-xl border'
					style={{
						borderColor: 'var(--border)',
						background: 'var(--container)',
					}}>
					<DocRenderer item={activeChild} />
				</div>
			)}
		</div>
	);
}

function renderType(type: any): string {
	if (!type) return 'unknown';
	if (type.name) return type.name;

	if (type.type === 'union') return type.types.map(renderType).join(' | ');
	if (type.type === 'array') return `${renderType(type.elementType)}[]`;
	if (type.type === 'reference') return type.name;

	return type.type || 'unknown';
}

function SubItem({ item, onClick, active }: { item: any; onClick: () => void; active: boolean }) {
	const sig = item.signatures?.[0];

	return (
		<div
			onClick={onClick}
			className='relative px-3 py-2 rounded-md cursor-pointer transition flex items-center gap-2'
			style={{
				background: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
			}}>
			{/* ACTIVE INDICATOR */}
			<div
				className='absolute left-0 top-0 bottom-0 w-[2px] rounded'
				style={{
					background: active ? 'var(--accent)' : 'transparent',
				}}
			/>

			{/* CONTENT */}
			<div className='flex flex-col'>
				<span className='text-sm font-medium'>{item.name}</span>
				<span className='text-xs opacity-50'>{renderType(sig?.type || item.type)}</span>
			</div>
		</div>
	);
}

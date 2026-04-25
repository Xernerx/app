/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import database from '@/lib/database';

export async function GET(req: NextRequest) {
	const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim();

	if (!q || q.length < 2) {
		return NextResponse.json({ results: [] });
	}

	try {
		const { bot, guild, user } = await database('xernerx', 'profiles'); // adjust collections

		/* ================= DB SEARCH ================= */

		// naive contains search (fast enough for now)
		const [botResults, guildResults] = await Promise.all([
			bot
				?.find?.({
					name: { $regex: q, $options: 'i' },
				})
				.limit(5) ?? [],

			guild
				?.find?.({
					name: { $regex: q, $options: 'i' },
				})
				.limit(5) ?? [],
		]);

		/* ================= STATIC ================= */

		const staticPages = [
			{ label: 'Dashboard', href: '/dashboard', type: 'Page' },
			{ label: 'Explore', href: '/explore', type: 'Page' },
			{ label: 'Portal', href: '/portal', type: 'Page' },
			{ label: 'Admin', href: '/admin', type: 'Page' },
		].filter((p) => p.label.toLowerCase().includes(q));

		/* ================= FORMAT ================= */

		const results = [
			...botResults.map((b: any) => ({
				id: b.id,
				label: b.name,
				type: 'Bot',
				href: `/bots/${b.id}`,
			})),

			...guildResults.map((g: any) => ({
				id: g.id,
				label: g.name,
				type: 'Server',
				href: `/dashboard/${g.id}`,
			})),

			...staticPages,
		];

		return NextResponse.json({ results });
	} catch (e) {
		return NextResponse.json({ results: [] }, { status: 500 });
	}
}

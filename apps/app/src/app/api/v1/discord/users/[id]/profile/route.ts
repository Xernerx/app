/** @format */
'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';

type CacheEntry = {
	data: any;
	cachedAt: number;
	expiresAt: number;
};

const CACHE_TTL = 1000 * 60 * 5;

declare global {
	var discordUserByIdCache: Map<string, CacheEntry> | undefined;
}

const userCache = globalThis.discordUserByIdCache ?? new Map<string, CacheEntry>();

if (!globalThis.discordUserByIdCache) {
	globalThis.discordUserByIdCache = userCache;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const token = await getToken(request);

	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ message: 'Missing user id.' }, { status: 400 });
	}

	if (id === 'me') {
		const session = await getServerSession(authOptions);

		const discord = await fetch('https://discord.com/api/users/@me', {
			headers: { Authorization: `Bearer ${session?.accessToken}` },
		}).then((res) => res.json());

		return NextResponse.json(discord);
	}

	const botToken = process.env.DISCORD_CLIENT_TOKEN;

	if (!botToken) {
		return NextResponse.json({ message: 'Bot token not configured.' }, { status: 500 });
	}

	const now = Date.now();
	const cached = userCache.get(id);

	if (cached && cached.expiresAt > now) {
		return NextResponse.json({
			user: cached.data,
			cached: true,
			stale: false,
			rateLimited: false,
			cachedAt: cached.cachedAt,
		});
	}

	try {
		const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
			headers: { Authorization: `Bot ${botToken}` },
			cache: 'no-store',
		});

		if (response.status === 429 && cached?.data) {
			return NextResponse.json({
				user: cached.data,
				cached: true,
				stale: true,
				rateLimited: true,
				cachedAt: cached.cachedAt,
			});
		}

		if (!response.ok) {
			const body = await response.json().catch(() => null);
			return NextResponse.json({ message: body?.message ?? `Failed (${response.status})` }, { status: response.status });
		}

		const raw = await response.json();

		userCache.set(id, {
			data: raw,
			cachedAt: now,
			expiresAt: now + CACHE_TTL,
		});

		return NextResponse.json({
			user: raw,
			cached: false,
			stale: false,
			rateLimited: false,
			cachedAt: now,
		});
	} catch {
		if (cached?.data) {
			return NextResponse.json({
				user: cached.data,
				cached: true,
				stale: true,
				rateLimited: false,
				cachedAt: cached.cachedAt,
			});
		}

		return NextResponse.json({ message: 'Failed to fetch user and no cache available.' }, { status: 500 });
	}
}

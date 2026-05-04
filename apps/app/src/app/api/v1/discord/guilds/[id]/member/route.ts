/** @format */

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';

type Member = {
	user: {
		id: string;
		username: string;
		avatar: string | null;
	};
	nick: string | null;
	roles: string[];
	joined_at: string;
	avatar: string | null;
};

type CacheEntry = {
	data: Member;
	cachedAt: number;
	expiresAt: number;
};

const CACHE_TTL = 1000 * 60 * 5;

declare global {
	var discordMemberCache: Map<string, CacheEntry> | undefined;
}

const memberCache = globalThis.discordMemberCache ?? new Map<string, CacheEntry>();

if (!globalThis.discordMemberCache) {
	globalThis.discordMemberCache = memberCache;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const token = await getToken(request);

	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	const session: any = await getServerSession(authOptions);
	const accessToken = session?.accessToken;

	if (!accessToken || !session?.user?.id) {
		return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
	}

	const userId = session.user.id;
	const guildId = (await params).id;

	if (!guildId) {
		return NextResponse.json({ message: 'Missing guild id.' }, { status: 400 });
	}

	const cacheKey = `${userId}:${guildId}`;
	const now = Date.now();

	const cached = memberCache.get(cacheKey);
	if (cached && cached.expiresAt > now) {
		return NextResponse.json({
			member: cached.data,
			cached: true,
			stale: false,
			rateLimited: false,
			cachedAt: cached.cachedAt,
		});
	}

	try {
		const response = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});

		if (response.status === 429 && cached?.data) {
			return NextResponse.json({
				member: cached.data,
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

		const data: Member = await response.json();

		memberCache.set(cacheKey, {
			data,
			cachedAt: now,
			expiresAt: now + CACHE_TTL,
		});

		return NextResponse.json({
			member: data,
			cached: false,
			stale: false,
			rateLimited: false,
			cachedAt: now,
		});
	} catch {
		if (cached?.data) {
			return NextResponse.json({
				member: cached.data,
				cached: true,
				stale: true,
				rateLimited: false,
				cachedAt: cached.cachedAt,
			});
		}

		return NextResponse.json({ message: 'Failed to fetch member.' }, { status: 500 });
	}
}

/** @format */

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';

type Guild = {
	id: string;
	name: string;
	icon: string | null;
	permissions: string;
};

type CacheEntry = {
	data: Guild[];
	cachedAt: number;
	expiresAt: number;
};

const ADMINISTRATOR = 8n;
const MANAGE_GUILD = 32n;
const CACHE_TTL = 1000 * 60 * 5;

declare global {
	var discordGuildsCache: Map<string, CacheEntry> | undefined;
}

const guildCache = globalThis.discordGuildsCache ?? new Map<string, CacheEntry>();

if (!globalThis.discordGuildsCache) {
	globalThis.discordGuildsCache = guildCache;
}

function canManageGuild(permissions: string) {
	try {
		const bits = BigInt(permissions);
		return (bits & (ADMINISTRATOR | MANAGE_GUILD)) !== 0n;
	} catch {
		return false;
	}
}

export async function GET(request: NextRequest) {
	const token = await getToken(request);

	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	const session: any = await getServerSession(authOptions);
	const accessToken = session?.accessToken;

	if (!accessToken || !session?.user?.id) {
		return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
	}

	const now = Date.now();
	const cached = guildCache.get(session.user.id);

	if (cached && cached.expiresAt > now) {
		return NextResponse.json({
			guilds: cached.data,
			cached: true,
			stale: false,
			rateLimited: false,
			cachedAt: cached.cachedAt,
		});
	}

	try {
		const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});

		if (response.status === 429 && cached?.data?.length) {
			return NextResponse.json({
				guilds: cached.data,
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

		const data: Guild[] = await response.json();
		const filtered = data.filter((g) => canManageGuild(g.permissions));

		guildCache.set(session.user.id, {
			data: filtered,
			cachedAt: now,
			expiresAt: now + CACHE_TTL,
		});

		return NextResponse.json({
			guilds: filtered,
			cached: false,
			stale: false,
			rateLimited: false,
			cachedAt: now,
		});
	} catch {
		if (cached?.data) {
			return NextResponse.json({
				guilds: cached.data,
				cached: true,
				stale: true,
				rateLimited: false,
				cachedAt: cached.cachedAt,
			});
		}

		return NextResponse.json({ message: 'Failed to fetch guilds.' }, { status: 500 });
	}
}

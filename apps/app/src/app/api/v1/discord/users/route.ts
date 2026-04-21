/** @format */

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';

type DiscordUser = {
	id: string;
	username: string;
	global_name: string | null;
	avatar: string | null;
};

type CacheEntry = {
	data: DiscordUser;
	cachedAt: number;
	expiresAt: number;
};

const CACHE_TTL = 1000 * 60 * 5;

declare global {
	// eslint-disable-next-line no-var
	var discordUserCache: Map<string, CacheEntry> | undefined;
}

const userCache = globalThis.discordUserCache ?? new Map<string, CacheEntry>();

if (!globalThis.discordUserCache) {
	globalThis.discordUserCache = userCache;
}

export async function GET(request: NextRequest) {
	const token = await getToken(request);

	// ✅ enforce session-only via central check
	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	const session: any = await getServerSession(authOptions);
	const accessToken = session?.accessToken;

	if (!accessToken || !session?.user?.id) {
		return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
	}

	const userId = session.user.id;
	const now = Date.now();
	const cached = userCache.get(userId);

	// ✅ cache hit
	if (cached && cached.expiresAt > now) {
		return NextResponse.json(
			{
				user: cached.data,
				cached: true,
				stale: false,
				rateLimited: false,
				cachedAt: cached.cachedAt,
			},
			{ status: 200 }
		);
	}

	try {
		const response = await fetch('https://discord.com/api/v10/users/@me', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			cache: 'no-store',
		});

		// 🧠 rate limit fallback
		if (response.status === 429) {
			if (cached?.data) {
				return NextResponse.json(
					{
						user: cached.data,
						cached: true,
						stale: true,
						rateLimited: true,
						cachedAt: cached.cachedAt,
					},
					{ status: 200 }
				);
			}

			const body = await response.json().catch(() => null);

			return NextResponse.json(
				{
					message: body?.message ?? 'Discord rate limit hit and no cached user is available.',
					rateLimited: true,
				},
				{ status: 429 }
			);
		}

		if (!response.ok) {
			const body = await response.json().catch(() => null);

			return NextResponse.json(
				{
					message: body?.message ?? `Failed to fetch user (${response.status})`,
				},
				{ status: response.status }
			);
		}

		const raw = await response.json();

		const user: DiscordUser = {
			id: raw.id,
			username: raw.username,
			global_name: raw.global_name,
			avatar: raw.avatar,
		};

		userCache.set(userId, {
			data: user,
			cachedAt: now,
			expiresAt: now + CACHE_TTL,
		});

		return NextResponse.json(
			{
				user,
				cached: false,
				stale: false,
				rateLimited: false,
				cachedAt: now,
			},
			{ status: 200 }
		);
	} catch {
		if (cached?.data) {
			return NextResponse.json(
				{
					user: cached.data,
					cached: true,
					stale: true,
					rateLimited: false,
					cachedAt: cached.cachedAt,
				},
				{ status: 200 }
			);
		}

		return NextResponse.json(
			{
				message: 'Failed to fetch user and no cached data is available.',
			},
			{ status: 500 }
		);
	}
}

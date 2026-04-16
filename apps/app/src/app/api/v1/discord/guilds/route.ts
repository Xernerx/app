/** @format */

import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/schema/auth';
import { getServerSession } from 'next-auth';

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
	// eslint-disable-next-line no-var
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

export async function GET() {
	const session: any = await getServerSession(authOptions);
	const accessToken = session?.accessToken;

	if (!accessToken || !session?.user?.id) {
		return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
	}

	const now = Date.now();
	const cached = guildCache.get(session?.user?.id);

	// ✅ USE CACHE FIRST
	if (cached && cached.expiresAt > now) {
		return NextResponse.json(
			{
				guilds: cached.data,
				cached: true,
				stale: false,
				rateLimited: false,
				cachedAt: cached.cachedAt,
			},
			{ status: 200 }
		);
	}

	try {
		const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			cache: 'no-store',
		});

		// 🧠 Rate limit fallback
		if (response.status === 429) {
			if (cached?.data?.length) {
				return NextResponse.json(
					{
						guilds: cached.data,
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
					message: body?.message ?? 'Discord rate limit hit and no cached guilds are available.',
					rateLimited: true,
				},
				{ status: 429 }
			);
		}

		if (!response.ok) {
			const body = await response.json().catch(() => null);

			return NextResponse.json(
				{
					message: body?.message ?? `Failed to fetch guilds (${response.status})`,
				},
				{ status: response.status }
			);
		}

		const data: Guild[] = await response.json();

		const filteredGuilds = data.filter((guild) => canManageGuild(guild.permissions));

		guildCache.set(session?.user?.id, {
			data: filteredGuilds,
			cachedAt: now,
			expiresAt: now + CACHE_TTL,
		});

		return NextResponse.json(
			{
				guilds: filteredGuilds,
				cached: false,
				stale: false,
				rateLimited: false,
				cachedAt: now,
			},
			{ status: 200 }
		);
	} catch {
		// 🧠 fallback if Discord dies
		if (cached?.data?.length) {
			return NextResponse.json(
				{
					guilds: cached.data,
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
				message: 'Failed to fetch guilds and no cached data is available.',
			},
			{ status: 500 }
		);
	}
}

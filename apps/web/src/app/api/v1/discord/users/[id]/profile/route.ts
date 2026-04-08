/** @format */
'use server';

import { NextRequest, NextResponse } from 'next/server';

type CacheEntry = {
	data: any; // full Discord payload
	cachedAt: number;
	expiresAt: number;
};

const CACHE_TTL = 1000 * 60 * 5;

declare global {
	// eslint-disable-next-line no-var
	var discordUserByIdCache: Map<string, CacheEntry> | undefined;
}

const userCache = globalThis.discordUserByIdCache ?? new Map<string, CacheEntry>();

if (!globalThis.discordUserByIdCache) {
	globalThis.discordUserByIdCache = userCache;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ message: 'Missing user id.' }, { status: 400 });
	}

	const botToken = process.env.DISCORD_CLIENT_TOKEN;

	if (!botToken) {
		return NextResponse.json({ message: 'Bot token not configured.' }, { status: 500 });
	}

	const now = Date.now();
	const cached = userCache.get(id);

	// ✅ use cache
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
		const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
			headers: {
				Authorization: `Bot ${botToken}`,
			},
			cache: 'no-store',
		});

		// rate limit fallback
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

		const raw = await response.json(); // 👈 EVERYTHING

		userCache.set(id, {
			data: raw,
			cachedAt: now,
			expiresAt: now + CACHE_TTL,
		});

		return NextResponse.json(
			{
				user: raw,
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

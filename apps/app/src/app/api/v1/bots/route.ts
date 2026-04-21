/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';
import validate from '@/lib/functions/validate';
import { z } from 'zod';

/* ========================= SCHEMA ========================= */

const querySchema = z.object({
	all: z
		.enum(['true', 'false'])
		.optional()
		.transform((v) => v === 'true'),
	privacy: z.enum(['public', 'private', 'limited']).optional(),
});

/* ========================= GET ========================= */

export async function GET(request: NextRequest) {
	const token = await getToken(request);

	const c = await check({ token });
	if (c) return c;

	const session: any = await getServerSession(authOptions);
	const id = session?.user?.id;

	const result = await validate(request, querySchema, { source: 'query' });
	if ('response' in result) return result.response;

	const { all, privacy } = result.data;

	const profilesDb = await database('xernerx', 'profiles');

	const filter: Record<string, any> = {};

	/* ================= ACCESS CONTROL ================= */

	if (session) {
		if (!all) {
			filter.owners = id;
		}

		if (privacy) {
			filter.privacy = privacy;
		}
	} else {
		// token → public only
		filter.privacy = 'public';
	}

	/* ================= FETCH BOTS ================= */

	const bots = await profilesDb.bot.find(filter).select('id description privacy').lean();

	// nothing to enrich
	if (!bots.length) {
		return NextResponse.json([], { status: 200 });
	}

	/* ================= FETCH STATS ================= */

	const statsDb = await database('xernerx', 'stats');

	const stats = await statsDb.bot.aggregate([
		{
			$match: {
				id: { $in: bots.map((b: any) => b.id) },
			},
		},
		{ $sort: { timestamp: -1 } },
		{
			$group: {
				_id: '$id',
				latest: { $first: '$$ROOT' },
			},
		},
	]);

	/* ================= MAP ================= */

	const statsMap = new Map(stats.map((s: any) => [s._id, s.latest]));

	const enrichedBots = bots.map((bot: any) => ({
		...bot,
		stats: statsMap.get(bot.id) ?? null,
	}));

	/* ================= RESPONSE ================= */

	return NextResponse.json(enrichedBots, { status: 200 });
}

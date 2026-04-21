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

const querySchema = z.object({
	all: z
		.enum(['true', 'false'])
		.optional()
		.transform((v) => v === 'true'),
	privacy: z.enum(['public', 'private', 'limited']).optional(),
});

export async function GET(request: NextRequest) {
	const token = await getToken(request);

	const c = await check({ token });
	if (c) return c;

	const session: any = await getServerSession(authOptions);
	const id = session?.user?.id;

	const result = await validate(request, querySchema, { source: 'query' });
	if ('response' in result) return result.response;

	const { all, privacy } = result.data;

	const db = await database('xernerx', 'profiles');

	const filter: Record<string, any> = {};

	// --- ACCESS CONTROL ---

	if (session) {
		// session users can access their own or all (depending on `all`)
		if (!all) {
			filter.owners = id;
		}

		if (privacy) {
			filter.privacy = privacy;
		}
	} else {
		// token-based access → public only, no exceptions
		filter.privacy = 'public';
	}

	// --- QUERY ---

	const bots = await db.bot.find(filter).select('id description privacy').lean();

	return NextResponse.json(bots, { status: 200 });
}

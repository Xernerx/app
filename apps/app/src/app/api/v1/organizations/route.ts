/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import check from '@/lib/functions/check';
import database from '@/lib/database';
import getToken from '@/lib/functions/getToken';
import validate from '@/lib/functions/validate';
import { z } from 'zod';

const querySchema = z.object({
	all: z
		.enum(['true', 'false'])
		.optional()
		.transform((v) => v === 'true'),
});

export async function GET(request: NextRequest) {
	const token = await getToken(request);

	// validate query properly instead of string guessing
	const result = await validate(request, querySchema, { source: 'query' });
	if ('response' in result) return result.response;

	const { all } = result.data;

	// if NOT requesting all → require session
	if (!all) {
		const c = await check({ token, sessionOnly: true });
		if (c) return c;
	} else {
		// public path still runs through check for token sanity
		const c = await check({ token });
		if (c) return c;
	}

	const db = await database('xernerx', 'profiles');

	let filter: any = {};

	if (!all) {
		// we KNOW session exists here because of check()
		const session: any = await import('next-auth').then(async ({ getServerSession }) => getServerSession((await import('@/lib/schema/auth')).authOptions));

		filter = { owner: session?.user?.id };
	}

	const orgs = await db.organization.find(filter).select('_id name').lean();

	return NextResponse.json(orgs, { status: 200 });
}

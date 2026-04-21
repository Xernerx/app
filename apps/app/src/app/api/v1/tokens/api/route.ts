/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';

export async function GET(req: NextRequest) {
	const token = await getToken(req);

	// ✅ enforce session-only
	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	const session: any = await getServerSession(authOptions);
	const userId = session?.user?.id;

	if (!userId) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	const db = await database('xernerx', 'tokens');

	const tokens = await db.api.find({ owners: userId }).select('id name status').lean();

	return NextResponse.json(tokens, { status: 200 });
}

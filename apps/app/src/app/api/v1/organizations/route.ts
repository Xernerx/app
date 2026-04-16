/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const params = new URLSearchParams(url.search);
	const all = params.get('all') === 'true';

	const session: any = await getServerSession(authOptions);
	const userId = session?.user?.id;

	if (!userId && !all) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = await database('xernerx', 'profiles');

	let filter: any = {};

	if (!all) {
		filter = { owner: userId };
	}

	const orgs = await db.organization.find(filter).select('_id name').lean();

	return NextResponse.json(orgs);
}

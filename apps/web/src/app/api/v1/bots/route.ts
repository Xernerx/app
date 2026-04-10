/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const params = new URLSearchParams(url.search);
	const all = !!params.get('all');
	const privacy = params.get('privacy');

	const session: any = await getServerSession(authOptions);

	const id = session?.user?.id;

	const db = await database('xernerx', 'profiles');

	const filter: Record<string, string> = {};

	if (!all) filter.owners = id;
	if (privacy) filter.privacy = privacy;

	const bots = await db.bot.find(filter).select('id description privacy');

	return NextResponse.json(bots);
}

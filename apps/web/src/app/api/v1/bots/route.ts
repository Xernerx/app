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

	const session: any = await getServerSession(authOptions);

	const id = session?.user?.id;

	const db = await database('xernerx', 'profiles');

	const filter: Record<string, string> = {};

	if (!all) filter.owners = id;

	const bots = await db.bot.find(filter).select('id');

	return NextResponse.json(bots);
}

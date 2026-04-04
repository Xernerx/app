/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';

export async function GET(_: NextRequest) {
	const session = await getServerSession(authOptions);
	const db = await database('xernerx', 'tokens');

	const tokens = await db.api.find({ owners: session?.id }).select('id name status');

	return NextResponse.json(tokens, { status: 200, statusText: 'OK' });
}

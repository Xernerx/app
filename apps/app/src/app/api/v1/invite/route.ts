/** @format */

import { NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET() {
	const db = await database('xernerx', 'tokens');

	const invites = await db.invite.find().lean();

	return NextResponse.json({ invites });
}

export async function POST(req: Request) {
	const db = await database('xernerx', 'tokens');
	const body = await req.json();

	const invite = await db.invite.create({
		id: body.id, // ← bot client ID
		name: body.name,
		shortName: body.shortName,
		permissions: body.permissions,
	});

	return NextResponse.json({ invite });
}

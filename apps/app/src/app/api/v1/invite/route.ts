/** @format */

import { NextRequest, NextResponse } from 'next/server';

import check from '@/lib/functions/check';
import database from '@/lib/database';
import getToken from '@/lib/functions/getToken';
import { z } from 'zod';

const inviteSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	shortName: z.string().min(1),
	permissions: z.any().optional(), // refine later if needed
});

/* ========================= GET (PUBLIC) ========================= */

export async function GET() {
	const db = await database('xernerx', 'tokens');

	const invites = await db.invite.find().lean();

	return NextResponse.json({ invites }, { status: 200 });
}

/* ========================= POST (SESSION ONLY) ========================= */

export async function POST(req: NextRequest) {
	const token = await getToken(req);

	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	let json: unknown;

	try {
		json = await req.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = inviteSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json(
			{
				error: 'Invalid request body',
				fields: parsed.error.flatten(),
			},
			{ status: 400 }
		);
	}

	const db = await database('xernerx', 'tokens');

	const existing = await db.invite.findOne({ id: parsed.data.id }).lean();
	if (existing) {
		return NextResponse.json({ error: 'Invite already exists' }, { status: 409 });
	}

	const invite = await db.invite.create(parsed.data);

	return NextResponse.json({ invite }, { status: 201 });
}

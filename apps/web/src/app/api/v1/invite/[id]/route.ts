/** @format */

import { NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
	const db = await database('xernerx', 'tokens');

	const invite = await db.invite.findOne({ id: (await params).id }).lean();

	if (!invite) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	return NextResponse.json({ invite });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const db = await database('xernerx', 'tokens');

	const body = await req.json();

	const invite = await db.invite.findOneAndUpdate(
		{ id: (await params).id },
		{
			name: body.name,
			shortName: body.shortName,
			permissions: body.permissions,
		},
		{ new: true }
	);

	return NextResponse.json({ invite });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
	const db = await database('xernerx', 'tokens');

	await db.invite.deleteOne({ id: (await params).id });

	return NextResponse.json({ success: true });
}

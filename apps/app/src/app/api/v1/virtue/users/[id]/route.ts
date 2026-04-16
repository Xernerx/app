/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import database from '@/lib/database';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;
	const db = await database('virtue', 'profiles');

	let user = await db.user.findOne({ id });

	if (!user)
		user = await db.user.create({
			id,
		});

	return NextResponse.json(user);
}

/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import database from '@/lib/database';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
	const { id } = await params;

	const { user } = await database('xernerx', 'profiles');

	let profile = await user.findOne({ id });

	if (!profile) await user.create({ id });

	return NextResponse.json(profile);
}

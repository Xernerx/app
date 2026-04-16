/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import database from '@/lib/database';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
	const id = (await params).id;

	const { user } = await database('xernerx', 'profiles');

	const profile = await user.findOne({ id });

	if (!profile) {
		return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
	}

	return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
	const body = await req.json();

	if (!body.id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	const { user } = await database('xernerx', 'profiles');

	const existing = await user.findOne({ id: body.id });

	if (existing) {
		return NextResponse.json({ error: 'User already exists' }, { status: 409 });
	}

	if (body.birthday) {
		body.birthday = new Date(body.birthday);
	}

	const created = await user.create(body);

	return NextResponse.json(created);
}

export async function PATCH(req: NextRequest, { params }: Params) {
	const id = (await params).id;
	const body = await req.json();

	if (body.birthday) {
		body.birthday = new Date(body.birthday);
	}

	const { user } = await database('xernerx', 'profiles');

	const updated = await user.findOneAndUpdate({ id }, { $set: body }, { new: true });

	if (!updated) {
		return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
	}

	return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
	const id = (await params).id;

	const { user } = await database('xernerx', 'profiles');

	const deleted = await user.findOneAndDelete({ id });

	if (!deleted) {
		return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
	}

	return NextResponse.json(deleted);
}

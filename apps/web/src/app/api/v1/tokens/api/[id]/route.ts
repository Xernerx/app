/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import database from '@/lib/database';
import { generateToken } from '@/lib/generateToken';
import { getServerSession } from 'next-auth';

/**
 * GET - fetch single token
 */
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	if (!session?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

	const db = await database('xernerx', 'tokens');
	const id = (await params).id;

	const token = await db.api.findOne({ id, owners: session.id });

	if (!token) {
		return NextResponse.json({ message: 'Token does not exist' }, { status: 404 });
	}

	return NextResponse.json(token, { status: 200 });
}

/**
 * POST - create token
 */

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session?.id) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	const db = await database('xernerx', 'tokens');
	const body = await req.json();

	if (!body.name) {
		return NextResponse.json({ message: 'Missing name' }, { status: 400 });
	}

	const id = await generateToken();

	const token = {
		id,
		name: body.name,
		owners: [session.id],
		status: 'pending',
		botId: null,
		createdAt: new Date(),
	};

	await db.api.insertOne(token);

	return NextResponse.json(token, { status: 201 });
}

/**
 * PATCH - update token
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	if (!session?.id) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	const db = await database('xernerx', 'tokens');
	const id = (await params).id;
	const body = await req.json();

	const existing = await db.api.findOne({ id, owners: session.id });
	if (!existing) {
		return NextResponse.json({ message: 'Token not found' }, { status: 404 });
	}

	const update: any = {};

	// basic fields
	if (body.name !== undefined) update.name = body.name;
	if (body.status !== undefined) update.status = body.status;
	if (body.botId !== undefined) update.botId = body.botId;

	// owners update
	if (body.owners !== undefined) {
		if (!Array.isArray(body.owners)) {
			return NextResponse.json({ message: 'Invalid owners format' }, { status: 400 });
		}

		// dedupe + sanitize
		const uniqueOwners = [...new Set(body.owners.filter(Boolean))];

		// optional: prevent user from removing themselves
		if (!uniqueOwners.includes(session.id)) {
			return NextResponse.json({ message: 'You cannot remove yourself as an owner' }, { status: 403 });
		}

		update.owners = uniqueOwners;
	}

	if (Object.keys(update).length === 0) {
		return NextResponse.json({ message: 'Nothing to update' }, { status: 400 });
	}

	await db.api.updateOne({ id }, { $set: update });

	const updated = await db.api.findOne({ id });

	return NextResponse.json(updated, { status: 200 });
}

/**
 * DELETE - remove token
 */
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	if (!session?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

	const db = await database('xernerx', 'tokens');
	const id = (await params).id;

	const existing = await db.api.findOne({ id, owners: session.id });
	if (!existing) {
		return NextResponse.json({ message: 'Token not found' }, { status: 404 });
	}

	await db.api.deleteOne({ id });

	return NextResponse.json({ message: 'Token deleted' }, { status: 200 });
}

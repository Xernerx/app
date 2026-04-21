/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import database from '@/lib/database';
import { generateToken } from '@/lib/generateToken';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';
import { z } from 'zod';

/* ========================= SCHEMAS ========================= */

const createSchema = z.object({
	name: z.string().min(1),
});

const updateSchema = z.object({
	name: z.string().min(1).optional(),
	status: z.enum(['pending', 'active', 'suspended']).optional(),
	botId: z.string().nullable().optional(),
	owners: z.array(z.string().min(1)).optional(),
});

/* ========================= SESSION GUARD ========================= */

async function guardSession(req: NextRequest) {
	const token = await getToken(req);

	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	const session: any = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	return { session };
}

/* ========================= GET ========================= */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const guard = await guardSession(req);
	if (guard instanceof NextResponse) return guard;

	const session: any = guard.session;
	const id = (await params).id;

	const db = await database('xernerx', 'tokens');

	const tokenDoc = await db.api.findOne({
		id,
		owners: session.user.id,
	});

	if (!tokenDoc) {
		return NextResponse.json({ message: 'Token not found' }, { status: 404 });
	}

	return NextResponse.json(tokenDoc, { status: 200 });
}

/* ========================= POST ========================= */

export async function POST(req: NextRequest) {
	const guard = await guardSession(req);
	if (guard instanceof NextResponse) return guard;

	const session: any = guard.session;

	let json: unknown;

	try {
		json = await req.json();
	} catch {
		return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = createSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json({ message: 'Invalid body', fields: parsed.error.flatten() }, { status: 400 });
	}

	const db = await database('xernerx', 'tokens');

	const id = await generateToken();

	const tokenDoc = {
		id,
		name: parsed.data.name,
		owners: [session.user.id],
		status: 'pending',
		botId: null,
		createdAt: new Date(),
	};

	await db.api.insertOne(tokenDoc);

	return NextResponse.json(tokenDoc, { status: 201 });
}

/* ========================= PATCH ========================= */

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const guard = await guardSession(req);
	if (guard instanceof NextResponse) return guard;

	const session: any = guard.session;
	const id = (await params).id;

	let json: unknown;

	try {
		json = await req.json();
	} catch {
		return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = updateSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json({ message: 'Invalid body', fields: parsed.error.flatten() }, { status: 400 });
	}

	if (Object.keys(parsed.data).length === 0) {
		return NextResponse.json({ message: 'Nothing to update' }, { status: 400 });
	}

	const db = await database('xernerx', 'tokens');

	const existing = await db.api.findOne({
		id,
		owners: session.user.id,
	});

	if (!existing) {
		return NextResponse.json({ message: 'Token not found' }, { status: 404 });
	}

	const update: any = { ...parsed.data };

	// owners logic
	if (update.owners) {
		const uniqueOwners = [...new Set(update.owners.filter(Boolean))];

		if (!uniqueOwners.includes(session.user.id)) {
			return NextResponse.json({ message: 'You cannot remove yourself as an owner' }, { status: 403 });
		}

		update.owners = uniqueOwners;
	}

	await db.api.updateOne({ id }, { $set: update });

	const updated = await db.api.findOne({ id });

	return NextResponse.json(updated, { status: 200 });
}

/* ========================= DELETE ========================= */

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const guard = await guardSession(req);
	if (guard instanceof NextResponse) return guard;

	const session: any = guard.session;
	const id = (await params).id;

	const db = await database('xernerx', 'tokens');

	const existing = await db.api.findOne({
		id,
		owners: session.user.id,
	});

	if (!existing) {
		return NextResponse.json({ message: 'Token not found' }, { status: 404 });
	}

	await db.api.deleteOne({ id });

	return NextResponse.json({ message: 'Token deleted' }, { status: 200 });
}

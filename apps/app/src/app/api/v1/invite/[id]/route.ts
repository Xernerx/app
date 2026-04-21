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

const inviteUpdateSchema = inviteSchema.partial().omit({ id: true });

/* ========================= GET (PUBLIC) ========================= */

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	const db = await database('xernerx', 'tokens');

	const invite = await db.invite.findOne({ id }).lean();

	if (!invite) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	return NextResponse.json({ invite }, { status: 200 });
}

/* ========================= WRITE GUARD ========================= */

async function guardSession(req: NextRequest) {
	const token = await getToken(req);

	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	return null;
}

/* ========================= POST ========================= */

export async function POST(req: NextRequest) {
	const guard = await guardSession(req);
	if (guard) return guard;

	let json: unknown;

	try {
		json = await req.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = inviteSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid request body', fields: parsed.error.flatten() }, { status: 400 });
	}

	const db = await database('xernerx', 'tokens');

	const existing = await db.invite.findOne({ id: parsed.data.id }).lean();
	if (existing) {
		return NextResponse.json({ error: 'Invite already exists' }, { status: 409 });
	}

	const created = await db.invite.create(parsed.data);

	return NextResponse.json({ invite: created }, { status: 201 });
}

/* ========================= PATCH ========================= */

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const guard = await guardSession(req);
	if (guard) return guard;

	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	let json: unknown;

	try {
		json = await req.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = inviteUpdateSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid request body', fields: parsed.error.flatten() }, { status: 400 });
	}

	if (Object.keys(parsed.data).length === 0) {
		return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
	}

	const db = await database('xernerx', 'tokens');

	const invite = await db.invite.findOneAndUpdate({ id }, { $set: parsed.data }, { returnDocument: 'after' }).lean();

	if (!invite) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	return NextResponse.json({ invite }, { status: 200 });
}

/* ========================= DELETE ========================= */

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const guard = await guardSession(req);
	if (guard) return guard;

	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	const db = await database('xernerx', 'tokens');

	const result = await db.invite.deleteOne({ id });

	if (result.deletedCount === 0) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}

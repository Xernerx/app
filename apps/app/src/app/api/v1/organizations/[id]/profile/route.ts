/** @format */

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';
import { z } from 'zod';

function getId(params: { id: string }) {
	return params.id?.trim() || null;
}

/* ========================= GET (PUBLIC) ========================= */

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		const org = await db.organization.findById(id).lean();

		if (!org) {
			return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
		}

		return NextResponse.json(org, { status: 200 });
	} catch (error) {
		console.error('GET org error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* ========================= SCHEMAS ========================= */

const orgSchema = z.object({
	name: z.string().min(1),
	icon: z.string().optional(),
	description: z.string().optional(),
});

const updateSchema = orgSchema.partial();

/* ========================= SESSION GUARD ========================= */

async function guardSession(req: NextRequest) {
	const token = await getToken(req);

	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	const session: any = await getServerSession(authOptions);

	return { session };
}

/* ========================= POST ========================= */

export async function POST(request: NextRequest) {
	try {
		const guard = await guardSession(request);
		if (guard instanceof NextResponse) return guard;

		const session: any = guard.session;
		const userId = session?.user?.id;

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		let json: unknown;

		try {
			json = await request.json();
		} catch {
			return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		const parsed = orgSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid body', fields: parsed.error.flatten() }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		const created = await db.organization.create({
			owner: userId,
			...parsed.data,
		});

		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		console.error('POST org error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* ========================= PATCH ========================= */

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const guard = await guardSession(request);
		if (guard instanceof NextResponse) return guard;

		let json: unknown;

		try {
			json = await request.json();
		} catch {
			return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		const parsed = updateSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid body', fields: parsed.error.flatten() }, { status: 400 });
		}

		if (Object.keys(parsed.data).length === 0) {
			return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		const updated = await db.organization.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: 'after', runValidators: true }).lean();

		if (!updated) {
			return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
		}

		return NextResponse.json(updated, { status: 200 });
	} catch (error) {
		console.error('PATCH org error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* ========================= DELETE ========================= */

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const guard = await guardSession(request);
		if (guard instanceof NextResponse) return guard;

		const db = await database('xernerx', 'profiles');

		const deleted = await db.organization.findByIdAndDelete(id).lean();

		if (!deleted) {
			return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true, id }, { status: 200 });
	} catch (error) {
		console.error('DELETE org error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

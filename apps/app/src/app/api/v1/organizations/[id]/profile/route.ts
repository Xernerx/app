/** @format */

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

function getId(params: { id: string }) {
	return params.id?.trim() || null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		// ✅ use _id
		const org = await db.organization.findById(id).lean();

		if (!org) {
			return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
		}

		return NextResponse.json(org);
	} catch (error) {
		console.error('GET org error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

const orgSchema = z.object({
	name: z.string().min(1),
	icon: z.string().optional(),
	description: z.string().optional(),
});

export async function POST(request: NextRequest) {
	try {
		const session: any = await getServerSession(authOptions);
		const userId = session?.user?.id;

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const json = await request.json();
		const parsed = orgSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid body', fields: parsed.error.flatten() }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		// ✅ check by _id

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

const updateSchema = orgSchema.partial();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const json = await request.json();
		const parsed = updateSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid body', fields: parsed.error.flatten() }, { status: 400 });
		}

		if (Object.keys(parsed.data).length === 0) {
			return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		// ✅ update by _id
		const updated = await db.organization.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: 'after', runValidators: true }).lean();

		if (!updated) {
			return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
		}

		return NextResponse.json(updated);
	} catch (error) {
		console.error('PATCH org error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		// ✅ delete by _id
		const deleted = await db.organization.findByIdAndDelete(id).lean();

		if (!deleted) {
			return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error('DELETE org error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

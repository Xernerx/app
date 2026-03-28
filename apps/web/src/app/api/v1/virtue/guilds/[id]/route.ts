/** @format */

import { NextRequest, NextResponse } from 'next/server';

import database from '@/lib/database';
import { z } from 'zod';

function getId(params: { id: string }) {
	return params.id?.trim() || null;
}

/* -------------------------- SCHEMA -------------------------- */

const levelsSchema = z.object({
	mode: z.string().min(1).default('balanced'),
	roles: z
		.object({
			ignored: z.array(z.string()).optional(),
			tracked: z.array(z.string()).optional(),
		})
		.optional(),
});

const updateSchema = levelsSchema.partial();

/* -------------------------- GET -------------------------- */

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const db = await database('virtue', 'profiles');

		const config = await db.guild.findOne({ id }).lean();

		if (!config) {
			return NextResponse.json({ error: 'Levels config not found' }, { status: 404 });
		}

		return NextResponse.json(config);
	} catch (error) {
		console.error('GET levels error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* -------------------------- POST -------------------------- */

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const json = await request.json();
		const parsed = levelsSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid body', fields: parsed.error.flatten() }, { status: 400 });
		}

		const db = await database('virtue', 'profiles');

		const exists = await db.guild.findOne({ id }).lean();

		if (exists) {
			return NextResponse.json({ error: 'Levels config already exists' }, { status: 409 });
		}

		const created = await db.guild.create({
			id,
			...parsed.data,
		});

		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		console.error('POST levels error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* -------------------------- PATCH -------------------------- */

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

		const db = await database('virtue', 'profiles');

		const updated = await db.guild.findOneAndUpdate({ id }, { $set: parsed.data }, { returnDocument: 'after', runValidators: true }).lean();

		if (!updated) {
			return NextResponse.json({ error: 'Levels config not found' }, { status: 404 });
		}

		return NextResponse.json(updated);
	} catch (error) {
		console.error('PATCH levels error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* -------------------------- DELETE -------------------------- */

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = getId(await params);

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const db = await database('virtue', 'profiles');

		const deleted = await db.guild.findOneAndDelete({ id }).lean();

		if (!deleted) {
			return NextResponse.json({ error: 'Levels config not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error('DELETE levels error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

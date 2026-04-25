/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import check from '@/lib/functions/check';
import database from '@/lib/database';
import getToken from '@/lib/functions/getToken';
import validate from '@/lib/functions/validate';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

/* ========================= SCHEMAS ========================= */

const createSchema = z.object({
	id: z.string().min(1),

	name: z.string().optional(),
	icon: z.string().url().optional(),

	description: z.string().optional(),
	info: z.string().optional(),

	birthday: z.coerce.date().optional(),

	gender: z.enum(['male', 'female', 'other']).optional(),
	pronouns: z.string().optional(),
	timezone: z.string().optional(),
	email: z.string().email().optional(),

	role: z.string().optional(),

	permissions: z.any().optional(),
	notifications: z.any().optional(),

	seen: z.coerce.date().optional(),

	organizations: z
		.object({
			id: z.string(), // ObjectId → string
			role: z.string().optional(),
		})
		.optional(),

	verified: z.boolean().optional(),

	privacy: z.enum(['public', 'private', 'limited']).default('private'),

	locale: z.string().optional(),

	links: z.record(z.string(), z.any()).optional(),

	appearance: z.any().optional(),

	hooks: z
		.array(
			z.object({
				name: z.string(),
				description: z.string().optional(),
				url: z.string().url(),
				data: z.string().optional(),
			})
		)
		.optional(),
});

const updateSchema = createSchema.partial().omit({ id: true });

/* ========================= GET (PUBLIC) ========================= */

export async function GET(_: NextRequest, { params }: Params) {
	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	const { user } = await database('xernerx', 'profiles');

	const profile = await user.findOne({ id }).lean();

	if (!profile) {
		return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
	}

	return NextResponse.json(profile, { status: 200 });
}

/* ========================= SESSION GUARD ========================= */

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

	const result = await validate(req, createSchema);
	if ('response' in result) return result.response;

	const data: any = { ...result.data };

	if (data.birthday) {
		data.birthday = new Date(data.birthday);
	}

	const { user } = await database('xernerx', 'profiles');

	const existing = await user.findOne({ id: data.id }).lean();

	if (existing) {
		return NextResponse.json({ error: 'User already exists' }, { status: 409 });
	}

	const created = await user.create(data);

	return NextResponse.json(created, { status: 201 });
}

/* ========================= PATCH ========================= */

export async function PATCH(req: NextRequest, { params }: Params) {
	const guard = await guardSession(req);
	if (guard) return guard;

	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	const result = await validate(req, updateSchema);
	if ('response' in result) return result.response;

	if (Object.keys(result.data).length === 0) {
		return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
	}

	const update: any = { ...result.data };

	if (update.birthday) {
		update.birthday = new Date(update.birthday);
	}

	const { user } = await database('xernerx', 'profiles');

	const updated = await user.findOneAndUpdate({ id }, { $set: update }, { returnDocument: 'after' }).lean();

	console.log(updated);

	if (!updated) {
		return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
	}

	return NextResponse.json(updated, { status: 200 });
}

/* ========================= DELETE ========================= */

export async function DELETE(req: NextRequest, { params }: Params) {
	const guard = await guardSession(req);
	if (guard) return guard;

	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	const { user } = await database('xernerx', 'profiles');

	const deleted = await user.findOneAndDelete({ id }).lean();

	if (!deleted) {
		return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
	}

	return NextResponse.json(deleted, { status: 200 });
}

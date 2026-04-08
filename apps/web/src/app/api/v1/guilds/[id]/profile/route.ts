/** @format */

import { NextRequest, NextResponse } from 'next/server';

import database from '@/lib/database';
import { z } from 'zod';

const hookSchema = z.object({
	name: z.string().min(1),
	url: z.string().min(1),
	description: z.string().optional(),
	data: z.string().optional(),
});

const guildSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	icon: z.string().optional(),
	description: z.string().optional(),
	info: z.string().optional(),
	organization: z.string().optional(),
	bot: z.boolean().default(false),
	verified: z.boolean().optional(),
	privacy: z.enum(['public', 'private', 'limited']).optional(),
	locale: z.string().optional(),
	links: z
		.object({
			invite: z.string().optional(),
			website: z.string().optional(),
		})
		.optional(),
	hooks: z.array(hookSchema).optional(),
});

const guildUpdateSchema = guildSchema.partial().omit({ id: true });

export const dynamic = 'force-dynamic';

/* ========================= GET ========================= */

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = (await params).id;

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');
		const guild = await db.guild.findOne({ id }).lean();

		if (!guild) {
			return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
		}

		return NextResponse.json(guild, { status: 200 });
	} catch (error) {
		console.error('GET guild error:', error);

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* ========================= POST ========================= */

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = (await params).id;
		const json = await request.json();

		const parsed = guildSchema.safeParse({
			...json,
			id, // force path id
		});

		if (!parsed.success) {
			return NextResponse.json(
				{
					error: 'Invalid request body',
					fields: parsed.error.flatten(),
				},
				{ status: 400 }
			);
		}

		const db = await database('xernerx', 'profiles');

		const existingGuild = await db.guild.findOne({ id }).lean();

		if (existingGuild) {
			return NextResponse.json({ error: 'Guild already exists' }, { status: 409 });
		}

		const createdGuild = await db.guild.create(parsed.data);

		return NextResponse.json(createdGuild, { status: 201 });
	} catch (error) {
		console.error('POST guild error:', error);

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* ========================= PATCH ========================= */

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = (await params).id;

		const json = await request.json();
		const parsed = guildUpdateSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{
					error: 'Invalid request body',
					fields: parsed.error.flatten(),
				},
				{ status: 400 }
			);
		}

		if (Object.keys(parsed.data).length === 0) {
			return NextResponse.json({ error: 'No valid fields provided to update' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		const updatedGuild = await db.guild
			.findOneAndUpdate(
				{ id },
				{ $set: parsed.data },
				{
					returnDocument: 'after',
					runValidators: true,
				}
			)
			.lean();

		if (!updatedGuild) {
			return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
		}

		return NextResponse.json(updatedGuild, { status: 200 });
	} catch (error) {
		console.error('PATCH guild error:', error);

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/* ========================= DELETE ========================= */

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const id = (await params).id;

		const db = await database('xernerx', 'profiles');

		const deletedGuild = await db.guild.findOneAndDelete({ id }).lean();

		if (!deletedGuild) {
			return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true, id }, { status: 200 });
	} catch (error) {
		console.error('DELETE guild error:', error);

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

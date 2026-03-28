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

const commandSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
});

const botSchema = z.object({
	id: z.string().min(1),
	description: z.string().optional(),
	info: z.string().optional(),
	owners: z.array(z.string()).optional(),
	organization: z.string().optional(),
	verified: z.boolean().optional(),
	privacy: z.enum(['public', 'private', 'limited']).optional(),
	links: z
		.object({
			invite: z.string().optional(),
			support: z.string().optional(),
			community: z.string().optional(),
			github: z.string().optional(),
			website: z.string().optional(),
			privacy: z.string().optional(),
			terms: z.string().optional(),
		})
		.optional(),
	hooks: z.array(hookSchema).optional(),
	commands: z.array(commandSchema).optional(),
});

const botUpdateSchema = botSchema.partial().omit({ id: true });

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
	try {
		const id = (await params).id;

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');
		const bot = await db.bot.findOne({ id }).lean();

		if (!bot) {
			return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
		}

		return NextResponse.json(bot, { status: 200 });
	} catch (error) {
		console.error('GET bot error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const id = (await params).id;

		const json = await request.json();
		const parsed = botSchema.safeParse({ ...json, id });

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

		const existing = await db.bot.findOne({ id }).lean();
		if (existing) {
			return NextResponse.json({ error: 'Bot already exists' }, { status: 409 });
		}

		const created = await db.bot.create(parsed.data);

		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		console.error('POST bot error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const id = (await params).id;

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const json = await request.json();
		const parsed = botUpdateSchema.safeParse(json);

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
			return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		const updated = await db.bot.findOneAndUpdate({ id }, { $set: parsed.data }, { returnDocument: 'after', runValidators: true }).lean();

		if (!updated) {
			return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
		}

		return NextResponse.json(updated, { status: 200 });
	} catch (error) {
		console.error('PATCH bot error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
	try {
		const id = (await params).id;

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const db = await database('xernerx', 'profiles');

		const deleted = await db.bot.findOneAndDelete({ id }).lean();

		if (!deleted) {
			return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true, id }, { status: 200 });
	} catch (error) {
		console.error('DELETE bot error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

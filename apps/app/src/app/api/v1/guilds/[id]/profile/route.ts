/** @format */

import { NextRequest, NextResponse } from 'next/server';

import { PermissionFlagsBits } from 'discord-api-types/v10';
import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/* ========================= SCHEMAS ========================= */

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

/* ========================= PERMISSIONS ========================= */

function hasManagePermission(permissions: string | bigint) {
	try {
		const bits = typeof permissions === 'bigint' ? permissions : BigInt(permissions);

		return (bits & PermissionFlagsBits.Administrator) !== 0n || (bits & PermissionFlagsBits.ManageGuild) !== 0n;
	} catch {
		return false;
	}
}

function canModifyGuild(session: any, guildId: string) {
	if (!session?.guilds) return false;

	const guild = session.guilds.find((g: any) => g.id === guildId);
	if (!guild) return false;

	return hasManagePermission(guild.permissions);
}

/* ========================= GET ========================= */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const token = await getToken(req);

	// still allow token for public reads via check
	const c = await check({ token });
	if (c) return c;

	const id = (await params).id;

	if (!id) {
		return NextResponse.json({ error: 'Missing id' }, { status: 400 });
	}

	const db = await database('xernerx', 'profiles');
	const guild = await db.guild.findOne({ id }).lean();

	if (!guild) {
		return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
	}

	// 🔒 private guilds require session
	if (guild.privacy !== 'public') {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}
	}

	return NextResponse.json(guild, { status: 200 });
}

/* ========================= WRITE GUARD ========================= */

async function guardWrite(req: NextRequest, guildId: string) {
	const token = await getToken(req);

	// 🚫 session-only enforcement
	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	const session: any = await getServerSession(authOptions);

	if (!canModifyGuild(session, guildId)) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	return null;
}

/* ========================= POST ========================= */

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	const guard = await guardWrite(req, id);
	if (guard) return guard;

	const json = await req.json();
	const parsed = guildSchema.safeParse({ ...json, id });

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid request body', fields: parsed.error.flatten() }, { status: 400 });
	}

	const db = await database('xernerx', 'profiles');

	const existing = await db.guild.findOne({ id }).lean();
	if (existing) {
		return NextResponse.json({ error: 'Guild already exists' }, { status: 409 });
	}

	const created = await db.guild.create(parsed.data);

	return NextResponse.json(created, { status: 201 });
}

/* ========================= PATCH ========================= */

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	const guard = await guardWrite(req, id);
	if (guard) return guard;

	const json = await req.json();
	const parsed = guildUpdateSchema.safeParse(json);

	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid request body', fields: parsed.error.flatten() }, { status: 400 });
	}

	if (Object.keys(parsed.data).length === 0) {
		return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
	}

	const db = await database('xernerx', 'profiles');

	const updated = await db.guild.findOneAndUpdate({ id }, { $set: parsed.data }, { returnDocument: 'after' }).lean();

	if (!updated) {
		return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
	}

	return NextResponse.json(updated, { status: 200 });
}

/* ========================= DELETE ========================= */

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	const guard = await guardWrite(req, id);
	if (guard) return guard;

	const db = await database('xernerx', 'profiles');

	const deleted = await db.guild.findOneAndDelete({ id }).lean();

	if (!deleted) {
		return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
	}

	return NextResponse.json({ success: true, id }, { status: 200 });
}

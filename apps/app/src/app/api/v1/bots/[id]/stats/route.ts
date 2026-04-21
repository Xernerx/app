/** @format */

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import check from '@/lib/functions/check';
import database from '@/lib/database';
import { getServerSession } from 'next-auth';
import getToken from '@/lib/functions/getToken';
import validate from '@/lib/functions/validate';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

/* ========================= SCHEMA ========================= */

const shardSchema = z.object({
	shardId: z.number(),
	onlineSince: z.number(),
	guildCount: z.number(),
	userCount: z.number(),
});

const statsSchema = z.object({
	timestamp: z.number().optional(),
	onlineSince: z.number(),
	guildCount: z.number(),
	userCount: z.number(),
	shardCount: z.number(),
	voteCount: z.number(),
	shards: z.array(shardSchema).optional(),
});

/* ========================= HELPERS ========================= */

async function getAuth(req: NextRequest) {
	const token = await getToken(req);
	const session: any = await getServerSession(authOptions);
	return { token, session };
}

async function guardRead(req: NextRequest) {
	const { token, session } = await getAuth(req);

	// only validate token if present
	if (token) {
		const c = await check({ token });
		if (c) return c;
	}

	// no auth required for reading
	return { token, session };
}

async function guardWrite(req: NextRequest, id: string) {
	const { token, session } = await getAuth(req);

	if (session) return { token, session };

	const c = await check({ token, write: true, botId: id });
	if (c) return c;

	return { token, session: null };
}

async function ensureBotExists(profilesDb: any, id: string) {
	const bot = await profilesDb.bot.findOne({ id }).lean();

	if (!bot) {
		return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
	}

	return null;
}

/* ========================= GET ========================= */

export async function GET(req: NextRequest, { params }: Params) {
	const guard = await guardRead(req);
	if (guard instanceof NextResponse) return guard;

	const id = (await params).id;

	const profilesDb = await database('xernerx', 'profiles');
	const statsDb = await database('xernerx', 'stats');

	const botCheck = await ensureBotExists(profilesDb, id);
	if (botCheck) return botCheck;

	const stats = await statsDb.bot.find({ id }).sort({ timestamp: -1 }).limit(100).lean();

	return NextResponse.json(stats, { status: 200 });
}

/* ========================= POST ========================= */

export async function POST(req: NextRequest, { params }: Params) {
	const id = (await params).id;

	const { token, session } = await getAuth(req);

	const profilesDb = await database('xernerx', 'profiles');
	const statsDb = await database('xernerx', 'stats');
	const tokenDb = await database('xernerx', 'tokens');

	// ================= TOKEN / SESSION HANDLING =================

	let t: any = null;

	if (!session) {
		// no session → must use token
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		t = await tokenDb.api.findOne({ id: token });

		if (!t) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
		}

		// ❌ token linked to another bot → block
		if (t.botId && t.botId !== id) {
			return NextResponse.json({ error: 'Token already linked to another bot' }, { status: 403 });
		}

		// run normal validation (no write restriction)
		const c = await check({ token });
		if (c) return c;
	} else {
		// session path → normal write rules
		const c = await check({ token, write: true, botId: id });
		if (c) return c;
	}

	// ================= VALIDATION =================

	const result = await validate(req, statsSchema);
	if ('response' in result) return result.response;

	// ================= BOT CREATION =================

	let bot = await profilesDb.bot.findOne({ id });

	if (!bot) {
		await profilesDb.bot.create({
			id,
			owners: t?.owners ?? [], // 👈 THIS LINE
			verified: false,
			privacy: 'private',
		});
	}

	// ================= TOKEN LINKING =================

	if (t && !t.botId) {
		await tokenDb.api.updateOne(
			{ id: token },
			{
				$set: {
					botId: id,
					status: 'active',
				},
			}
		);
	}

	// ================= CREATE STATS =================

	const created = await statsDb.bot.create({
		id,
		...result.data,
		timestamp: result.data.timestamp ?? Date.now(),
	});

	return NextResponse.json(created, { status: 201 });
}

/* ========================= PATCH ========================= */

export async function PATCH(req: NextRequest, { params }: Params) {
	const id = (await params).id;

	const guard = await guardWrite(req, id);
	if (guard instanceof NextResponse) return guard;

	const result = await validate(req, statsSchema.partial());
	if ('response' in result) return result.response;

	if (!result.data.timestamp) {
		return NextResponse.json({ error: 'timestamp required for update' }, { status: 400 });
	}

	const profilesDb = await database('xernerx', 'profiles');
	const statsDb = await database('xernerx', 'stats');

	const botCheck = await ensureBotExists(profilesDb, id);
	if (botCheck) return botCheck;

	const updated = await statsDb.bot.findOneAndUpdate({ id, timestamp: result.data.timestamp }, { $set: result.data }, { returnDocument: 'after' }).lean();

	if (!updated) {
		return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
	}

	return NextResponse.json(updated, { status: 200 });
}

/* ========================= DELETE ========================= */

export async function DELETE(req: NextRequest, { params }: Params) {
	const id = (await params).id;

	const guard = await guardWrite(req, id);
	if (guard instanceof NextResponse) return guard;

	const result = await validate(
		req,
		z.object({
			timestamp: z.number(),
		})
	);
	if ('response' in result) return result.response;

	const profilesDb = await database('xernerx', 'profiles');
	const statsDb = await database('xernerx', 'stats');

	const botCheck = await ensureBotExists(profilesDb, id);
	if (botCheck) return botCheck;

	const deletion = await statsDb.bot.deleteOne({
		id,
		timestamp: result.data.timestamp,
	});

	if (deletion.deletedCount === 0) {
		return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}

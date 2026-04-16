/** @format */

'use server';

import { NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET() {
	const db = await database('virtue', 'profiles');

	return NextResponse.json(await db.user.find().limit(100));
}

export async function PATCH(req: Request) {
	try {
		const db = await database('virtue', 'profiles');

		const body = await req.json();

		// 🧠 basic validation
		if (!Array.isArray(body)) {
			return NextResponse.json({ error: 'Invalid payload, expected array' }, { status: 400 });
		}

		// prevent abuse / accidental nukes
		if (body.length > 1000) {
			return NextResponse.json({ error: 'Too many updates in one request' }, { status: 400 });
		}

		const operations = body
			.map((user) => {
				if (!user.id) return null;

				return {
					updateOne: {
						filter: { id: user.id },
						update: {
							$set: {
								textExperience: user.textExperience,
								textLevel: user.textLevel,
							},
						},
						upsert: true,
					},
				};
			})
			.filter((op): op is NonNullable<typeof op> => op !== null);

		if (operations.length === 0) {
			return NextResponse.json({ error: 'No valid operations' }, { status: 400 });
		}

		const result = await db.user.bulkWrite(operations);

		return NextResponse.json({
			success: true,
			modified: result.modifiedCount,
			upserted: result.upsertedCount,
		});
	} catch (error) {
		console.error('PATCH /virtue/users failed:', error);

		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

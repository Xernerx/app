/** @format */

import { NextResponse } from 'next/server';
import { authOptions } from '../schema/auth';
import database from '../database';
import { getServerSession } from 'next-auth';

type CheckOptions = {
	token?: string;
	write?: boolean;
	botId?: string;
	sessionOnly?: boolean;
};

export default async function check({ token, write, botId, sessionOnly }: CheckOptions = {}) {
	if (!token) return null;

	const session = await getServerSession(authOptions);
	const db = await database('xernerx', 'tokens');

	// 🚫 session-only endpoints
	if (sessionOnly) {
		if (!session) {
			return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
		}

		// explicitly block tokens
		if (token) {
			return NextResponse.json({ message: 'Forbidden: tokens are not allowed for this endpoint.' }, { status: 403 });
		}

		return null;
	}

	// --- existing logic below ---

	const t = token ? await db.api.findOne({ id: token }) : null;

	if (session) return null;

	if (!token) {
		return NextResponse.json({ message: 'Unauthorized request' }, { status: 401 });
	}

	if (!t?.id) {
		return NextResponse.json({ message: 'Forbidden request' }, { status: 403 });
	}

	if (t.status === 'suspended') {
		return NextResponse.json({ message: 'Token is suspended' }, { status: 403 });
	}

	// rate limit would be here...

	if (write) {
		if (!botId || t.botId !== botId) {
			return NextResponse.json({ message: 'Forbidden: token does not match resource' }, { status: 403 });
		}
	}

	return null;
}

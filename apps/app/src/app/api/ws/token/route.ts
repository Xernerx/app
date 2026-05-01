/** @format */

import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { authOptions } from '@/lib/schema/auth';
import { getServerSession } from 'next-auth';

const secret = new TextEncoder().encode(process.env.WS_TOKEN!);

export async function GET() {
	const session = await getServerSession(authOptions);

	try {
		const token = await new SignJWT({ userId: (session?.user as any)?.id }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('60s').sign(secret);

		return NextResponse.json({ token });
	} catch (err) {
		console.error('WS token error:', err);
		return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
	}
}

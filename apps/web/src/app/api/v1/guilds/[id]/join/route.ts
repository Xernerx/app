/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/schema/auth';
import { getServerSession } from 'next-auth';

export async function PUT(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;
	const session = await getServerSession(authOptions);

	if (!id) return NextResponse.json({ message: 'Missing user id.' }, { status: 400 });

	const botToken = process.env.DISCORD_CLIENT_TOKEN;

	if (!botToken) return NextResponse.json({ message: 'Bot token not configured.' }, { status: 500 });

	const response = await fetch(`https://discord.com/api/v10/guilds/${id}/members/${(session?.user as any)?.id}`, {
		method: 'PUT',
		headers: {
			'Authorization': `Bot ${botToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ access_token: (session as any).accessToken }),
	});

	return NextResponse.json(response.ok ? { message: response.status == 204 ? 'Already part of this server!' : 'Added you to the server!' } : await response.json(), {
		status: response.status == 204 ? 200 : response.status,
		statusText: response.statusText,
	});
}

/** @format */

'use server';

import { XernerxWebsocket } from '@xernerx/websocket';

const client = new XernerxWebsocket({
	token: process.env.WS_TOKEN!,
});

await client.connect();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const data = await client.get('virtue', 'guilds', {
		id: (await params).id,
	});

	return Response.json(data ?? null);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const body = await req.json();

	const data = await client.update('virtue', 'guilds', {
		id: (await params).id,
		...body,
	});

	return Response.json(data ?? null);
}

/** @format */

'use server';

import { XernerxWebsocket } from '@xernerx/websocket';

const client = new XernerxWebsocket({
	token: process.env.WS_TOKEN!,
});

let connecting: Promise<void> | null = null;

async function ensureConnected() {
	if ((client as any).ready) return;

	if (!connecting) {
		connecting = client.connect().finally(() => {
			connecting = null;
		});
	}

	await connecting;
}

export async function GET(req: Request, { params }: any) {
	await ensureConnected();

	const data = await client.get('virtue', 'guilds', {
		id: params.id,
	});

	return Response.json(data ?? null);
}

export async function PATCH(req: Request, { params }: any) {
	await ensureConnected();

	const body = await req.json();

	const data = await client.update('virtue', 'guilds', {
		id: params.id,
		...body,
	});

	return Response.json(data ?? null);
}

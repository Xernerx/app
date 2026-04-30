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

export async function GET(req: Request, ctx: any) {
	try {
		console.log('START');

		const params = await ctx.params;
		console.log('PARAMS', params);

		await client.connect();
		console.log('CONNECTED');

		const data = await client.get('virtue', 'guilds', {
			id: params.id,
		});

		console.log('DATA', data);

		return Response.json(data ?? null);
	} catch (err) {
		console.error('FULL ERROR:', err);
		return Response.json({ error: 'fail' }, { status: 500 });
	}
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	await ensureConnected();

	const body = await req.json();

	const data = await client.update('virtue', 'guilds', {
		id: (await params).id,
		...body,
	});

	return Response.json(data ?? null);
}

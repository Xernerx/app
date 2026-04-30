/** @format */

import { WebSocketServer, type WebSocket } from 'ws';
import { config } from 'dotenv';
import database from './lib/database.js';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs/promises';
import path from 'path';

config({ quiet: true });
database();

/* ================= TYPES ================= */

type AuthedWebSocket = WebSocket & {
	authed: boolean;
};

type ServiceFn = (
	msg: {
		method: string;
		action?: string;
		body: any;
	},
	ws: AuthedWebSocket
) => Promise<any>;

/* ================= PATH ================= */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, './app');

/* ================= REGISTRY ================= */

const services: Record<string, ServiceFn> = {};

const methods = {
	GET: 'get',
	POST: 'create',
	PATCH: 'update',
	DELETE: 'delete',
} as const;

/* ================= LOAD SERVICES ================= */

async function loadServices() {
	const folders = await fs.readdir(appDir);

	for (const folder of folders) {
		const servicePath = path.join(appDir, folder, 'server.js');

		try {
			const mod = await import(pathToFileURL(servicePath).href);
			services[folder] = mod.default;
			console.log(`Loaded service: ${folder}`);
		} catch (e) {
			console.warn(`Skipped ${folder} (no server.js) ${(e as Error).message}`);
		}
	}
}

/* ================= ROUTER ================= */

async function handleMessage(ws: AuthedWebSocket, msg: any) {
	const service = services[msg.service];
	const method = methods[msg.method as keyof typeof methods];

	if (!service) {
		return ws.send(JSON.stringify({ message: 'Unknown service' }));
	}

	if (!method) {
		return ws.send(JSON.stringify({ message: 'Unknown method' }));
	}

	if (!msg.body || typeof msg.body !== 'object') {
		return ws.send(JSON.stringify({ message: 'Invalid body' }));
	}

	try {
		const data = await service(
			{
				method,
				action: msg.action,
				body: msg.body,
			},
			ws
		);

		ws.send(JSON.stringify(data ?? {}));
	} catch (err: any) {
		ws.send(JSON.stringify({ message: err?.message || 'Server error' }));
	}
}

/* ================= WS SERVER ================= */

async function start() {
	await loadServices();

	const wss = new WebSocketServer({ port: 3001 });

	console.log('WS running on ws://localhost:3001');

	wss.on('connection', (ws: AuthedWebSocket) => {
		ws.authed = false;

		console.log('Client connected');

		ws.on('message', async (data) => {
			try {
				const msg = JSON.parse(data.toString());

				if (!msg.service) {
					return ws.send(JSON.stringify({ message: 'Invalid message format' }));
				}

				// allow auth service always
				if (msg.service === 'auth') {
					return handleMessage(ws, msg);
				}

				// block everything else until authenticated
				if (!ws.authed) {
					return ws.send(JSON.stringify({ message: 'unauthorized' }));
				}

				await handleMessage(ws, msg);
			} catch {
				ws.send(JSON.stringify({ message: 'Invalid JSON' }));
			}
		});

		ws.on('close', () => {
			console.log('Client disconnected');
		});
	});
}

start();

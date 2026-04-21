/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import os from 'os';
import { version } from '@/../package.json' with { type: 'json' };

const startTime = Date.now();

/* ------------------------------------------------ */
/* Event loop lag measurement                       */
/* ------------------------------------------------ */

async function getEventLoopLag() {
	const start = performance.now();
	await new Promise((resolve) => setTimeout(resolve, 0));
	return Math.round(performance.now() - start);
}

/* ------------------------------------------------ */
/* Memory usage                                     */
/* ------------------------------------------------ */

function getMemory() {
	const mem = process.memoryUsage();
	const total = os.totalmem();

	return {
		usedMB: Math.round(mem.rss / 1024 / 1024),
		totalMB: Math.round(total / 1024 / 1024),
	};
}

/* ------------------------------------------------ */
/* Mongo status                                     */
/* ------------------------------------------------ */

function getMongo() {
	const state = mongoose.connection.readyState;
	const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const poolSize = (mongoose.connection as any)?.client?.topology?.s?.options?.maxPoolSize ?? 0;

	return {
		mongodb: states[state] ?? 'unknown',
		poolSize,
	};
}

function getLANIP() {
	const nets = os.networkInterfaces();

	for (const iface of Object.values(nets)) {
		for (const net of iface ?? []) {
			if (net.family === 'IPv4' && !net.internal) {
				return net.address;
			}
		}
	}

	return 'localhost';
}

/* ------------------------------------------------ */
/* Route                                            */
/* ------------------------------------------------ */

export async function GET(_: NextRequest) {
	const uptime = Math.floor((Date.now() - startTime) / 1000);
	const eventLoopLag = await getEventLoopLag();
	const mongo = getMongo();

	const isDev = process.env.ENVIRONMENT === 'DEVELOPMENT';

	const env = {
		environment: process.env.ENVIRONMENT,
	};

	const server = {
		status: 'ready',
		uptime,
		memory: getMemory(),
		eventLoopLag,
		time: new Date().toISOString(),
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		version: process.env?.npm_package_version ?? version ?? '0.0.0',
	};

	const database = {
		...mongo,
		status: mongo.mongodb === 'connected' ? 'ready' : 'degraded',
	};

	// 👇 only expose sensitive/internal stuff in dev
	const devExtras = isDev
		? {
				urls: {
					https: `https://dev.dummi.me`,
					http: `http://${getLANIP()}`,
					host: `http://localhost`,
				},
				ports: {
					web: 3000,
					app: 4000,
					mobile: 8081,
				},
			}
		: {};

	const body = {
		...env,
		server,
		database,
		...devExtras,
	};

	return NextResponse.json(body, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	});
}

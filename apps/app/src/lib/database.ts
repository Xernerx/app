/** @format */
'use server';

import mongoose, { Connection } from 'mongoose';

import ProfileBot from '@/schemas/xernerx/profiles/Bot';
import ProfileGuild from '@/schemas/xernerx/profiles/Guild';
import ProfileOrganization from '@/schemas/xernerx/profiles/Organization';
import ProfileUser from '@/schemas/xernerx/profiles/User';
import StatsBot from '@/schemas/xernerx/stats/Bot';
import TokensApi from '@/schemas/xernerx/tokens/Api';
import TokensInvite from '@/schemas/xernerx/tokens/Invite';

type DbType = 'xernerx' | 'metamorphosis' | 'zodiac' | 'virtue';
type XernerxDbName = 'profiles' | 'stats' | 'tokens';

type CacheEntry = {
	conn: Connection | null;
	promise: Promise<Connection> | null;
};

const URIS: Partial<Record<DbType, string>> = {
	xernerx: process.env.MONGO_XERNERX,
	metamorphosis: process.env.MONGO_METAMORPHOSIS,
	zodiac: process.env.MONGO_ZODIAC,
	virtue: process.env.MONGO_VIRTUE,
};

declare global {
	// eslint-disable-next-line no-var
	var __xernerxMongoCache: Record<string, CacheEntry> | undefined;
}

const cached = globalThis.__xernerxMongoCache ?? (globalThis.__xernerxMongoCache = {});

/**
 * Model registration helpers
 */
function registerXernerxModels(connection: Connection, dbName: XernerxDbName) {
	if (dbName == 'profiles') {
		if (!connection.models.bot) connection.model('bot', ProfileBot);
		if (!connection.models.guild) connection.model('guild', ProfileGuild);
		if (!connection.models.organization) connection.model('organization', ProfileOrganization);
		if (!connection.models.user) connection.model('user', ProfileUser);
	}

	if (dbName == 'stats') {
		if (!connection.models.bot) connection.model('bot', StatsBot);
	}

	if (dbName == 'tokens') {
		if (!connection.models.api) connection.model('api', TokensApi);
		if (!connection.models.invite) connection.model('invite', TokensInvite);
	}
}

/**
 * Main database connector
 */
export default async function database(type: DbType, dbName: XernerxDbName): Promise<Connection['models']> {
	const uri = URIS[type];

	if (!uri) {
		throw new Error(`Missing Mongo URI for ${type}.`);
	}

	// Optional sanity check (prevents future-you from doing something stupid)
	if (type === 'virtue' && dbName !== 'profiles') {
		throw new Error(`Virtue only supports 'profiles' db.`);
	}

	const key = `${type}:${dbName}`;

	// Initialize cache slot
	if (!cached[key]) {
		cached[key] = { conn: null, promise: null };
	}

	const entry = cached[key];

	// Fast path
	if (entry.conn) {
		return entry.conn.models;
	}

	// Prevent duplicate concurrent connections
	if (!entry.promise) {
		entry.promise = (async () => {
			const connection = mongoose.createConnection(uri, {
				dbName,
				serverSelectionTimeoutMS: 10000,
				connectTimeoutMS: 10000,
				socketTimeoutMS: 15000,
				maxPoolSize: 10,
				minPoolSize: 1,
				family: 4,
			});

			await connection.asPromise();

			// Register models once
			if (type === 'xernerx') registerXernerxModels(connection, dbName as XernerxDbName);

			return connection;
		})();
	}

	try {
		entry.conn = await entry.promise;
		return entry.conn.models;
	} catch (error) {
		// Reset promise so future calls can retry
		entry.promise = null;
		throw error;
	}
}

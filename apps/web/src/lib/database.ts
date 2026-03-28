/** @format */
'use server';

import mongoose, { Connection } from 'mongoose';

import ProfileBot from '@/schemas/xernerx/profiles/Bot';
import ProfileGuild from '@/schemas/xernerx/profiles/Guild';
import ProfileOrganization from '@/schemas/xernerx/profiles/Organization';
import ProfileUser from '@/schemas/xernerx/profiles/User';
import VirtueGuild from '@/schemas/virtue/profiles/Guild';
import VirtueMember from '@/schemas/virtue/profiles/Member';
import VirtueUser from '@/schemas/virtue/profiles/User';

type DbType = 'xernerx' | 'metamorphosis' | 'zodiac' | 'virtue';
type XernerxDbName = 'profiles' | 'stats' | 'tokens';
type VirtueDbName = 'profiles';

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
	if (dbName !== 'profiles') return;

	if (!connection.models.bot) connection.model('bot', ProfileBot);
	if (!connection.models.guild) connection.model('guild', ProfileGuild);
	if (!connection.models.organization) connection.model('organization', ProfileOrganization);
	if (!connection.models.user) connection.model('user', ProfileUser);
}

function registerVirtueModels(connection: Connection, dbName: VirtueDbName) {
	if (dbName !== 'profiles') return;

	if (!connection.models.guild) connection.model('guild', VirtueGuild);
	if (!connection.models.member) connection.model('member', VirtueMember);
	if (!connection.models.user) connection.model('user', VirtueUser);
}

/**
 * Main database connector
 */
export default async function database(type: DbType, dbName: XernerxDbName | VirtueDbName): Promise<Connection['models']> {
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
			if (type === 'virtue') registerVirtueModels(connection, dbName as VirtueDbName);

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

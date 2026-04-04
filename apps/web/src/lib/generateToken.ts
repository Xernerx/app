/** @format */

import crypto from 'crypto';
import database from './database';

const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomString(length: number) {
	const bytes = crypto.randomBytes(length);
	let result = '';

	for (let i = 0; i < length; i++) {
		result += CHARSET[bytes[i] % CHARSET.length];
	}

	return result;
}

export async function generateToken(): Promise<string> {
	const db = await database('xernerx', 'tokens');

	while (true) {
		const token = randomString(64);

		const exists = await db.api.findOne({ id: token });
		if (!exists) return token;
	}
}

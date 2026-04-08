/** @format */

import { XernerxClient } from '@xernerx/framework';
import { config } from 'dotenv';

config({ quiet: true });

export class Client extends XernerxClient {
	constructor() {
		super({
			intents: ['Guilds', 'GuildMessages'],
			token: process.env.DISCORD_CLIENT_TOKEN as string,
		});

		this.modules.eventHandler.loadEvents({
			directory: 'dist/events',
		});

		this.connect();
	}
}

export const client = new Client();

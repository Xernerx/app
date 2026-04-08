/** @format */

import { EventBuilder } from '@xernerx/framework';
import { ActivityType, PresenceData } from 'discord.js';

export default class ClientReadyEvent extends EventBuilder {
	constructor() {
		super('clientReady', {
			name: 'clientReady',
			emitter: 'client',
			once: false,
		});
	}

	override async run() {
		this.updateGuilds();

		this.updatePresence();
	}

	updateGuilds() {
		this.client.guilds.cache.map(async (guild) => {
			await fetch(`https://dev.dummi.me/api/v1/guilds/${guild.id}/profile`, {
				method: 'PATCH',
				body: JSON.stringify({
					name: guild.name,
					icon: guild.icon,
					locale: guild.preferredLocale,
					bot: true,
				}),
			}).then((res) => res.json());
		});
	}

	private async updatePresence() {
		const status: any = await fetch(`${process.env.URL}/api/v1/status`)
			.then((res) => res.json())
			.catch(() => null);

		const presence: PresenceData = {
			status: 'dnd',
			activities: [],
		};

		if (!status) {
			presence.status = 'dnd';
			presence.activities = [{ name: 'Xernerx API offline', state: 'API is offline, some features may not respond as intended.' }];
		} else status.server.status === 'ready' ? (presence.status = 'online') : (presence.status = 'idle');

		if (presence.status === 'online') presence.activities = [{ name: `Xernerx API online`, state: `API is online, all features are working.` }];
		if (presence.status === 'idle') presence.activities = [{ name: `Xernerx API degraded`, state: `API is degraded, some features may not respond as intended.` }];

		if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
			presence.activities = [
				{
					type: ActivityType.Streaming,
					name: `Xernerx API (Development)`,
					url: `https://www.youtube.com/watch?v=nOv9HorOcJo`,
					state: `API: ${status?.server?.status || 'Fucked'} - Version: ${status?.server?.version || 'Unknown'}`,
				},
			];
			presence.status = 'online';
		}

		this.client.user?.setPresence(presence);

		setTimeout(() => this.updatePresence(), 60000);
	}
}

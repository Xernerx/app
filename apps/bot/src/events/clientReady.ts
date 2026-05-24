/** @format */

import { EventBuilder } from '@xernerx/framework';
import { ActivityType, EmbedBuilder, PresenceData } from 'discord.js';

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

	async updateGuilds() {
		const stats = {
			created: 0,
			updated: 0,
			deleted: 0,
		};

		const guilds = (await fetch(`${process.env.URL}/api/v1/guilds?all=true`)
			.then((res) => res.json())
			.catch(() => null)) as Array<any>;

		for (const guild of guilds) {
			const profile = this.client.guilds.cache.get(guild.id);

			if (!profile) {
				await fetch(`${process.env.URL}/api/v1/guilds/${guild.id}/profile`, {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${process.env.XERNERX_TOKEN}`,
					},
				}).then((res) => res.json());

				stats.deleted++;
			} else {
				await fetch(`${process.env.URL}/api/v1/guilds/${guild.id}/profile`, {
					method: 'PATCH',
					headers: {
						Authorization: `Bearer ${process.env.XERNERX_TOKEN}`,
					},
					body: JSON.stringify({
						name: profile.name,
						icon: profile.icon || '',
						banner: profile.banner || '',
						locale: profile.preferredLocale || '',
						bot: true,
					}),
				})
					.then((res) => res.json())
					.catch(() => null);

				stats.updated++;
			}
		}

		this.client.guilds.cache.map(async (guild) => {
			if (guilds.find((g) => g.id === guild.id)) return;

			await fetch(`${process.env.URL}/api/v1/guilds/${guild.id}/profile`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.XERNERX_TOKEN}`,
				},
				body: JSON.stringify({
					name: guild.name,
					icon: guild.icon || '',
					banner: guild.banner || '',
					locale: guild.preferredLocale || '',
					bot: true,
				}),
			})
				.then((res) => res.json())
				.catch(() => null);

			stats.created++;
		});

		const channel = await this.client.channels.fetch('1497567150750175232');
		const cooldown = new Date().setHours(24, 0, 0, 0) - new Date().getTime();
		const embed = new EmbedBuilder()
			.setTitle('Guild Scrape')
			.setDescription(`Performed a successful guild scrape on ${stats.updated + stats.created + stats.deleted} guilds.`)
			.addFields([
				{
					name: 'New',
					value: `${stats.created}`,
					inline: true,
				},
				{
					name: 'Updated',
					value: `${stats.updated}`,
					inline: true,
				},
				{
					name: 'Deleted',
					value: `${stats.deleted}`,
					inline: true,
				},
			])
			.setFooter({ text: `Running again in ${Math.round(cooldown / 1000 / 60)}m` })
			.setTimestamp(new Date().setHours(24, 0, 0, 0));

		if (channel?.isTextBased()) (channel as any)?.send({ embeds: [embed] });

		setTimeout(this.updateGuilds, cooldown);
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

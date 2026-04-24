/** @format */

export default {
	name: 'Bots API',
	kind: 1,
	children: [
		{
			name: 'bots',
			kind: 2,
			children: [
				{
					name: 'bots',
					kind: 64,
					signatures: [
						{
							name: 'GET',
							route: '/bots',
							parameters: [],
							type: { name: 'Bot[]' },
							comment: {
								summary: [{ text: 'List all bots' }],
							},
						},
						{
							name: 'POST',
							route: '/bots',
							parameters: [
								{ name: 'name', type: { name: 'string' } },
								{ name: 'token', type: { name: 'string' } },
							],
							type: { name: 'Bot' },
							comment: {
								summary: [{ text: 'Create a new bot' }],
							},
						},
					],
				},

				{
					name: 'bots/:id/profile',
					kind: 64,
					signatures: [
						{
							name: 'GET',
							route: '/bots/:id/profile',
							parameters: [{ name: 'id', type: { name: 'string' } }],
							type: { name: 'BotProfile' },
							comment: {
								summary: [{ text: 'Get bot profile' }],
							},
						},
						{
							name: 'PATCH',
							route: '/bots/:id/profile',
							parameters: [
								{ name: 'id', type: { name: 'string' } },
								{ name: 'data', type: { name: 'Partial<BotProfile>' } },
							],
							type: { name: 'BotProfile' },
							comment: {
								summary: [{ text: 'Update bot profile' }],
							},
						},
					],
				},

				{
					name: 'bots/:id/stats',
					kind: 64,
					signatures: [
						{
							name: 'GET',
							route: '/bots/:id/stats',
							parameters: [{ name: 'id', type: { name: 'string' } }],
							type: { name: 'BotStats' },
							comment: {
								summary: [{ text: 'Get bot statistics' }],
							},
						},
						{
							name: 'POST',
							route: '/bots/:id/stats',
							parameters: [
								{ name: 'id', type: { name: 'string' } },
								{ name: 'stats', type: { name: 'BotStatsInput' } },
							],
							type: { name: 'BotStats' },
							comment: {
								summary: [{ text: 'Update bot statistics' }],
							},
						},
					],
				},
			],
		},
	],
};

/** @format */

export type Shortcut = {
	keys: string[];
	description: string;
	category: string;
};

export const SHORTCUTS: Shortcut[] = [
	{
		keys: ['Ctrl', '`'],
		description: 'Toggle sidebar',
		category: 'Interface',
	},
	{
		keys: ['Ctrl', 'I'],
		description: 'Open account settings',
		category: 'Navigation',
	},
	{
		keys: ['Ctrl', '.'],
		description: 'Toggle URL bar',
		category: 'Interface',
	},
	{
		keys: ['Ctrl', '/'],
		description: 'Toggle shortcuts panel',
		category: 'Interface',
	},
	{
		keys: ['Ctrl', 'D'],
		description: 'Open Dashboard',
		category: 'Navigation',
	},
	{
		keys: ['Ctrl', 'E'],
		description: 'Open Explorer',
		category: 'Navigation',
	},
	{
		keys: ['Ctrl', 'P'],
		description: 'Open Portal',
		category: 'Navigation',
	},
	{
		keys: ['Ctrl', 'R'],
		description: 'Reload App',
		category: 'Utility',
	},
];

/** @format */

import { Schema } from 'mongoose';

const schema = new Schema(
	{
		guild: { type: String }, // Discord guild ID
		name: { type: String, required: true }, // Guild name
		icon: { type: String }, // Guild icon URL (optional)
		owner: { type: String, required: true }, // Discord user ID of the guild owner
		description: { type: String }, // Short description of the guild
		info: { type: String }, // Long description about the guild
		verified: { type: Boolean, default: false }, // Whether the guild has been verified
		privacy: { type: String, enum: ['public', 'private', 'limited'], default: 'private' }, // Privacy level of the guild
		locale: { type: String }, // Guild locale (e.g., en-US, es-ES, fr-FR)
		links: {
			invite: { type: String }, // Discord guild invite link
			support: { type: String }, // Discord support server link (optional)
			website: { type: String }, // Guild website URL (optional)
			privacy: { type: String }, // Guild privacy policy URL (optional)
			terms: { type: String }, // Guild terms of service URL (optional)
			github: { type: String }, // GitHub repository link
		},
		hooks: { type: [{ name: String, description: String, url: String, data: String }] }, // List of guild webhooks
	},
	{ timestamps: true }
);

export default schema;

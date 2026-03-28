/** @format */

import { Schema } from 'mongoose';

const schema = new Schema(
	{
		id: { type: String, unique: true, required: true }, // Guild ID
		mode: { type: String, required: true, default: 'balanced', enum: ['easy', 'casual', 'balanced', 'hard', 'extreme'] }, // Guild mode for levels
		cycles: {
			monthly: { type: Boolean, default: false },
			weekly: { type: Boolean, default: false },
			daily: { type: Boolean, default: false },
		},
		roles: {
			ignored: [String],
			tracked: [String],
		},
	},
	{ timestamps: true }
);

export default schema;

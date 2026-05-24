/** @format */

import { Schema } from 'mongoose';

const schema = new Schema(
	{
		id: { type: String, required: true },
		timestamp: { type: Number, required: true },
		userCount: { type: Number, required: true },
		messageCount: { type: Number, required: true },
		voteCount: { type: Number, required: true },
	},
	{ timestamps: true }
);

export default schema;

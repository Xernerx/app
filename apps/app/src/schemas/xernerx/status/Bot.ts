/** @format */

import { Schema } from 'mongoose';

const schema = new Schema(
	{
		id: { type: String, unique: true, required: true },
		status: { type: String },
		timestamp: { type: Number },
	},
	{ timestamps: true }
);

export default schema;

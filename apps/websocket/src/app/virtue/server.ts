/** @format */

import mongoose from 'mongoose';

const models = {
	guilds: () => mongoose.models.guilds,
	users: () => mongoose.models.users,
	members: () => mongoose.models.members,
};

const methods = {
	get: (model: any, body: any) => model.findOne(body),
	create: (model: any, body: any) => model.create(body),
	update: (model: any, body: any) => model.findOneAndUpdate({ id: body.id }, body, { after: true }),
	delete: (model: any, body: any) => model.findOneAndDelete(body),
};

export default async function Server(msg: any) {
	const getModel = models[msg.action as keyof typeof models];

	if (!getModel) throw new Error('Unknown action');

	const method = methods[msg.method as keyof typeof methods];
	if (!method) throw new Error('Unknown method');

	const model = getModel();

	return method(model, msg.body);
}

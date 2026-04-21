/** @format */

import { NextRequest, NextResponse } from 'next/server';

import { ZodSchema } from 'zod';

type ValidateOptions = {
	source?: 'body' | 'query';
	extra?: Record<string, unknown>;
};

export default async function validate<T>(req: NextRequest, schema: ZodSchema<T>, options: ValidateOptions = {}): Promise<{ data: T } | { response: NextResponse }> {
	let input: unknown;

	try {
		if (options.source === 'query') {
			const url = new URL(req.url);
			input = Object.fromEntries(url.searchParams);
		} else {
			input = await req.json();
		}
	} catch {
		return {
			response: NextResponse.json({ error: 'Invalid request input' }, { status: 400 }),
		};
	}

	const parsed = schema.safeParse({
		...((input as object) ?? {}),
		...(options.extra ?? {}),
	});

	if (!parsed.success) {
		return {
			response: NextResponse.json(
				{
					error: 'Invalid request data',
					fields: parsed.error.flatten(),
				},
				{ status: 400 }
			),
		};
	}

	return { data: parsed.data };
}

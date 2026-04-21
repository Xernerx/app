/** @format */
'use server';

export default async function getToken(req: Request) {
	const auth = req.headers.get('authorization');

	if (auth?.startsWith('Bearer ')) {
		return auth.slice(7);
	}

	const url = new URL(req.url);
	return url.searchParams.get('token') ?? undefined;
}

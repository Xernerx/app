/** @format */

import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const res = await fetch('https://api.github.com/repos/Xernerx/docs/contents/packages', { next: { revalidate: 300 } });

		const data = await res.json();

		if (!Array.isArray(data)) {
			return NextResponse.json({ error: 'Invalid GitHub response' }, { status: 500 });
		}

		const types: { scope: string; type: string }[] = [];

		for (const item of data) {
			if (item.type !== 'dir') continue;

			// only allow @xernerx
			if (item.name === '@xernerx') {
				const scopeRes = await fetch(item.url, {
					next: { revalidate: 300 },
				});
				const scopeData = await scopeRes.json();

				if (!Array.isArray(scopeData)) continue;

				for (const pkg of scopeData) {
					if (pkg.type === 'dir') {
						types.push({
							scope: '@xernerx',
							type: pkg.name,
						});
					}
				}
			}
		}

		// local API
		types.unshift({ scope: '@xernerx', type: 'api' });

		return NextResponse.json({ types });
	} catch (err) {
		console.error(err);

		return NextResponse.json({ error: 'Failed to fetch doc types' }, { status: 500 });
	}
}

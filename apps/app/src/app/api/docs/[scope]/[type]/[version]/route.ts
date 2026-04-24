/** @format */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	_: NextRequest,
	{
		params,
	}: {
		params: Promise<{
			scope: string;
			type: string;
			version: string;
		}>;
	}
) {
	const { scope, type, version } = await params;

	try {
		/* ================= LOCAL ================= */

		if (scope === '@xernerx' && type === 'api') {
			try {
				const mod = await import(`@/lib/docs/api/${version}`);

				return NextResponse.json({
					scope,
					type,
					version,
					data: mod.default ?? mod,
				});
			} catch {
				return NextResponse.json({ error: 'Version not found' }, { status: 404 });
			}
		}

		/* ================= GITHUB ================= */

		const url = `https://raw.githubusercontent.com/Xernerx/docs/main/packages/${scope}/${type}/${version}/docs.json`;

		const res = await fetch(url, {
			next: { revalidate: 300 },
		});

		if (!res.ok) {
			return NextResponse.json({ error: 'Docs not found' }, { status: 404 });
		}

		const json = await res.json();

		return NextResponse.json({
			scope,
			type,
			version,
			data: json,
		});
	} catch (err) {
		console.error(err);

		return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 });
	}
}

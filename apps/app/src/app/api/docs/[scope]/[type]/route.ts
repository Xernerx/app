/** @format */

import { NextRequest, NextResponse } from 'next/server';

import fs from 'fs';
import path from 'path';
import semver from 'semver';

export async function GET(
	_: NextRequest,
	{
		params,
	}: {
		params: Promise<{ scope: string; type: string }>;
	}
) {
	const { scope, type } = await params;

	try {
		/* ================= LOCAL ================= */

		if (scope === '@xernerx' && type === 'api') {
			const dir = path.join(process.cwd(), 'src', 'lib', 'docs', 'api');

			const files = fs.readdirSync(dir);

			const versions = files
				.filter((f) => f.startsWith('v') && f.endsWith('.ts'))
				.map((f) => f.replace('.ts', ''))
				.sort((a, b) => Number(b.slice(1)) - Number(a.slice(1)));

			return NextResponse.json({
				scope,
				type,
				versions,
				latest: versions[0] ?? null,
			});
		}

		/* ================= GITHUB ================= */

		const res = await fetch(`https://api.github.com/repos/Xernerx/docs/contents/packages/${scope}/${type}`, { next: { revalidate: 300 } });

		if (!res.ok) {
			return NextResponse.json({ error: 'Type not found' }, { status: 404 });
		}

		const data = await res.json();

		if (!Array.isArray(data)) {
			return NextResponse.json({ error: 'Invalid GitHub response' }, { status: 500 });
		}

		const versions = data
			.filter((item: any) => item.type === 'dir')
			.map((item: any) => item.name)
			.sort((a, b) => {
				const av = semver.coerce(a);
				const bv = semver.coerce(b);
				if (!av || !bv) return 0;
				return semver.rcompare(av, bv);
			});

		return NextResponse.json({
			scope,
			type,
			versions,
			latest: versions[0] ?? null,
		});
	} catch (err) {
		console.error(err);

		return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
	}
}

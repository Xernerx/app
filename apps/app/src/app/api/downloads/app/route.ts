/** @format */

import { NextResponse } from 'next/server';

export async function GET() {
	const res = await fetch('https://api.github.com/repos/Xernerx/app/releases/latest');

	if (!res.ok) return NextResponse.json({ error: res.statusText }, { status: res.status, statusText: res.statusText });

	const data = await res.json();

	const items = data.assets.filter((asset) => asset.name.includes('setup'));

	return NextResponse.json(
		{
			windows: items.find((asset) => asset.name.endsWith('.exe')),
			macos: items.find((asset) => asset.name.endsWith('.dmg')),
			linux: items.find((asset) => asset.name.endsWith('.AppImage')),
		},
		{ status: 200 }
	);
}

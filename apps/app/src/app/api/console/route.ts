/** @format */

'use server';

import { NextRequest, NextResponse } from 'next/server';

import check from '@/lib/functions/check';
import { getLogs } from '@/lib/console';
import getToken from '@/lib/functions/getToken';

export async function GET(request: NextRequest) {
	const token = await getToken(request);

	const c = await check({ token, sessionOnly: true });
	if (c) return c;

	return NextResponse.json({ logs: getLogs() }, { status: 200 });
}

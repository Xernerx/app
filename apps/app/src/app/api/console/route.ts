/** @format */

// app/api/console/route.ts

import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/console';

export async function GET() {
	return NextResponse.json({ logs: getLogs() });
}

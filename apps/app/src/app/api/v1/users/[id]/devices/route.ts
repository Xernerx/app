/** @format */
'use server';

export async function GET() {}

// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/database'; // Your database or ORM client
// import { getSessionUser } from '@/lib/schema/auth'; // Your authentication validation helper

// // GET /api/v1/users/[id]/devices
// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
// 	try {
// 		// 1. Authenticate the requester
// 		const currentUser = await getSessionUser(request);
// 		if (!currentUser) {
// 			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// 		}

// 		// 2. Prevent users from snooping on other users' devices
// 		if (currentUser.id !== params.id) {
// 			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
// 		}

// 		// 3. Fetch active sessions from your database
// 		const databaseSessions = await db.session.findMany({
// 			where: { userId: params.id },
// 			orderBy: { lastActive: 'desc' },
// 		});

// 		// 4. Extract current token/session ID from cookies to find the active match
// 		const currentSessionToken = request.cookies.get('session_token')?.value;

// 		// 5. Format payload for your frontend interface
// 		const devices = databaseSessions.map((session) => ({
// 			id: session.id,
// 			device: session.userAgentString || 'Unknown Device',
// 			location: session.ipLocation || 'Unknown Location',
// 			ipAddress: session.ipAddress || '0.0.0.0',
// 			isCurrent: session.token === currentSessionToken, // Flags the active client
// 			lastActive: session.lastActive.toISOString(),
// 		}));

// 		return NextResponse.json(devices, { status: 200 });
// 	} catch (error) {
// 		console.error('Failed to fetch devices:', error);
// 		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// 	}
// }

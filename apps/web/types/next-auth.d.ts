/** @format */

import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	interface Session extends DefaultSession {
		[index: string]: any;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		[index: string]: any;
	}
}

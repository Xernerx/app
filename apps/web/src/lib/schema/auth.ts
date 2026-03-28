/** @format */

import DiscordProvider from 'next-auth/providers/discord';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: '/auth/login',
		error: '/auth/login',
	},
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!,
			authorization: {
				params: {
					scope: 'identify guilds',
				},
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async signIn({ user }) {
			return true;
		},

		async jwt({ token, user, account }) {
			if (account) {
				token.accessToken = account.access_token;
			}
			if (user) {
				// user
			}

			return token;
		},

		async session({ session, token }) {
			const discord = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${token.accessToken}` } }).then((res) => res.json());
			const profile = await fetch(`${process.env.NEXTAUTH_URL}/api/v1/users/${token.sub}/profile`).then((res) => res.json());

			const user = {
				...discord,
				...profile,
				accessToken: token.accessToken,
			};

			return user;
		},
	},
};

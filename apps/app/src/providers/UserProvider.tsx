/** @format */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useToast } from './ToastProvider';

type User = any;

const UserContext = createContext<User>({});

export function UserProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status }: any = useSession();
	const { toast } = useToast();

	const [user, setUser] = useState<User | null>(null);
	const [guilds, setGuilds] = useState([]);

	useEffect(() => {
		toast('Fetching user info', 'info');
	}, []);

	useEffect(() => {
		if (status !== 'authenticated' || !session) return;

		(async () => {
			const discord = await fetch('/api/v1/discord/users/me/profile')
				.then((res) => res.json())
				.catch(() => {});

			const profile = await fetch(`/api/v1/users/${session.user.id}/profile`)
				.then((res) => res.json())
				.catch(() => {});

			const { guilds } = await fetch(`/api/v1/discord/guilds`)
				.then((res) => res.json())
				.catch(() => ({ guilds: [] }));

			const u = {
				...session,
				...discord,
				...profile,
			};

			setUser(u);

			setGuilds(guilds);
		})();
	}, [status, session]);

	return <UserContext.Provider value={{ user, guilds }}>{children}</UserContext.Provider>;
}

export function useUser() {
	return useContext(UserContext);
}

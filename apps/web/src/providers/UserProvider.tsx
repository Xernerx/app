/** @format */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

type User = any;

const UserContext = createContext<User>({});

export function UserProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status }: any = useSession();

	const [user, setUser] = useState<User>();

	useEffect(() => {
		(async () => {
			if (session) {
				const discord = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${session.accessToken}` } }).then((res) => res.json());
				const profile = await fetch(`/api/v1/users/${session.user.id}/profile`).then((res) => res.json());

				setUser({
					...session,
					...discord,
					...profile,
				});
			}
		})();
	}, [session, status]);

	return <UserContext.Provider value={user!}>{children}</UserContext.Provider>;
}

export function useUser() {
	return useContext(UserContext);
}

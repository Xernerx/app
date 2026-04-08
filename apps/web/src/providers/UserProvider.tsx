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

	const [user, setUser] = useState<User>();

	useEffect(() => {
		if (session) toast('Fetching user info', 'info');
	}, [session]);

	useEffect(() => {
		if (status !== 'authenticated' || !session) return;

		(async () => {
			const discord = await fetch('https://discord.com/api/users/@me', {
				headers: { Authorization: `Bearer ${session.accessToken}` },
			}).then((res) => res.json());

			const profile = await fetch(`/api/v1/users/${session.user.id}/profile`).then((res) => res.json());

			const u = {
				...session,
				...discord,
				...profile,
			};

			setUser(u);
		})();
	}, [status, session]);

	return <UserContext.Provider value={user!}>{children}</UserContext.Provider>;
}

export function useUser() {
	return useContext(UserContext);
}

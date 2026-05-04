/** @format */

'use client';

import { Roles } from '@/lib/roles';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/providers/UserProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
	const { user } = useUser();

	useEffect(() => {
		if (![Roles.Admin, Roles.Owner, Roles.Moderator].includes(user?.role)) return redirect('/');
	}, [user]);

	if (!user) return null;

	return <>{children}</>;
}

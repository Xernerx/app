/** @format */

'use server';

import { Roles } from '@/lib/roles';
import { authOptions } from '@/lib/schema/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: { children: React.ReactNode }) {
	const session = await getServerSession(authOptions);

	if (session?.role !== Roles.Owner && session?.role !== Roles.Admin) return redirect('/');

	return <>{children}</>;
}

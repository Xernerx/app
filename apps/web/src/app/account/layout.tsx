/** @format */

import { authOptions } from '@/lib/schema/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: { children: React.Component }) {
	const session = await getServerSession(authOptions);

	if (!session) return redirect('/');

	return <>{children}</>;
}

/** @format */

'use client';

import { redirect } from 'next/navigation';

export default function Page() {
	return redirect('https://discord.com/oauth2/authorize?client_id=1319029435655000234&permissions=0&integration_type=0&scope=bot+applications.commands');
}

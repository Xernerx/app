/** @format */

'use client';

import { redirect } from 'next/navigation';

export default function Page() {
	return redirect('https://discord.com/oauth2/authorize?client_id=1484880634844287138&permissions=4503874774883392&integration_type=0&scope=bot+applications.commands');
}

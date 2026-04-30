/** @format */

'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
	return (
		<html>
			<body style={{ padding: 40 }}>
				<h1>Something broke</h1>
				<p>{error.message}</p>

				<button onClick={() => reset()}>Try again</button>
			</body>
		</html>
	);
}

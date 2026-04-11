/** @format */

// lib/console.ts
let logs: Array<{ time: Date; log: string; type: 'info' | 'warning' | 'error' }> = [];

export function getLogs() {
	return logs;
}

function pushLog(msg: string, type: 'info' | 'warning' | 'error' = 'info') {
	const clean = msg.toString();

	// ignore noise
	if (clean.includes('/api/console')) return;

	const time = new Date(); // simple + readable

	logs.push({ time, log: clean.trim(), type });

	if (logs.length > 500) logs.shift();
}

// patch stdout
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk: any, ...args: any[]) => {
	pushLog(chunk.toString(), 'info');
	return originalStdoutWrite(chunk, ...args);
};

// patch stderr
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk: any, ...args: any[]) => {
	pushLog(chunk.toString(), 'error');
	return originalStderrWrite(chunk, ...args);
};

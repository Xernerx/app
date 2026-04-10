/** @format */

export default function uptime(timestamp?: number | null) {
	if (!timestamp) timestamp = new Date().getTime() || 0;
	let totalSeconds = timestamp;
	let years = Math.floor(totalSeconds / 31536000);
	totalSeconds %= 31536000;
	let days = Math.floor(totalSeconds / 86400);
	totalSeconds %= 86400;
	let hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = Math.floor(totalSeconds % 60);

	if (years >= 1) return `${years}y ${days}d ${hours}h ${minutes}m`;
	else if (days >= 1) return `${days}d ${hours}h ${minutes}m`;
	else if (hours >= 1) return `${hours}h ${minutes}m`;
	else if (minutes >= 1) return `${minutes}m ${seconds}s`;
	else return `${seconds}s`;
}

/** @format */

export {};

declare global {
	interface Window {
		electron?: {
			minimize: () => void;
			maximize: () => void;
			close: () => void;
			isMaximized: () => Promise<boolean>;
		};
	}
}

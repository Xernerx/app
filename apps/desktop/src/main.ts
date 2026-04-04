/** @format */

import { BrowserWindow, app, ipcMain, screen } from 'electron';

import Store from 'electron-store';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconPath = path.join(__dirname, '../public/icon.ico');
const WEB_URL = app.isPackaged ? 'https://canary.xernerx.com' : 'https://dev.dummi.me';

let win: BrowserWindow;

/* --------------------------------------------- */
/* Metadata                                      */
/* --------------------------------------------- */

type Metadata = {
	debug?: boolean;
	hardwareAcceleration?: boolean;
	startMinimized?: boolean;
	startMaximized?: boolean;
	startOnBoot?: boolean;
};

function getMetadata(): Metadata {
	try {
		const file = app.isPackaged ? path.join(process.resourcesPath, 'metadata.json') : path.join(process.cwd(), 'metadata.json');

		if (fs.existsSync(file)) {
			return JSON.parse(fs.readFileSync(file, 'utf-8'));
		}
	} catch {}

	return {};
}

const meta = getMetadata();

const DEBUG = meta.debug === true;

/* --------------------------------------------- */
/* System config                                 */
/* --------------------------------------------- */

if (meta.hardwareAcceleration === false) {
	app.disableHardwareAcceleration();
}

if (meta.startOnBoot) {
	app.setLoginItemSettings({
		openAtLogin: true,
	});
}

/* --------------------------------------------- */
/* Logging (only in debug)                       */
/* --------------------------------------------- */

function log(message: string) {
	if (!DEBUG) return;

	try {
		const file = path.join(app.getPath('desktop'), 'xernerx-debug.log');
		fs.appendFileSync(file, `[${new Date().toISOString()}] ${message}\n`);
	} catch {}
}

/* --------------------------------------------- */
/* Messaging                                     */
/* --------------------------------------------- */

function sendError(message: string) {
	log(`ERROR: ${message}`);

	if (DEBUG && win && !win.isDestroyed()) {
		win.webContents.executeJavaScript(`
			document.body.innerHTML = "<pre style='color:red;padding:20px;'>${message}</pre>";
		`);
	}
}

function sendStatus(message: string) {
	log(`STATUS: ${message}`);

	if (win && !win.isDestroyed()) {
		win.webContents.send('startup:status', message);
	}
}

/* --------------------------------------------- */
/* Bounds                                        */
/* --------------------------------------------- */

function getSafeBounds(bounds?: Electron.Rectangle): Electron.Rectangle {
	const { workArea } = screen.getPrimaryDisplay();

	if (!bounds) {
		return {
			x: workArea.x + 100,
			y: workArea.y + 100,
			width: 1200,
			height: 800,
		};
	}

	const off = bounds.x + bounds.width < workArea.x || bounds.y + bounds.height < workArea.y || bounds.x > workArea.x + workArea.width || bounds.y > workArea.y + workArea.height;

	if (off) {
		return {
			x: workArea.x + 100,
			y: workArea.y + 100,
			width: 1200,
			height: 800,
		};
	}

	return bounds;
}

/* --------------------------------------------- */
/* Backend wait                                  */
/* --------------------------------------------- */

async function waitForServer() {
	sendStatus('Connecting...');

	while (true) {
		try {
			const res = await fetch(`${WEB_URL}/api/v1/status`);
			if (res.ok) return sendStatus('Ready');
		} catch (e) {
			sendError((e as Error).message);
			return;
		}

		await new Promise((r) => setTimeout(r, 1000));
	}
}

/* --------------------------------------------- */
/* Window                                        */
/* --------------------------------------------- */

async function createWindow() {
	let bounds = store.get('windowBounds') as Electron.Rectangle | undefined;
	bounds = getSafeBounds(bounds);

	win = new BrowserWindow({
		width: bounds.width,
		height: bounds.height,
		x: bounds.x,
		y: bounds.y,

		frame: false,
		transparent: true,
		resizable: true,
		backgroundColor: '#00000000',
		icon: iconPath,
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false,
		},
	});

	if (meta.startMaximized) win.maximize();
	if (!meta.startMinimized) win.show();

	/* Save bounds */

	const saveBounds = () => {
		if (!win || win.isDestroyed()) return;
		if (win.isMinimized()) return;
		store.set('windowBounds', win.getBounds());
	};

	win.on('resize', saveBounds);
	win.on('move', saveBounds);

	win.webContents.on('render-process-gone', (_, details) => {
		log(`CRASH: ${JSON.stringify(details)}`);

		// Recover instead of dying forever
		setTimeout(async () => {
			await win.loadURL(WEB_URL);
		}, 1000);
	});

	/* Debug-only diagnostics */

	if (DEBUG) {
		win.webContents.on('did-finish-load', () => {
			log(`LOADED: ${win.webContents.getURL()}`);
		});

		win.webContents.on('did-fail-load', (_, c, d) => {
			log(`FAIL: ${c} ${d}`);
		});

		win.webContents.on('render-process-gone', (_, d) => {
			log(`CRASH: ${JSON.stringify(d)}`);
		});

		win.webContents.on('will-redirect', (_, url) => {
			log(`REDIRECT: ${url}`);
		});
	}

	/* Splash */

	await win.loadFile(path.join(__dirname, '../pages/loading.html'));

	await win.webContents.session.clearStorageData();

	await waitForServer();

	sendStatus('Launching...');

	await win.loadURL(WEB_URL);

	/* Devtools only in debug */

	if (DEBUG) {
		setTimeout(() => {
			win.webContents.openDevTools({ mode: 'detach' });
		}, 1000);
	}
}

/* --------------------------------------------- */
/* App start                                     */
/* --------------------------------------------- */

app.whenReady().then(() => {
	app.setAppUserModelId('com.xernerx.app');
	createWindow();
});

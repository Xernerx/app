/** @format */

import { BrowserWindow, app, ipcMain, screen } from 'electron';

import Store from 'electron-store';
import { fileURLToPath } from 'url';
import path from 'path';

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconPath = path.join(__dirname, '../public/icon.ico');
const WEB_URL = app.isPackaged ? 'https://canary.xernerx.com' : 'https://dev.dummi.me';

let win: BrowserWindow;

function sendError(message: string) {
	if (win && !win.isDestroyed()) {
		win.webContents.send('startup:error', message);
	}
}

/* --------------------------------------------- */
/* Status messages                               */
/* --------------------------------------------- */

function sendStatus(message: string) {
	if (win && !win.isDestroyed()) {
		win.webContents.send('startup:status', message);
	}
}

/* --------------------------------------------- */
/* Wait for backend                              */
/* --------------------------------------------- */

async function waitForServer() {
	sendStatus('Connecting to the Xernerx Server...');

	let attempt = 0;

	while (true) {
		attempt++;

		try {
			const res = await fetch(`${WEB_URL}/api/v1/status`);

			if (res.ok) {
				sendStatus('Server ready');
				return;
			}

			// Retry countdown
			const delay = attempt * attempt;

			for (let s = delay; s > 0; s--) {
				sendStatus(`${res.status} ${res.statusText} — retrying in ${s}s`);
				await new Promise((r) => setTimeout(r, 1000));
			}
		} catch (error) {
			sendError(`${(error as Error).message}`);
			return;
		}
	}
}

/* --------------------------------------------- */
/* Fake updater placeholder                      */
/* --------------------------------------------- */

async function runUpdater() {
	sendStatus('Checking for updates…');

	const { autoUpdater } = (await import('electron-updater')).default;

	try {
		autoUpdater.autoDownload = true;
		autoUpdater.on('checking-for-update', () => {
			sendStatus('Checking for updates…');
		});
		autoUpdater.on('update-available', () => {
			sendStatus('Downloading update…');
		});
		autoUpdater.on('update-not-available', () => {
			sendStatus('No updates found');
		});
		autoUpdater.on('update-downloaded', () => {
			sendStatus('Installing update…');
			setTimeout(() => {
				autoUpdater.quitAndInstall();
			}, 1000);
		});
		await autoUpdater.checkForUpdates();
	} catch (error) {
		sendError((error as Error).message);
	}
}

function isBoundsVisible(bounds: Electron.Rectangle) {
	const displays = screen.getAllDisplays();

	return displays.some((display) => {
		const area = display.workArea;

		const horizontallyVisible = bounds.x < area.x + area.width && bounds.x + bounds.width > area.x;

		const verticallyVisible = bounds.y < area.y + area.height && bounds.y + bounds.height > area.y;

		return horizontallyVisible && verticallyVisible;
	});
}

/* --------------------------------------------- */
/* Window creation                               */
/* --------------------------------------------- */

async function createWindow() {
	/* Load saved window position */

	let bounds = store.get('windowBounds') as Electron.Rectangle | undefined;

	if (bounds && !isBoundsVisible(bounds)) {
		bounds = undefined;
	}

	win = new BrowserWindow({
		width: bounds?.width ?? 520,
		height: bounds?.height ?? 320,
		x: bounds?.x,
		y: bounds?.y,
		center: !bounds,

		frame: false,
		transparent: true,
		resizable: false,
		hasShadow: false,
		backgroundColor: '#00000000',
		icon: iconPath,
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	if (app.isPackaged) {
		win.webContents.on('before-input-event', (event, input) => {
			if (input.key === 'F12') {
				event.preventDefault();
			}

			if (input.control && input.shift && input.key.toLowerCase() === 'i') {
				event.preventDefault();
			}
		});

		win.webContents.on('context-menu', (e) => {
			e.preventDefault();
		});

		win.webContents.on('devtools-opened', () => {
			win.webContents.closeDevTools();
		});
	}

	/* Save window bounds when moved or resized */

	const saveBounds = () => {
		if (!win || win.isDestroyed()) return;
		if (win.isMinimized()) return;

		store.set('windowBounds', win.getBounds());
	};

	win.on('resize', saveBounds);
	win.on('move', saveBounds);

	/* Window controls */

	ipcMain.on('window:minimize', () => {
		BrowserWindow.getFocusedWindow()?.minimize();
	});

	ipcMain.on('window:maximize', () => {
		const w = BrowserWindow.getFocusedWindow();
		if (!w) return;

		if (w.isMaximized()) w.unmaximize();
		else w.maximize();
	});

	ipcMain.on('window:close', () => {
		BrowserWindow.getFocusedWindow()?.close();
	});

	ipcMain.handle('window:isMaximized', () => {
		return BrowserWindow.getFocusedWindow()?.isMaximized();
	});

	/* Splash screen */

	await win.loadFile(path.join(__dirname, '../pages/loading.html'));

	await runUpdater();
	await waitForServer();

	sendStatus('Launching Xernerx…');

	await new Promise((r) => setTimeout(r, 300));

	/* Switch from splash → main window */

	win.setResizable(true);

	if (!bounds) {
		win.setSize(1200, 800);
		win.center();
	}

	await win.loadURL(WEB_URL);
}

/* --------------------------------------------- */
/* App start                                     */
/* --------------------------------------------- */

app.whenReady().then(() => {
	app.setAppUserModelId('com.xernerx.app');
	createWindow();
});

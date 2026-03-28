/** @format */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	minimize: () => ipcRenderer.send('window:minimize'),
	maximize: () => ipcRenderer.send('window:maximize'),
	close: () => ipcRenderer.send('window:close'),
	isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
	onStatus: (callback: any) => {
		ipcRenderer.on('startup:status', (_: any, message: any) => {
			callback(message);
		});
	},
	onError: (callback: any) => {
		ipcRenderer.on('startup:error', (_: any, message: any) => {
			callback(message);
		});
	},
});

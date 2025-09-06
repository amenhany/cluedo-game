import { app, BrowserWindow } from 'electron';

import path from 'path';
import { ipcMainHandle, ipcMainOn, isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { getAllSettings, getSetting, saveSettings } from './settings.js';

app.on('ready', () => {
    const fullscreen = getSetting('fullscreen');

    const mainWindow = new BrowserWindow({
        fullscreen,
        fullscreenable: true,
        webPreferences: {
            preload: getPreloadPath(),
            contextIsolation: true,
        },
    });

    mainWindow.on('enter-full-screen', () => saveSettings({ fullscreen: true }));
    mainWindow.on('leave-full-screen', () => saveSettings({ fullscreen: false }));

    ipcMainHandle('settings:get', () => getAllSettings());
    ipcMainOn('settings:save', (settings) => saveSettings(settings));

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }
});
